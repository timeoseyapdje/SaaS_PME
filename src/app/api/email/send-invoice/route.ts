import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";

// POST - Envoyer une facture par email
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 400 });
    }

    const { invoiceId, recipientEmail } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "ID de facture requis" }, { status: 400 });
    }

    // Récupérer la facture avec les détails
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: {
        client: true,
        items: true,
        company: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    // Déterminer le destinataire
    const to = recipientEmail || invoice.client.email;
    if (!to) {
      return NextResponse.json(
        { error: "Aucune adresse email pour ce client. Ajoutez un email au client ou spécifiez un destinataire." },
        { status: 400 }
      );
    }

    // Envoyer l'email
    const result = await sendInvoiceEmail({
      to,
      clientName: invoice.client.name,
      companyName: invoice.company.name,
      invoiceNumber: invoice.number,
      amount: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate.toISOString(),
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      notes: invoice.notes || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    // Marquer la facture comme envoyée
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: invoice.status === "DRAFT" ? "SENT" : invoice.status,
        reminderSent: true,
        reminderDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Facture ${invoice.number} envoyée à ${to}`,
    });
  } catch (error) {
    console.error("Send invoice email error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
