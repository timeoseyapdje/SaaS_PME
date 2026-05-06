import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { companyId };
    if (status && status !== "ALL") where.status = status;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const body = await request.json();
    const { clientId, items, notes, currency, applyTVA, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Au moins un article requis" }, { status: 400 });
    }

    const subtotal = items.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
    const tvaRate = 0.1925;
    const tvaAmount = applyTVA ? subtotal * tvaRate : 0;
    const total = subtotal + tvaAmount;

    const count = await prisma.order.count({ where: { companyId } });
    const number = `CMD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(count + 1).padStart(4, "0")}`;

    const order = await prisma.order.create({
      data: {
        companyId,
        clientId: clientId || null,
        number,
        currency: currency || "XAF",
        subtotal,
        tvaRate,
        tvaAmount,
        total,
        applyTVA: applyTVA !== false,
        paymentMethod: paymentMethod || null,
        notes,
        items: {
          create: items.map((item: { productId?: string; description: string; quantity: number; unitPrice: number; total: number }) => ({
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        client: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
