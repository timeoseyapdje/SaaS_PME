import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializePayment, generateReference } from "@/lib/notchpay";

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

  const { plan } = await req.json();
  const amount = PLAN_PRICES[plan];

  if (!amount) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
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
    const result = await initializePayment({
      amount,
      currency: "XAF",
      email: user.email || "",
      description: `Abonnement ${plan} — Nkap Control`,
      reference: merchantRef,
      callbackUrl: `${baseUrl}/api/payments/notchpay/callback?merchant_ref=${merchantRef}&plan=${plan}`,
    });

    if (result) {
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount,
          currency: "XAF",
          paymentMethod: "NOTCHPAY",
          status: "PENDING",
          notchpayRef: result.reference,
          transactionRef: merchantRef,
        },
      });

      return NextResponse.json({
        authorizationUrl: result.checkoutUrl,
        reference: result.reference,
      });
    }

    return NextResponse.json({ error: "Erreur NotchPay" }, { status: 500 });
  } catch (error) {
    console.error("NotchPay init error:", error);
    return NextResponse.json({ error: "Erreur lors de l'initialisation du paiement" }, { status: 500 });
  }
}
