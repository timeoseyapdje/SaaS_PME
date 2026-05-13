import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; txId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const { id, txId } = await params;

    const link = await prisma.paymentLink.findFirst({ where: { id, companyId } });
    if (!link) return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });

    const { status } = await request.json();

    const updated = await prisma.paymentLinkTransaction.update({
      where: { id: txId, paymentLinkId: id },
      data: {
        status,
        paidAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
