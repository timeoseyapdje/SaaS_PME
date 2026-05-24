import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotal } from "@/lib/tax";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("quotes", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const quote = await prisma.quote.findFirst({
      where: { id, companyId },
      include: { client: true, items: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("quotes", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { status, items, clientId, validUntil, notes, terms, currency, applyTVA } = body;

    const existing = await prisma.quote.findFirst({ where: { id, companyId } });
    if (!existing) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (clientId) updateData.clientId = clientId;
    if (validUntil) updateData.validUntil = new Date(validUntil);
    if (notes !== undefined) updateData.notes = notes;
    if (terms !== undefined) updateData.terms = terms;
    if (currency) updateData.currency = currency;
    if (applyTVA !== undefined) updateData.applyTVA = applyTVA;

    if (items && items.length > 0) {
      const subtotal = items.reduce(
        (sum: number, item: { quantity: number; unitPrice: number }) =>
          sum + item.quantity * item.unitPrice,
        0
      );
      const { tva, total } = calculateInvoiceTotal(subtotal, applyTVA ?? existing.applyTVA);
      updateData.subtotal = subtotal;
      updateData.tvaAmount = tva;
      updateData.total = total;

      await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
      await prisma.quoteItem.createMany({
        data: items.map(
          (item: { description: string; quantity: number; unitPrice: number }) => ({
            quoteId: id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })
        ),
      });
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: { client: true, items: true },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("quotes", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const quote = await prisma.quote.findFirst({ where: { id, companyId } });
    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    await prisma.quote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
