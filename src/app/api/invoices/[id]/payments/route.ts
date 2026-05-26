import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";

const VALID_METHODS = [
  "ESPECES",
  "VIREMENT",
  "CHEQUE",
  "MTN_MONEY",
  "ORANGE_MONEY",
  "CARTE_BANCAIRE",
  "NOTCHPAY",
] as const;

type PaymentMethod = (typeof VALID_METHODS)[number];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("invoices", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    const payments = await prisma.invoicePayment.findMany({
      where: { invoiceId: id },
      orderBy: { paidAt: "asc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("invoices", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    const body = await request.json();
    const { amount, method, paidAt, reference, note } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Le montant doit être supérieur à 0" },
        { status: 400 }
      );
    }

    if (!VALID_METHODS.includes(method as PaymentMethod)) {
      return NextResponse.json(
        { error: "Méthode de paiement invalide" },
        { status: 400 }
      );
    }

    const payment = await prisma.invoicePayment.create({
      data: {
        invoiceId: id,
        amount,
        method: method as PaymentMethod,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        reference: reference || null,
        note: note || null,
      },
    });

    const existingTotal = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const newTotal = existingTotal + amount;

    if (newTotal >= invoice.total && invoice.status !== "PAID") {
      await prisma.invoice.update({
        where: { id },
        data: { status: "PAID", paidAt: payment.paidAt },
      });
    }

    return NextResponse.json(payment, { status: 201 });
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
    const result = await requirePermission("invoices", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId requis" }, { status: 400 });
    }

    const existingPayment = await prisma.invoicePayment.findFirst({
      where: { id: paymentId, invoiceId: id },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: "Paiement non trouvé" }, { status: 404 });
    }

    await prisma.invoicePayment.delete({ where: { id: paymentId } });

    const remainingPayments = await prisma.invoicePayment.findMany({
      where: { invoiceId: id },
    });
    const remainingTotal = remainingPayments.reduce((sum, p) => sum + p.amount, 0);

    if (invoice.status === "PAID" && remainingTotal < invoice.total) {
      const isOverdue = new Date(invoice.dueDate) < new Date();
      await prisma.invoice.update({
        where: { id },
        data: {
          status: isOverdue ? "OVERDUE" : "SENT",
          paidAt: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
