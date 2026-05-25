import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateIS, calculateTVA, CAMEROON_TAX } from "@/lib/tax";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(request: Request) {
  try {
    const result = await requirePermission("reports", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "resultat";
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    if (type === "resultat") {
      // Compte de résultat
      const [invoicePaidRevenues, otherRevenues, expensesByCategory] =
        await Promise.all([
          prisma.invoice.aggregate({
            where: {
              companyId,
              status: "PAID",
              paidAt: { gte: startOfYear, lte: endOfYear },
            },
            _sum: { subtotal: true, tvaAmount: true, total: true },
          }),
          prisma.revenue.findMany({
            where: { companyId, date: { gte: startOfYear, lte: endOfYear } },
          }),
          prisma.expense.groupBy({
            by: ["category"],
            where: { companyId, date: { gte: startOfYear, lte: endOfYear } },
            _sum: { amount: true },
          }),
        ]);

      const invoiceSubtotal = invoicePaidRevenues._sum.subtotal || 0;
      const otherRevenueTotal = otherRevenues.reduce(
        (sum, r) => sum + r.amount,
        0
      );
      const totalRevenue = invoiceSubtotal + otherRevenueTotal;

      const expenseMap: Record<string, number> = {};
      let totalExpenses = 0;
      for (const e of expensesByCategory) {
        expenseMap[e.category] = e._sum.amount || 0;
        totalExpenses += e._sum.amount || 0;
      }

      const netProfit = totalRevenue - totalExpenses;
      const estimatedIS = calculateIS(netProfit);
      const tvaCollectee = invoicePaidRevenues._sum.tvaAmount || 0;

      // Monthly breakdown
      const monthlyData = [];
      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(year, m, 1);
        const monthEnd = new Date(year, m + 1, 0);
        const monthName = monthStart.toLocaleDateString("fr-FR", {
          month: "long",
        });

        const [mInvoices, mRevenues, mExpenses] = await Promise.all([
          prisma.invoice.aggregate({
            where: {
              companyId,
              status: "PAID",
              paidAt: { gte: monthStart, lte: monthEnd },
            },
            _sum: { subtotal: true },
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

        const mRevTotal =
          (mInvoices._sum.subtotal || 0) + (mRevenues._sum.amount || 0);
        const mExpTotal = mExpenses._sum.amount || 0;

        monthlyData.push({
          month: monthName,
          revenus: mRevTotal,
          depenses: mExpTotal,
          resultat: mRevTotal - mExpTotal,
        });
      }

      return NextResponse.json({
        type: "resultat",
        period: year,
        totalRevenue,
        invoiceRevenue: invoiceSubtotal,
        otherRevenue: otherRevenueTotal,
        totalExpenses,
        expensesByCategory: expenseMap,
        netProfit,
        tvaCollectee,
        tvaRate: CAMEROON_TAX.TVA_RATE,
        estimatedIS,
        isRate: CAMEROON_TAX.IS_RATE,
        monthlyData,
      });
    }

    if (type === "bilan") {
      // Bilan simplifié
      const [bankAccounts, pendingInvoices, pendingExpenses] = await Promise.all([
        prisma.bankAccount.findMany({ where: { companyId } }),
        prisma.invoice.aggregate({
          where: { companyId, status: { in: ["SENT", "OVERDUE"] } },
          _sum: { total: true },
        }),
        prisma.expense.aggregate({
          where: {
            companyId,
            date: { gte: startOfYear, lte: endOfYear },
          },
          _sum: { amount: true },
        }),
      ]);

      const cashTotal = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
      const receivables = pendingInvoices._sum.total || 0;

      const [totalRevenue, totalExpenses] = await Promise.all([
        prisma.invoice.aggregate({
          where: { companyId, status: "PAID" },
          _sum: { subtotal: true },
        }),
        prisma.expense.aggregate({
          where: { companyId },
          _sum: { amount: true },
        }),
      ]);

      const equity =
        (totalRevenue._sum.subtotal || 0) -
        (totalExpenses._sum.amount || 0);

      return NextResponse.json({
        type: "bilan",
        period: year,
        assets: {
          cash: cashTotal,
          receivables,
          total: cashTotal + receivables,
        },
        liabilities: {
          payables: pendingExpenses._sum.amount || 0,
          total: pendingExpenses._sum.amount || 0,
        },
        equity: Math.max(0, equity),
      });
    }

    if (type === "fiscalite") {
      // Fiscalité summary
      const [paidInvoices, paidExpenses] = await Promise.all([
        prisma.invoice.findMany({
          where: {
            companyId,
            status: "PAID",
            paidAt: { gte: startOfYear, lte: endOfYear },
          },
          select: { subtotal: true, tvaAmount: true, applyTVA: true },
        }),
        prisma.expense.aggregate({
          where: { companyId, date: { gte: startOfYear, lte: endOfYear } },
          _sum: { amount: true },
        }),
      ]);

      const tvaCollectee = paidInvoices.reduce(
        (sum, inv) => sum + inv.tvaAmount,
        0
      );
      const totalHT = paidInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
      const tvaDeductible = calculateTVA(paidExpenses._sum.amount || 0);
      const tvaNette = tvaCollectee - tvaDeductible;

      const taxDeclarations = await prisma.taxDeclaration.findMany({
        where: { companyId },
        orderBy: { dueDate: "desc" },
        take: 10,
      });

      return NextResponse.json({
        type: "fiscalite",
        period: year,
        tva: {
          collectee: tvaCollectee,
          deductible: tvaDeductible,
          nette: tvaNette,
          tauxTVA: CAMEROON_TAX.TVA_RATE * 100,
        },
        is: {
          baseImposable: totalHT - (paidExpenses._sum.amount || 0),
          taux: CAMEROON_TAX.IS_RATE * 100,
          estimee: calculateIS(
            Math.max(0, totalHT - (paidExpenses._sum.amount || 0))
          ),
        },
        declarations: taxDeclarations,
        prochainEcheanceTVA: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          15
        ),
      });
    }

    if (type === "tva-detail") {
      // Detailed TVA data with monthly breakdown
      const [sentPaidInvoices, allExpenses] = await Promise.all([
        prisma.invoice.findMany({
          where: {
            companyId,
            status: { in: ["SENT", "PAID"] },
            issueDate: { gte: startOfYear, lte: endOfYear },
          },
          select: {
            subtotal: true,
            tvaAmount: true,
            applyTVA: true,
            issueDate: true,
            paidAt: true,
            status: true,
          },
        }),
        prisma.expense.findMany({
          where: {
            companyId,
            date: { gte: startOfYear, lte: endOfYear },
          },
          select: { amount: true, date: true },
        }),
      ]);

      const tvaRate = CAMEROON_TAX.TVA_RATE;

      const tvaCollectee = sentPaidInvoices.reduce(
        (sum, inv) => sum + inv.tvaAmount,
        0
      );
      const totalExpensesForTVA = allExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
      );
      const tvaDeductible = calculateTVA(totalExpensesForTVA);
      const tvaSolde = tvaCollectee - tvaDeductible;

      // Monthly breakdown
      const monthlyTVA = [];
      for (let m = 0; m < 12; m++) {
        const monthStart = new Date(year, m, 1);
        const monthEnd = new Date(year, m + 1, 0, 23, 59, 59);
        const monthLabel = monthStart.toLocaleDateString("fr-FR", { month: "long" });

        const monthInvoices = sentPaidInvoices.filter((inv) => {
          const d = inv.issueDate;
          return d >= monthStart && d <= monthEnd;
        });
        const monthExpenses = allExpenses.filter((e) => {
          return e.date >= monthStart && e.date <= monthEnd;
        });

        const mCollectee = monthInvoices.reduce((sum, inv) => sum + inv.tvaAmount, 0);
        const mExpAmt = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const mDeductible = calculateTVA(mExpAmt);

        monthlyTVA.push({
          period: monthLabel,
          tvaCollectee: mCollectee,
          tvaDeductible: mDeductible,
          solde: mCollectee - mDeductible,
        });
      }

      return NextResponse.json({
        type: "tva-detail",
        period: year,
        tvaRate: tvaRate * 100,
        tvaCollectee,
        tvaDeductible,
        tvaSolde,
        monthlyBreakdown: monthlyTVA,
      });
    }

    if (type === "is-detail") {
      // IS detail with full breakdown
      const [paidInvoices, otherRevenues, allExpenses] = await Promise.all([
        prisma.invoice.aggregate({
          where: {
            companyId,
            status: "PAID",
            paidAt: { gte: startOfYear, lte: endOfYear },
          },
          _sum: { subtotal: true },
        }),
        prisma.revenue.aggregate({
          where: { companyId, date: { gte: startOfYear, lte: endOfYear } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { companyId, date: { gte: startOfYear, lte: endOfYear } },
          _sum: { amount: true },
        }),
      ]);

      const chiffreAffaires =
        (paidInvoices._sum.subtotal || 0) + (otherRevenues._sum.amount || 0);
      const chargesDeductibles = allExpenses._sum.amount || 0;
      const resultatNet = chiffreAffaires - chargesDeductibles;
      const tauxIS = CAMEROON_TAX.IS_RATE;
      const isEstime = resultatNet > 0 ? resultatNet * tauxIS : 0;

      return NextResponse.json({
        type: "is-detail",
        period: year,
        chiffreAffaires,
        chargesDeductibles,
        resultatNet,
        tauxIS: tauxIS * 100,
        isEstime,
      });
    }

    if (type === "cashflow-forecast") {
      // Cash flow forecast for next 90 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end90 = new Date(today);
      end90.setDate(end90.getDate() + 90);

      // Unpaid invoices with future due dates (SENT or OVERDUE)
      const pendingInvoices = await prisma.invoice.findMany({
        where: {
          companyId,
          status: { in: ["SENT", "OVERDUE"] },
          dueDate: { gte: today, lte: end90 },
        },
        select: {
          id: true,
          number: true,
          total: true,
          dueDate: true,
          status: true,
          client: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
      });

      // Recurring expenses: fetch last 3 months and compute monthly average
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const recentExpenses = await prisma.expense.aggregate({
        where: {
          companyId,
          date: { gte: threeMonthsAgo, lte: today },
        },
        _sum: { amount: true },
        _count: true,
      });

      const totalRecentExpenses = recentExpenses._sum.amount || 0;
      const monthlyExpenseAvg = totalRecentExpenses / 3;
      const weeklyExpenseAvg = monthlyExpenseAvg / 4.33;

      // Build weekly buckets (13 weeks covers 91 days)
      const weeks: Array<{
        weekLabel: string;
        weekStart: string;
        weekEnd: string;
        entrees: number;
        sorties: number;
        invoices: Array<{ id: string; number: string; client: string; amount: number; dueDate: string }>;
      }> = [];

      for (let w = 0; w < 13; w++) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() + w * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        if (weekStart > end90) break;

        const effectiveEnd = weekEnd > end90 ? end90 : weekEnd;

        const weekInvoices = pendingInvoices.filter((inv) => {
          return inv.dueDate >= weekStart && inv.dueDate <= effectiveEnd;
        });

        const entrees = weekInvoices.reduce((sum, inv) => sum + inv.total, 0);

        const weekNum = w + 1;
        const weekLabel = `Sem. ${weekNum} (${weekStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })})`;

        weeks.push({
          weekLabel,
          weekStart: weekStart.toISOString().split("T")[0],
          weekEnd: effectiveEnd.toISOString().split("T")[0],
          entrees,
          sorties: weeklyExpenseAvg,
          invoices: weekInvoices.map((inv) => ({
            id: inv.id,
            number: inv.number,
            client: inv.client?.name || "—",
            amount: inv.total,
            dueDate: inv.dueDate.toISOString().split("T")[0],
          })),
        });
      }

      // Add cumulative running total
      let cumulative = 0;
      const weeksWithCumulative = weeks.map((w) => {
        cumulative += w.entrees - w.sorties;
        return { ...w, cumulatif: cumulative };
      });

      // Raw inflows list
      const rawInflows = pendingInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        client: inv.client?.name || "—",
        amount: inv.total,
        dueDate: inv.dueDate.toISOString().split("T")[0],
        status: inv.status,
      }));

      return NextResponse.json({
        type: "cashflow-forecast",
        generatedAt: today.toISOString(),
        forecastEnd: end90.toISOString(),
        monthlyExpenseAvg,
        weeklyExpenseAvg,
        totalExpectedInflows: pendingInvoices.reduce((sum, inv) => sum + inv.total, 0),
        rawInflows,
        weeklyData: weeksWithCumulative,
      });
    }

    return NextResponse.json({ error: "Type de rapport inconnu" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
