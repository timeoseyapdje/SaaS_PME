import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendQuoteEmail } from "@/lib/email";

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

    const { quoteId, recipientEmail } = await request.json();
    if (!quoteId) {
      return NextResponse.json({ error: "ID de devis requis" }, { status: 400 });
    }

    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, companyId },
      include: { client: true, items: true, company: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    const to = recipientEmail || quote.client.email;
    if (!to) {
      return NextResponse.json(
        { error: "Aucune adresse email pour ce client. Ajoutez un email au client ou spécifiez un destinataire." },
        { status: 400 }
      );
    }

    const result = await sendQuoteEmail({
      to,
      clientName: quote.client.name,
      companyName: quote.company.name,
      quoteNumber: quote.number,
      amount: quote.total,
      currency: quote.currency,
      validUntil: quote.validUntil.toISOString(),
      items: quote.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      notes: quote.notes || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
    }

    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: quote.status === "DRAFT" ? "SENT" : quote.status },
    });

    return NextResponse.json({ success: true, message: `Devis ${quote.number} envoyé à ${to}` });
  } catch (error) {
    console.error("Send quote email error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
