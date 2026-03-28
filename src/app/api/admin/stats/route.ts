import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET - Stats globales de la plateforme Nkap Control
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
    totalInvoices,
    // Revenus plateforme = paiements d'abonnements
    platformRevenue,
    platformRevenueThisMonth,
    platformRevenueLastMonth,
    // Abonnements
    activeSubscriptions,
    subscriptionsByPlan,
    // Paiements
    totalPayments,
    pendingPayments,
    recentPayments,
    // Codes promo
    totalPromoCodes,
    activePromoCodes,
    // Utilisateurs récents
    recentUsers,
    // Nouveaux inscrits ce mois
    newUsersThisMonth,
    newUsersLastMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.invoice.count(),
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
    // Derniers inscrits
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        company: { select: { name: true } },
      },
    }),
    // Nouveaux inscrits ce mois
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    // Nouveaux inscrits mois dernier
    prisma.user.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
  ]);

  // Calculer le MRR (Monthly Recurring Revenue)
  const planPrices: Record<string, number> = { PRO: 15000, MAX: 45000 };
  const mrr = subscriptionsByPlan.reduce((sum, s) => {
    return sum + (planPrices[s.plan] || 0) * s._count.plan;
  }, 0);

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
    totalInvoices,
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
    // Utilisateurs
    recentUsers,
    newUsersThisMonth,
    userGrowth: Math.round(userGrowth),
  });
}
