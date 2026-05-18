import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requirePermission("orders", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        items: { include: { product: { select: { id: true, name: true, sku: true, unit: true } } } },
      },
    });

    if (!order) return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requirePermission("orders", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;
    const existing = await prisma.order.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });

    const body = await request.json();
    const { notes, paymentMethod } = body;

    const updated = await prisma.order.update({
      where: { id },
      data: { notes, paymentMethod: paymentMethod || null },
      include: { client: true, items: { include: { product: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requirePermission("orders", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;
    const existing = await prisma.order.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });

    await prisma.order.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
