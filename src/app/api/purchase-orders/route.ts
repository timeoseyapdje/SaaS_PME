import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotal } from "@/lib/tax";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(request: Request) {
  try {
    const result = await requirePermission("expenses", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { companyId };
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { supplier: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requirePermission("expenses", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { supplierId, notes, expectedAt, applyTVA, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Au moins un article est requis" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.description || item.description.trim() === "") {
        return NextResponse.json(
          { error: "Chaque article doit avoir une description" },
          { status: 400 }
        );
      }
      if (item.quantity <= 0 || item.unitPrice < 0) {
        return NextResponse.json(
          { error: "Quantité et prix unitaire invalides" },
          { status: 400 }
        );
      }
    }

    const count = await prisma.purchaseOrder.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `BC-${year}-${String(count + 1).padStart(4, "0")}`;

    const totalHT = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    );
    const { tva, total } = calculateInvoiceTotal(totalHT, applyTVA ?? true);

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        companyId,
        supplierId: supplierId || null,
        number,
        status: "DRAFT",
        notes: notes || null,
        expectedAt: expectedAt ? new Date(expectedAt) : null,
        applyTVA: applyTVA ?? true,
        totalHT,
        totalTVA: tva,
        totalTTC: total,
        items: {
          create: items.map(
            (item: {
              description: string;
              quantity: number;
              unitPrice: number;
              unit?: string;
            }) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unit: item.unit || null,
              total: item.quantity * item.unitPrice,
            })
          ),
        },
      },
      include: {
        supplier: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
      },
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
