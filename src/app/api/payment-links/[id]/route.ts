import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await requirePermission("payment_links", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;
    const link = await prisma.paymentLink.findFirst({
      where: { id, companyId },
      include: { client: true, transactions: { include: { payout: true } } },
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
    const result = await requirePermission("payment_links", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

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
    const result = await requirePermission("payment_links", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;
    const existing = await prisma.paymentLink.findFirst({ where: { id, companyId } });
    if (!existing) return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });

    const txIds = (await prisma.paymentLinkTransaction.findMany({ where: { paymentLinkId: id }, select: { id: true } })).map(t => t.id);
    if (txIds.length) await prisma.payout.deleteMany({ where: { paymentLinkTransactionId: { in: txIds } } });
    await prisma.paymentLinkTransaction.deleteMany({ where: { paymentLinkId: id } });
    await prisma.paymentLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
