import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const link = await prisma.paymentLink.findUnique({
      where: { slug },
      include: {
        company: { select: { name: true, phone: true, email: true, logo: true, city: true } },
        client: { select: { name: true, email: true } },
      },
    });

    if (!link) return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    if (link.status !== "ACTIVE") return NextResponse.json({ error: "Ce lien de paiement est désactivé" }, { status: 410 });
    if (link.expiresAt && link.expiresAt < new Date()) {
      await prisma.paymentLink.update({ where: { slug }, data: { status: "EXPIRED" } });
      return NextResponse.json({ error: "Ce lien de paiement a expiré" }, { status: 410 });
    }
    if (link.maxUses && link.currentUses >= link.maxUses) {
      return NextResponse.json({ error: "Ce lien a atteint son nombre maximum d'utilisations" }, { status: 410 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const link = await prisma.paymentLink.findUnique({ where: { slug } });

    if (!link || link.status !== "ACTIVE") {
      return NextResponse.json({ error: "Lien invalide ou désactivé" }, { status: 404 });
    }

    const { paymentMethod, phoneNumber, payerName } = await request.json();

    if (!paymentMethod) {
      return NextResponse.json({ error: "Méthode de paiement requise" }, { status: 400 });
    }

    const transaction = await prisma.paymentLinkTransaction.create({
      data: {
        paymentLinkId: link.id,
        amount: link.amount,
        paymentMethod,
        phoneNumber,
        payerName,
        status: "PENDING",
      },
    });

    await prisma.paymentLink.update({
      where: { slug },
      data: { currentUses: { increment: 1 } },
    });

    return NextResponse.json({ transaction, message: "Transaction enregistrée. Le marchand vous contactera pour confirmation." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
