import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/currency";

export async function buildFinancialContext(companyId: string): Promise<string> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const monthName = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const [
    company,
    invoiceRevenue,
    directRevenues,
    currentExpenses,
    lastMonthInvoiceRev,
    lastMonthDirectRev,
    lastMonthExp,
    bankAccounts,
    recentInvoices,
    overdueInvoices,
    pendingInvoices,
    expensesByCategory,
    revenuesByCategory,
    clients,
    totalInvoiceCount,
    topClients,
  ] = await Promise.all([
    // Company info
    prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, currency: true, city: true, taxId: true },
    }),
    // Current month paid invoices
    prisma.invoice.aggregate({
      where: { companyId, status: "PAID", paidAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    // Current month direct revenues
    prisma.revenue.aggregate({
      where: { companyId, date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    // Current month expenses
    prisma.expense.aggregate({
      where: { companyId, date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    // Last month invoice revenue
    prisma.invoice.aggregate({
      where: { companyId, status: "PAID", paidAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { total: true },
    }),
    // Last month direct revenues
    prisma.revenue.aggregate({
      where: { companyId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    }),
    // Last month expenses
    prisma.expense.aggregate({
      where: { companyId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    }),
    // Bank accounts
    prisma.bankAccount.findMany({
      where: { companyId },
      select: { name: true, type: true, balance: true, currency: true, bankName: true },
    }),
    // Recent invoices (last 10)
    prisma.invoice.findMany({
      where: { companyId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Overdue invoices
    prisma.invoice.findMany({
      where: { companyId, status: "OVERDUE" },
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    }),
    // Pending invoices
    prisma.invoice.findMany({
      where: { companyId, status: "SENT" },
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    }),
    // Expenses grouped by category (current month)
    prisma.expense.groupBy({
      by: ["category"],
      where: { companyId, date: { gte: startOfMonth } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    // Revenues grouped by category (current month)
    prisma.revenue.groupBy({
      by: ["category"],
      where: { companyId, date: { gte: startOfMonth } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    // Clients count
    prisma.client.findMany({
      where: { companyId },
      select: { name: true, email: true, phone: true },
      take: 20,
    }),
    // Total invoices
    prisma.invoice.count({ where: { companyId } }),
    // Top clients by revenue
    prisma.invoice.groupBy({
      by: ["clientId"],
      where: { companyId, status: "PAID" },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
  ]);

  const currency = company?.currency || "XAF";
  const currentRev = (invoiceRevenue._sum.total || 0) + (directRevenues._sum.amount || 0);
  const currentExp = currentExpenses._sum.amount || 0;
  const lastRev = (lastMonthInvoiceRev._sum.total || 0) + (lastMonthDirectRev._sum.amount || 0);
  const lastExp = lastMonthExp._sum.amount || 0;
  const totalTreasury = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  const revChange = lastRev > 0 ? ((currentRev - lastRev) / lastRev * 100).toFixed(1) : "N/A";
  const expChange = lastExp > 0 ? ((currentExp - lastExp) / lastExp * 100).toFixed(1) : "N/A";

  // Fetch client names for top clients
  const topClientIds = topClients.map(tc => tc.clientId);
  const topClientNames = topClientIds.length > 0
    ? await prisma.client.findMany({
        where: { id: { in: topClientIds } },
        select: { id: true, name: true },
      })
    : [];

  const sections: string[] = [];

  // Company
  sections.push(`=== ENTREPRISE ===
Nom: ${company?.name || "Non défini"}
Ville: ${company?.city || "Non défini"}
NIU: ${company?.taxId || "Non défini"}
Devise: ${currency} (FCFA)`);

  // KPIs
  sections.push(`=== KPIs DU MOIS (${monthName}) ===
Revenus totaux: ${formatCurrency(currentRev, currency)} (mois dernier: ${formatCurrency(lastRev, currency)}, variation: ${revChange}%)
Dépenses totales: ${formatCurrency(currentExp, currency)} (mois dernier: ${formatCurrency(lastExp, currency)}, variation: ${expChange}%)
Résultat net: ${formatCurrency(currentRev - currentExp, currency)}
Trésorerie totale: ${formatCurrency(totalTreasury, currency)}`);

  // Bank accounts
  if (bankAccounts.length > 0) {
    const lines = bankAccounts.map(acc =>
      `- ${acc.name}${acc.bankName ? ` (${acc.bankName})` : ""} [${acc.type}]: ${formatCurrency(acc.balance, acc.currency)}`
    );
    sections.push(`=== COMPTES BANCAIRES (${bankAccounts.length}) ===\n${lines.join("\n")}`);
  }

  // Overdue invoices
  if (overdueInvoices.length > 0) {
    const lines = overdueInvoices.map(inv =>
      `- ${inv.number} | ${inv.client?.name || "Client"} | ${formatCurrency(inv.total, inv.currency)} | Échue le ${new Date(inv.dueDate).toLocaleDateString("fr-FR")}`
    );
    sections.push(`=== ⚠️ FACTURES EN RETARD (${overdueInvoices.length}) ===\n${lines.join("\n")}`);
  }

  // Pending invoices
  if (pendingInvoices.length > 0) {
    const totalPending = pendingInvoices.reduce((s, i) => s + i.total, 0);
    const lines = pendingInvoices.map(inv =>
      `- ${inv.number} | ${inv.client?.name || "Client"} | ${formatCurrency(inv.total, inv.currency)} | Échéance: ${new Date(inv.dueDate).toLocaleDateString("fr-FR")}`
    );
    sections.push(`=== FACTURES EN ATTENTE (${pendingInvoices.length}, total: ${formatCurrency(totalPending, currency)}) ===\n${lines.join("\n")}`);
  }

  // Recent invoices
  if (recentInvoices.length > 0) {
    const lines = recentInvoices.map(inv =>
      `- ${inv.number} | ${inv.client?.name || "Client"} | ${inv.status} | ${formatCurrency(inv.total, inv.currency)} | ${new Date(inv.issueDate).toLocaleDateString("fr-FR")}`
    );
    sections.push(`=== FACTURES RÉCENTES (${totalInvoiceCount} au total) ===\n${lines.join("\n")}`);
  }

  // Expenses by category
  if (expensesByCategory.length > 0) {
    const lines = expensesByCategory.map(e =>
      `- ${e.category}: ${formatCurrency(e._sum.amount || 0, currency)}`
    );
    sections.push(`=== DÉPENSES PAR CATÉGORIE (ce mois) ===\n${lines.join("\n")}`);
  }

  // Revenues by category
  if (revenuesByCategory.length > 0) {
    const lines = revenuesByCategory.map(r =>
      `- ${r.category}: ${formatCurrency(r._sum.amount || 0, currency)}`
    );
    sections.push(`=== REVENUS PAR CATÉGORIE (ce mois) ===\n${lines.join("\n")}`);
  }

  // Top clients
  if (topClients.length > 0) {
    const lines = topClients.map(tc => {
      const name = topClientNames.find(c => c.id === tc.clientId)?.name || "Client";
      return `- ${name}: ${formatCurrency(tc._sum.total || 0, currency)} (${tc._count} factures)`;
    });
    sections.push(`=== MEILLEURS CLIENTS ===\n${lines.join("\n")}`);
  }

  // Clients
  sections.push(`=== CLIENTS (${clients.length} enregistrés) ===
${clients.map(c => `- ${c.name}${c.email ? ` (${c.email})` : ""}${c.phone ? ` - ${c.phone}` : ""}`).join("\n")}`);

  return sections.join("\n\n");
}
