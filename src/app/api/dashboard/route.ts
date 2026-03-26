import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      invoiceRevenue,
      revenues,
      expenses,
      lastMonthInvoices,
      lastMonthRevenues,
      lastMonthExpenses,
      bankAccounts,
      pendingAmount,
      invoiceCounts,
      recentInvoices,
      pendingInvoices,
      allPaidInvoices,
      allRevenues,
      allExpenses,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { companyId, status: "PAID", paidAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      prisma.revenue.aggregate({
        where: { companyId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { companyId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { companyId, status: "PAID", paidAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { total: true },
      }),
      prisma.revenue.aggregate({
        where: { companyId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { companyId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      prisma.bankAccount.findMany({ where: { companyId } }),
      prisma.invoice.aggregate({
        where: { companyId, status: { in: ["SENT", "OVERDUE"] } },
        _sum: { total: true },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { status: true },
      }),
      prisma.invoice.findMany({
        where: { companyId },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: { companyId, status: { in: ["SENT", "OVERDUE"] } },
        include: { client: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      // Fetch all paid invoices in the 6-month range in one query
      prisma.invoice.findMany({
        where: { companyId, status: "PAID", paidAt: { gte: sixMonthsAgo } },
        select: { paidAt: true, total: true },
      }),
      // Fetch all revenues in the 6-month range in one query
      prisma.revenue.findMany({
        where: { companyId, date: { gte: sixMonthsAgo } },
        select: { date: true, amount: true },
      }),
      // Fetch all expenses in the 6-month range in one query
      prisma.expense.findMany({
        where: { companyId, date: { gte: sixMonthsAgo } },
        select: { date: true, amount: true },
      }),
    ]);

    const currentRevenue = (invoiceRevenue._sum.total || 0) + (revenues._sum.amount || 0);
    const currentExpenses = expenses._sum.amount || 0;
    const lastRevenue = (lastMonthInvoices._sum.total || 0) + (lastMonthRevenues._sum.amount || 0);
    const lastExpenses = lastMonthExpenses._sum.amount || 0;
    const totalTreasury = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Build chart data by grouping in memory instead of 18 sequential queries
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthName = monthStart.toLocaleDateString("fr-FR", { month: "short" });

      const monthInvoiceRevenue = allPaidInvoices
        .filter((inv) => inv.paidAt && inv.paidAt >= monthStart && inv.paidAt <= monthEnd)
        .reduce((sum, inv) => sum + inv.total, 0);

      const monthRevenue = allRevenues
        .filter((rev) => new Date(rev.date) >= monthStart && new Date(rev.date) <= monthEnd)
        .reduce((sum, rev) => sum + rev.amount, 0);

      const monthExpense = allExpenses
        .filter((exp) => new Date(exp.date) >= monthStart && new Date(exp.date) <= monthEnd)
        .reduce((sum, exp) => sum + exp.amount, 0);

      chartData.push({
        month: monthName,
        revenus: monthInvoiceRevenue + monthRevenue,
        depenses: monthExpense,
      });
    }

    return NextResponse.json({
      kpis: {
        revenue: { current: currentRevenue, last: lastRevenue },
        expenses: { current: currentExpenses, last: lastExpenses },
        result: {
          current: currentRevenue - currentExpenses,
          last: lastRevenue - lastExpenses,
        },
        treasury: totalTreasury,
        pendingInvoices: pendingAmount._sum.total || 0,
        pendingCount: invoiceCounts.find((c) => c.status === "SENT")?._count.status || 0,
      },
      chartData,
      recentInvoices,
      pendingInvoices,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
