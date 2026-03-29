import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { DEMO_EMAIL } from "@/lib/demo";

const SUPER_ADMIN_EMAIL = "admin@nkapcontrol.cm";
// Les comptes système ne paient pas
const EXCLUDED_EMAILS = [SUPER_ADMIN_EMAIL, DEMO_EMAIL];

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalCompanies,
    // Revenus plateforme (paiements COMPLETED)
    platformRevenue,
    platformRevenueThisMonth,
    platformRevenueLastMonth,
    // Abonnements
    activeSubscriptions,
    subscriptionsByPlan,
    // MRR basé sur les montants réels des abonnements actifs (promo inclus)
    activeSubsWithAmounts,
    // Paiements
    totalPayments,
    pendingPayments,
    recentPayments,
    // Codes promo
    totalPromoCodes,
    activePromoCodes,
    totalPromoUsages,
    // Utilisateurs récents
    recentUsers,
    newUsersThisMonth,
    newUsersLastMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    // Total revenus plateforme (paiements COMPLETED)
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    // Revenus ce mois
    prisma.payment.aggregate({
      where: { status: "COMPLETED", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    // Revenus mois dernier
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
        paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),
    // Abonnements actifs
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    // Répartition par plan
    prisma.subscription.groupBy({
      by: ["plan"],
      where: { status: "ACTIVE" },
      _count: { plan: true },
    }),
    // Tous les abonnements actifs avec leurs montants réels (pour le MRR)
    prisma.subscription.findMany({
      where: { status: "ACTIVE", plan: { not: "STARTER" } },
      select: { amount: true, plan: true },
    }),
    // Nombre total de paiements
    prisma.payment.count({ where: { status: "COMPLETED" } }),
    // Paiements en attente
    prisma.payment.count({ where: { status: "PENDING" } }),
    // Derniers paiements
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        subscription: {
          include: {
            company: { select: { name: true } },
          },
        },
      },
    }),
    // Codes promo
    prisma.promoCode.count(),
    prisma.promoCode.count({ where: { isActive: true } }),
    // Total utilisations de codes promo
    prisma.promoCodeUsage.count(),
    // Derniers inscrits avec leur abonnement
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        company: {
          select: {
            name: true,
            city: true,
            subscription: {
              select: { plan: true, status: true },
            },
          },
        },
      },
    }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
  ]);

  // MRR = somme des montants réels des abonnements actifs (prend en compte les promos)
  const mrr = activeSubsWithAmounts.reduce((sum, s) => sum + s.amount, 0);

  // Croissance revenus mois/mois
  const revenueThisMonth = platformRevenueThisMonth._sum.amount || 0;
  const revenueLastMonth = platformRevenueLastMonth._sum.amount || 0;
  const revenueGrowth =
    revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : revenueThisMonth > 0
      ? 100
      : 0;

  // Croissance utilisateurs
  const userGrowth =
    newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : newUsersThisMonth > 0
      ? 100
      : 0;

  return NextResponse.json({
    totalUsers,
    totalCompanies,
    // Revenus plateforme
    platformRevenue: platformRevenue._sum.amount || 0,
    revenueThisMonth,
    revenueLastMonth,
    revenueGrowth: Math.round(revenueGrowth),
    mrr,
    // Abonnements
    activeSubscriptions,
    subscriptionsByPlan: subscriptionsByPlan.map((s) => ({
      plan: s.plan,
      count: s._count.plan,
    })),
    // Paiements
    totalPayments,
    pendingPayments,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      paymentMethod: p.paymentMethod,
      status: p.status,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      companyName: p.subscription?.company?.name || "—",
      plan: p.subscription?.plan || "—",
    })),
    // Codes promo
    totalPromoCodes,
    activePromoCodes,
    totalPromoUsages,
    // Utilisateurs
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      companyName: u.company?.name || null,
      companyCity: u.company?.city || null,
      plan: u.company?.subscription?.status === "ACTIVE" ? u.company.subscription.plan : "STARTER",
    })),
    newUsersThisMonth,
    userGrowth: Math.round(userGrowth),
    // Comptes exclus du paiement
    excludedEmails: EXCLUDED_EMAILS,
  });
}
