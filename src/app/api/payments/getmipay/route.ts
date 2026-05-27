import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiatePayIn, isGetMiPayConfigured, generateReference } from "@/lib/getmipay";

const PLAN_PRICES: Record<string, number> = {
  PRO: 3000,
  MAX: 10000,
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as { id: string; companyId?: string; email?: string };
  if (!user.companyId) {
    return NextResponse.json({ error: "Aucune entreprise" }, { status: 400 });
  }

  const { plan, phone, paymentMethod } = await req.json();
  const amount = PLAN_PRICES[plan];

  if (!amount) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  if (!isGetMiPayConfigured()) {
    return NextResponse.json({ error: "Paiement en ligne non configuré" }, { status: 503 });
  }

  if (!phone || !paymentMethod) {
    return NextResponse.json({ error: "Numéro de téléphone et méthode requis" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { companyId: user.companyId },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Aucun abonnement trouvé" }, { status: 404 });
  }

  const merchantRef = generateReference("SUB");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        currency: "XAF",
        paymentMethod: "GETMIPAY",
        status: "PENDING",
        transactionRef: merchantRef,
      },
    });

    const result = await initiatePayIn({
      amount,
      currency: "XAF",
      wallet: phone,
      description: `Abonnement ${plan} — Nkap Control`,
      customerEmail: user.email || undefined,
      callbackUrl: `${baseUrl}/api/payments/getmipay/callback?txRef=${merchantRef}&plan=${plan}`,
      paymentMethod: paymentMethod as "MTN_MONEY" | "ORANGE_MONEY",
      reference: merchantRef,
    });

    if ("transactionReference" in result) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { notchpayRef: result.transactionReference },
      });

      return NextResponse.json({ directCharge: true, reference: merchantRef });
    }

    console.error("initiatePayIn (subscription) failed:", result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (error) {
    console.error("getMIpay init error:", error);
    return NextResponse.json({ error: "Erreur lors de l'initialisation du paiement" }, { status: 500 });
  }
}
