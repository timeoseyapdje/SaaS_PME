import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

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
      },
    },
  });

  return NextResponse.json({
    subscription,
    plan: subscription?.plan || "STARTER",
  });
}

// POST - Créer ou upgrader un abonnement
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
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
    PRO: 5000,
    MAX: 15000,
  };

  let finalAmount = planPrices[plan];
  let promoCodeId: string | null = null;

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
  endDate.setMonth(endDate.getMonth() + 1);

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

  // Créer le paiement
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

  // Envoyer email de confirmation si paiement complété
  if (payment.status === "COMPLETED") {
    const userEmail = session.user.email;
    const userName = session.user.name || "Utilisateur";
    if (userEmail) {
      // Envoi asynchrone sans bloquer la réponse
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
