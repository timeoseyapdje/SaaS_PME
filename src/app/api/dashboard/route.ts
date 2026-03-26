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

    const [
      invoiceRevenue,
      revenues,
      expenses,
      lastMonthInvoices,
      lastMonthExpenses,
      bankAccounts,
      pendingAmount,
      invoiceCounts,
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
        where: {
          companyId,
          status: "PAID",
          paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { total: true },
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
    ]);

    const currentRevenue =
      (invoiceRevenue._sum.total || 0) + (revenues._sum.amount || 0);
    const currentExpenses = expenses._sum.amount || 0;
    const lastRevenue = lastMonthInvoices._sum.total || 0;
    const lastExpenses = lastMonthExpenses._sum.amount || 0;
    const totalTreasury = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Monthly chart data (last 6 months)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString("fr-FR", { month: "short" });

      const [mInvoices, mRevenues, mExpenses] = await Promise.all([
        prisma.invoice.aggregate({
          where: {
            companyId,
            status: "PAID",
            paidAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { total: true },
        }),
        prisma.revenue.aggregate({
          where: { companyId, date: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { companyId, date: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        }),
      ]);

      chartData.push({
        month: monthName,
        revenus: (mInvoices._sum.total || 0) + (mRevenues._sum.amount || 0),
        depenses: mExpenses._sum.amount || 0,
      });
    }

    // Recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { companyId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Pending invoices (upcoming due dates)
    const pendingInvoices = await prisma.invoice.findMany({
      where: { companyId, status: { in: ["SENT", "OVERDUE"] } },
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

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
        pendingCount:
          invoiceCounts.find((c) => c.status === "SENT")?._count.status || 0,
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
