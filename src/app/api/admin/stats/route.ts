import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET - Stats globales de la plateforme Nkap Control
// Le super admin ne voit PAS les finances des utilisateurs (revenus, dépenses)
// Il voit uniquement : utilisateurs, entreprises, abonnements
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
    // Abonnements
    activeSubscriptions,
    subscriptionsByPlan,
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
    // Abonnements actifs
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    // Répartition par plan
    prisma.subscription.groupBy({
      by: ["plan"],
      where: { status: "ACTIVE" },
      _count: { plan: true },
    }),
    // Codes promo
    prisma.promoCode.count(),
    prisma.promoCode.count({ where: { isActive: true } }),
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
    // Nouveaux inscrits ce mois
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    // Nouveaux inscrits mois dernier
    prisma.user.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
  ]);

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
    // Abonnements
    activeSubscriptions,
    subscriptionsByPlan: subscriptionsByPlan.map((s) => ({
      plan: s.plan,
      count: s._count.plan,
    })),
    // Codes promo
    totalPromoCodes,
    activePromoCodes,
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
  });
}
