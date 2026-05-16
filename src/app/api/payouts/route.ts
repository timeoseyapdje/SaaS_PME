import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    const companyId = (session?.user as { companyId?: string } | undefined)?.companyId;
    if (!session?.user || !companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const payouts = await prisma.payout.findMany({
      where: { companyId },
      include: {
        bankAccount: { select: { name: true, type: true } },
        transaction: {
          select: {
            paymentMethod: true,
            payerName: true,
            paymentLink: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(payouts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
