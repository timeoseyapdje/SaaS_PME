import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string)
  : null;

const PLAN_PRICES: Record<string, number> = {
  PRO: 5000,
  MAX: 15000,
};

// POST - Créer une session de paiement Stripe
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Le paiement par carte n'est pas encore configuré" },
        { status: 503 }
      );
    }

    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 400 });
    }

    const { plan, promoCode } = await request.json();

    if (!plan || !["PRO", "MAX"].includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    let finalAmount = PLAN_PRICES[plan];

    // Vérifier le code promo
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode },
      });

      if (promo && promo.isActive) {
        const now = new Date();
        const isValid =
          (!promo.endDate || promo.endDate > now) &&
          (!promo.maxUses || promo.currentUses < promo.maxUses);

        if (isValid) {
          if (promo.discountType === "PERCENTAGE") {
            finalAmount = Math.round(finalAmount * (1 - promo.discountValue / 100));
          } else {
            finalAmount = Math.max(0, finalAmount - promo.discountValue);
          }
        }
      }
    }

    // Convertir XAF en EUR pour Stripe (1 EUR = 655.957 XAF)
    const amountInEurCents = Math.round((finalAmount / 655.957) * 100);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkap-control.vercel.app";

    // Créer la session Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Nkap Control - Plan ${plan}`,
              description: `Abonnement mensuel au plan ${plan} (${finalAmount.toLocaleString()} XAF)`,
            },
            unit_amount: amountInEurCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        companyId,
        userId: (session.user as { id: string }).id,
        plan,
        amountXAF: String(finalAmount),
        promoCode: promoCode || "",
      },
      success_url: `${appUrl}/subscription?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/subscription?cancelled=true`,
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du paiement" }, { status: 500 });
  }
}
