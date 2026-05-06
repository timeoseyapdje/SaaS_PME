import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const { id } = await params;
    const { name, description, parentId } = await request.json();

    const existing = await prisma.category.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });

    const updated = await prisma.category.update({
      where: { id },
      data: { name, description, parentId: parentId || null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const { id } = await params;
    const existing = await prisma.category.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });

    await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
