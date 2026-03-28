import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET - Stats globales du site
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [
    totalUsers,
    totalCompanies,
    totalInvoices,
    totalRevenues,
    totalExpenses,
    totalPromoCodes,
    activePromoCodes,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.invoice.count(),
    prisma.revenue.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.promoCode.count(),
    prisma.promoCode.count({ where: { isActive: true } }),
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
  ]);

  return NextResponse.json({
    totalUsers,
    totalCompanies,
    totalInvoices,
    totalRevenues: totalRevenues._sum.amount || 0,
    totalExpenses: totalExpenses._sum.amount || 0,
    totalPromoCodes,
    activePromoCodes,
    recentUsers,
  });
}
