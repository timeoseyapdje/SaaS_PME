import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("quotes", "convert");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const quote = await prisma.quote.findFirst({
      where: { id, companyId },
      include: { items: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    if (quote.status === "CONVERTED") {
      return NextResponse.json({ error: "Ce devis a déjà été converti en facture" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const dueDate = body.dueDate
      ? new Date(body.dueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const count = await prisma.invoice.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const invoiceNumber = `FAC-${year}-${String(count + 1).padStart(4, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        clientId: quote.clientId,
        number: invoiceNumber,
        status: "DRAFT",
        dueDate,
        currency: quote.currency,
        subtotal: quote.subtotal,
        tvaAmount: quote.tvaAmount,
        total: quote.total,
        applyTVA: quote.applyTVA,
        notes: quote.notes,
        terms: quote.terms,
        items: {
          create: quote.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { client: true, items: true },
    });

    await prisma.quote.update({
      where: { id },
      data: { status: "CONVERTED", convertedInvoiceId: invoice.id },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
