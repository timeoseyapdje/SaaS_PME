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
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const lowStock = searchParams.get("lowStock");
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = { companyId };
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null && isActive !== "") where.isActive = isActive === "true";
    if (lowStock === "true") {
      where.trackStock = true;
      where.stock = { lte: prisma.product.fields.lowStockThreshold };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
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
    const { name, description, sku, barcode, price, costPrice, currency, categoryId, images, unit, trackStock, stock, lowStockThreshold } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Nom et prix obligatoires" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        companyId,
        name,
        description,
        sku,
        barcode,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : null,
        currency: currency || "XAF",
        categoryId: categoryId || null,
        images: images || [],
        unit: unit || "piece",
        trackStock: trackStock !== false,
        stock: Number(stock) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 5,
      },
      include: { category: true },
    });

    if (stock > 0) {
      await prisma.stockMovement.create({
        data: { productId: product.id, type: "IN", quantity: Number(stock), reason: "Stock initial" },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
