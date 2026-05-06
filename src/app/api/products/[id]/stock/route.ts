import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const { id } = await params;
    const { type, quantity, reason } = await request.json();

    if (!type || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Type et quantité requis" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({ where: { id, companyId } });
    if (!product) return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });

    let newStock = product.stock;
    if (type === "IN" || type === "RETURN") {
      newStock += Number(quantity);
    } else if (type === "OUT" || type === "ADJUSTMENT") {
      newStock = Math.max(0, newStock - Number(quantity));
    }

    const [movement, updated] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: { productId: id, type, quantity: Number(quantity), reason },
      }),
      prisma.product.update({ where: { id }, data: { stock: newStock } }),
    ]);

    return NextResponse.json({ movement, stock: updated.stock });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
