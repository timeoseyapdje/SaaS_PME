import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isDemoAccount } from "@/lib/demo";

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
          // Exclude: providerRef, transactionRef, phoneNumber
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

// Les abonnements payants passent uniquement par /api/payments/getmipay.

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
