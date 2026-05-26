import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requirePermission("invoices", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;

    const template = await prisma.invoiceTemplate.findFirst({
      where: { id, companyId },
      include: { items: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Modèle introuvable" }, { status: 404 });
    }

    return NextResponse.json(template);
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
    const result = await requirePermission("invoices", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;

    const existing = await prisma.invoiceTemplate.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Modèle introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, notes, paymentTerms, applyTVA, items } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type === "QUOTE" ? "QUOTE" : "INVOICE";
    if (notes !== undefined) updateData.notes = notes;
    if (paymentTerms !== undefined) updateData.paymentTerms = paymentTerms;
    if (applyTVA !== undefined) updateData.applyTVA = applyTVA;

    if (items && Array.isArray(items)) {
      // Delete all existing items and recreate
      await prisma.invoiceTemplateItem.deleteMany({ where: { templateId: id } });
      updateData.items = {
        create: items.map(
          (item: {
            description: string;
            quantity: number;
            unitPrice: number;
            unit?: string;
          }) => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice,
            unit: item.unit || null,
          })
        ),
      };
    }

    const template = await prisma.invoiceTemplate.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requirePermission("invoices", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;

    const existing = await prisma.invoiceTemplate.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Modèle introuvable" }, { status: 404 });
    }

    // Items are cascade-deleted by the schema
    await prisma.invoiceTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
