import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateIS, calculateTVA, CAMEROON_TAX } from "@/lib/tax";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

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

    return NextResponse.json({ error: "Type de rapport inconnu" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
