import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const { id } = await params;
    const { status } = await request.json();

    const order = await prisma.order.findFirst({
      where: { id, companyId },
      include: { items: { include: { product: true } } },
    });
    if (!order) return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });

    const updateData: Record<string, unknown> = { status };
    if (status === "DELIVERED") updateData.deliveredAt = new Date();
    if (status === "PAID") updateData.paidAt = new Date();
    if (status === "CANCELLED") updateData.cancelledAt = new Date();

    // On CONFIRMED: deduct stock
    if (status === "CONFIRMED" && order.status === "PENDING") {
      for (const item of order.items) {
        if (item.productId && item.product?.trackStock) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: Math.ceil(item.quantity) } },
          });
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              type: "OUT",
              quantity: Math.ceil(item.quantity),
              reason: `Commande ${order.number}`,
              orderId: order.id,
            },
          });
        }
      }
    }

    // On CANCELLED or RETURNED: restore stock if was CONFIRMED+
    if ((status === "CANCELLED" || status === "RETURNED") && ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) {
      for (const item of order.items) {
        if (item.productId && item.product?.trackStock) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: Math.ceil(item.quantity) } },
          });
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              type: "RETURN",
              quantity: Math.ceil(item.quantity),
              reason: `Annulation commande ${order.number}`,
              orderId: order.id,
            },
          });
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { client: true, items: { include: { product: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
