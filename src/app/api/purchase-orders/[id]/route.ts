import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotal } from "@/lib/tax";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("expenses", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id, companyId },
      include: {
        supplier: true,
        items: true,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ error: "Bon de commande non trouvé" }, { status: 404 });
    }

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("expenses", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { status, notes, expectedAt, supplierId, applyTVA, items } = body;

    const existing = await prisma.purchaseOrder.findFirst({ where: { id, companyId } });
    if (!existing) {
      return NextResponse.json({ error: "Bon de commande non trouvé" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (expectedAt !== undefined) updateData.expectedAt = expectedAt ? new Date(expectedAt) : null;
    if (supplierId !== undefined) updateData.supplierId = supplierId || null;
    if (applyTVA !== undefined) updateData.applyTVA = applyTVA;

    if (items && items.length > 0) {
      const totalHT = items.reduce(
        (sum: number, item: { quantity: number; unitPrice: number }) =>
          sum + item.quantity * item.unitPrice,
        0
      );
      const { tva, total } = calculateInvoiceTotal(
        totalHT,
        applyTVA !== undefined ? applyTVA : existing.applyTVA
      );
      updateData.totalHT = totalHT;
      updateData.totalTVA = tva;
      updateData.totalTTC = total;

      await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
      await prisma.purchaseOrderItem.createMany({
        data: items.map(
          (item: {
            description: string;
            quantity: number;
            unitPrice: number;
            unit?: string;
          }) => ({
            purchaseOrderId: id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit || null,
            total: item.quantity * item.unitPrice,
          })
        ),
      });
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        items: true,
      },
    });

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("expenses", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const purchaseOrder = await prisma.purchaseOrder.findFirst({ where: { id, companyId } });
    if (!purchaseOrder) {
      return NextResponse.json({ error: "Bon de commande non trouvé" }, { status: 404 });
    }

    if (!["DRAFT", "CANCELLED"].includes(purchaseOrder.status)) {
      return NextResponse.json(
        { error: "Seuls les bons de commande en brouillon ou annulés peuvent être supprimés" },
        { status: 400 }
      );
    }

    await prisma.purchaseOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
