import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const companyId = (session?.user as { companyId?: string } | undefined)?.companyId;
    if (!session?.user || !companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const link = await prisma.paymentLink.findFirst({
      where: { id, companyId },
    });

    if (!link) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    const transactions = await prisma.paymentLinkTransaction.findMany({
      where: { paymentLinkId: id },
      include: {
        payout: { select: { status: true, payoutRef: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ link, transactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
