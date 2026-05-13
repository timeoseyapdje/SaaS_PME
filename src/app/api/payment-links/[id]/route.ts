import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const { id } = await params;
    const link = await prisma.paymentLink.findFirst({
      where: { id, companyId },
      include: { client: true, transactions: true },
    });

    if (!link) return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    return NextResponse.json(link);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const { id } = await params;
    const existing = await prisma.paymentLink.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });

    const { title, description, status, expiresAt, maxUses } = await request.json();
    const updated = await prisma.paymentLink.update({
      where: { id },
      data: { title, description, status, expiresAt: expiresAt ? new Date(expiresAt) : null, maxUses: maxUses ? Number(maxUses) : null },
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
    const existing = await prisma.paymentLink.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });

    await prisma.paymentLinkTransaction.deleteMany({ where: { paymentLinkId: id } });
    await prisma.paymentLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
