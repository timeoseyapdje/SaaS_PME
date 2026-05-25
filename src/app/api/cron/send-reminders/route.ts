import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";

// Cron job: envoie des relances automatiques pour les factures en retard
// Vercel cron: configurer dans vercel.json — appel toutes les 24h
// GET /api/cron/send-reminders?secret=CRON_SECRET

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  // Passer les factures SENT expirées à OVERDUE
  await prisma.invoice.updateMany({
    where: { status: "SENT", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  });

  // Trouver les factures OVERDUE sans relance récente
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: "OVERDUE",
      OR: [
        { reminderSent: false },
        { reminderDate: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // relance > 7 jours
      ],
    },
    include: {
      client: { select: { name: true, email: true } },
      company: {
        select: {
          name: true,
          users: {
            where: { position: { isOwner: true } },
            select: { email: true, name: true },
            take: 1,
          },
        },
      },
      items: true,
    },
    take: 50, // traiter 50 à la fois max
  });

  const results = { sent: 0, skipped: 0, errors: 0 };

  for (const invoice of overdueInvoices) {
    const clientEmail = invoice.client.email;
    if (!clientEmail) { results.skipped++; continue; }

    const daysSinceDue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // Envoyer relance uniquement à 7, 14, 30 jours
    const shouldSend = [7, 14, 30].some(d => Math.abs(daysSinceDue - d) < 1);
    if (!shouldSend && invoice.reminderSent) { results.skipped++; continue; }

    try {
      await sendInvoiceEmail({
        to: clientEmail,
        invoiceNumber: invoice.number,
        clientName: invoice.client.name,
        companyName: invoice.company.name,
        amount: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.dueDate.toISOString(),
        items: invoice.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
        notes: `RAPPEL — Cette facture est en retard de ${daysSinceDue} jour(s). Merci de procéder au règlement dans les plus brefs délais.`,
      });

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { reminderSent: true, reminderDate: now },
      });

      results.sent++;
    } catch {
      results.errors++;
    }
  }

  // Générer les prochaines factures récurrentes dues
  const recurringDue = await prisma.invoice.findMany({
    where: {
      isRecurring: true,
      status: "PAID",
      nextDueDate: { lte: now },
    },
    include: { items: true, client: true },
    take: 20,
  });

  let recurringGenerated = 0;
  for (const inv of recurringDue) {
    try {
      const nextIssue = new Date();
      const nextDue = new Date();

      if (inv.recurrenceInterval === "MONTHLY") {
        nextDue.setMonth(nextDue.getMonth() + 1);
      } else if (inv.recurrenceInterval === "QUARTERLY") {
        nextDue.setMonth(nextDue.getMonth() + 3);
      } else if (inv.recurrenceInterval === "YEARLY") {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      } else {
        continue;
      }

      const year = nextIssue.getFullYear();
      const count = await prisma.invoice.count({ where: { companyId: inv.companyId } });
      const newNumber = `FAC-${year}-${String(count + 1).padStart(4, "0")}`;

      await prisma.invoice.create({
        data: {
          companyId: inv.companyId,
          clientId: inv.clientId,
          number: newNumber,
          status: "DRAFT",
          issueDate: nextIssue,
          dueDate: nextDue,
          currency: inv.currency,
          subtotal: inv.subtotal,
          tvaRate: inv.tvaRate,
          tvaAmount: inv.tvaAmount,
          total: inv.total,
          applyTVA: inv.applyTVA,
          notes: inv.notes,
          terms: inv.terms,
          isRecurring: true,
          recurrenceInterval: inv.recurrenceInterval,
          nextDueDate: nextDue,
          items: {
            create: inv.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
      });

      // Mettre à jour la prochaine échéance sur la facture source
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { nextDueDate: nextDue },
      });

      recurringGenerated++;
    } catch { /* continue */ }
  }

  console.log(`Cron reminders: ${results.sent} envoyés, ${results.skipped} ignorés, ${results.errors} erreurs, ${recurringGenerated} factures récurrentes générées`);
  return NextResponse.json({ ...results, recurringGenerated });
}
