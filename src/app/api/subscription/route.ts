import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";
import { isDemoAccount } from "@/lib/demo";
import { initializePayment, isNotchPayConfigured } from "@/lib/notchpay";

// GET - Récupérer l'abonnement actuel
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const companyId = (session.user as { companyId?: string }).companyId;
  if (!companyId) {
    return NextResponse.json({ subscription: null, plan: "STARTER" });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          currency: true,
          paymentMethod: true,
          status: true,
          paidAt: true,
          createdAt: true,
          // Exclude: notchpayRef, transactionRef, phoneNumber
        },
      },
    },
  });

  // Strip sensitive fields from subscription
  const safeSubscription = subscription ? {
    id: subscription.id,
    plan: subscription.plan,
    status: subscription.status,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    amount: subscription.amount,
    currency: subscription.currency,
    paymentMethod: subscription.paymentMethod,
    autoRenew: subscription.autoRenew,
    payments: subscription.payments,
  } : null;

  return NextResponse.json({
    subscription: safeSubscription,
    plan: subscription?.plan || "STARTER",
  });
}

// POST - Créer ou upgrader un abonnement
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (isDemoAccount(session.user.email)) {
    return NextResponse.json({ error: "Modification non autorisée en mode démo" }, { status: 403 });
  }

  const companyId = (session.user as { companyId?: string }).companyId;
  if (!companyId) {
    return NextResponse.json({ error: "Aucune entreprise liée" }, { status: 400 });
  }

  const body = await request.json();
  const { plan, paymentMethod, phoneNumber, promoCode } = body;

  if (!plan || !["PRO", "MAX"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  if (!paymentMethod) {
    return NextResponse.json({ error: "Méthode de paiement requise" }, { status: 400 });
  }

  const planPrices: Record<string, number> = {
    PRO: 3000,
    MAX: 10000,
  };

  let finalAmount = planPrices[plan];
  let promoCodeId: string | null = null;
  let subscriptionMonths = 1; // Par défaut 1 mois

  // Vérifier le code promo
  if (promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode },
    });

    if (promo && promo.isActive) {
      const now = new Date();
      const isValid =
        (!promo.startDate || promo.startDate <= now) &&
        (!promo.endDate || promo.endDate > now) &&
        (!promo.maxUses || promo.currentUses < promo.maxUses);

      if (isValid) {
        // Appliquer la durée de l'avantage
        subscriptionMonths = promo.benefitMonths || 1;

        if (promo.discountType === "PERCENTAGE") {
          finalAmount = finalAmount * (1 - promo.discountValue / 100);
        } else {
          finalAmount = Math.max(0, finalAmount - promo.discountValue);
        }
        promoCodeId = promo.id;

        // Incrémenter l'utilisation
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { currentUses: { increment: 1 } },
        });

        await prisma.promoCodeUsage.create({
          data: {
            promoCodeId: promo.id,
            userId: (session.user as { id: string }).id,
          },
        });
      }
    }
  }

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + subscriptionMonths);

  // Créer ou mettre à jour l'abonnement
  const subscription = await prisma.subscription.upsert({
    where: { companyId },
    update: {
      plan: plan as "PRO" | "MAX",
      amount: finalAmount,
      paymentMethod: paymentMethod as "MTN_MONEY" | "ORANGE_MONEY" | "VIREMENT" | "CARTE_BANCAIRE",
      promoCodeId,
      status: "ACTIVE",
      startDate: new Date(),
      endDate,
    },
    create: {
      companyId,
      plan: plan as "PRO" | "MAX",
      amount: finalAmount,
      currency: "XAF",
      paymentMethod: paymentMethod as "MTN_MONEY" | "ORANGE_MONEY" | "VIREMENT" | "CARTE_BANCAIRE",
      promoCodeId,
      status: "ACTIVE",
      endDate,
    },
  });

  const isMobileMoney = ["MTN_MONEY", "ORANGE_MONEY"].includes(paymentMethod);

  // For mobile money with NotchPay: create PENDING payment and redirect to checkout
  if (isMobileMoney && isNotchPayConfigured()) {
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: finalAmount,
        currency: "XAF",
        paymentMethod: paymentMethod as "MTN_MONEY" | "ORANGE_MONEY" | "VIREMENT" | "CARTE_BANCAIRE",
        phoneNumber: phoneNumber || null,
        status: "PENDING",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";
    const notchpay = await initializePayment({
      email: session.user.email!,
      amount: finalAmount,
      currency: "XAF",
      reference: payment.id,
      description: `Abonnement Nkap Control - Plan ${plan}`,
      callbackUrl: `${appUrl}/api/payments/webhook`,
    });

    if (notchpay) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { transactionRef: notchpay.reference },
      });
      return NextResponse.json({ subscription, payment, checkoutUrl: notchpay.checkoutUrl });
    }
  }

  // Fallback: direct completion for virement/carte or if NotchPay not configured
  const payment = await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount: finalAmount,
      currency: "XAF",
      paymentMethod: paymentMethod as "MTN_MONEY" | "ORANGE_MONEY" | "VIREMENT" | "CARTE_BANCAIRE",
      phoneNumber: phoneNumber || null,
      status: paymentMethod === "VIREMENT" ? "PENDING" : "COMPLETED",
      paidAt: paymentMethod !== "VIREMENT" ? new Date() : null,
    },
  });

  if (payment.status === "COMPLETED") {
    const userEmail = session.user.email;
    const userName = session.user.name || "Utilisateur";
    if (userEmail) {
      sendSubscriptionConfirmationEmail({
        to: userEmail,
        userName,
        plan,
        amount: finalAmount,
        paymentMethod,
        endDate: endDate.toISOString(),
      }).catch((err) => console.error("Erreur envoi email confirmation:", err));
    }
  }

  return NextResponse.json({ subscription, payment });
}

// DELETE - Résilier l'abonnement
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (isDemoAccount(session.user.email)) {
    return NextResponse.json({ error: "Modification non autorisée en mode démo" }, { status: 403 });
  }

  const companyId = (session.user as { companyId?: string }).companyId;
  if (!companyId) {
    return NextResponse.json({ error: "Aucune entreprise liée" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Aucun abonnement trouvé" }, { status: 404 });
  }

  if (subscription.plan === "STARTER") {
    return NextResponse.json({ error: "Vous êtes déjà sur le plan gratuit" }, { status: 400 });
  }

  // Résilier : l'abonnement reste actif jusqu'à la date de fin
  await prisma.subscription.update({
    where: { companyId },
    data: {
      status: "CANCELLED",
      autoRenew: false,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Abonnement résilié. Vous conservez l'accès au plan ${subscription.plan} jusqu'au ${subscription.endDate ? new Date(subscription.endDate).toLocaleDateString("fr-FR") : "fin de période"}.`,
    endDate: subscription.endDate,
  });
}
