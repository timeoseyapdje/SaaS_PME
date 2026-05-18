import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requirePermission("products", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        stockMovements: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!product) return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requirePermission("products", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;
    const body = await request.json();
    const { name, description, sku, barcode, price, costPrice, currency, categoryId, images, unit, isActive, trackStock, stock, lowStockThreshold } = body;

    const existing = await prisma.product.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        sku,
        barcode,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : null,
        currency,
        categoryId: categoryId || null,
        images: images || [],
        unit,
        isActive,
        trackStock,
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold),
      },
      include: { category: true },
    });

    if (existing.stock !== Number(stock)) {
      const diff = Number(stock) - existing.stock;
      await prisma.stockMovement.create({
        data: {
          productId: id,
          type: diff > 0 ? "IN" : "ADJUSTMENT",
          quantity: Math.abs(diff),
          reason: "Modification manuelle",
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requirePermission("products", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;
    const existing = await prisma.product.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });

    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
