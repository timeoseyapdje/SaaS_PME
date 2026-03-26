import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotal } from "@/lib/tax";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;

    const body = await request.json();
    const { status, items, clientId, dueDate, notes, terms, currency, applyTVA } = body;

    const existingInvoice = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === "PAID") {
        updateData.paidAt = new Date();
      }
    }

    if (clientId) updateData.clientId = clientId;
    if (dueDate) updateData.dueDate = new Date(dueDate);
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
      const { tva, total } = calculateInvoiceTotal(
        subtotal,
        applyTVA ?? existingInvoice.applyTVA
      );
      updateData.subtotal = subtotal;
      updateData.tvaAmount = tva;
      updateData.total = total;

      // Delete existing items and recreate
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } });
      await prisma.invoiceItem.createMany({
        data: items.map(
          (item: {
            description: string;
            quantity: number;
            unitPrice: number;
          }) => ({
            invoiceId: params.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })
        ),
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: { client: true, items: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, companyId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    await prisma.invoice.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
