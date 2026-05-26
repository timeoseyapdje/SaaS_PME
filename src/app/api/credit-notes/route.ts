import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(request: Request) {
  try {
    const result = await requirePermission("invoices", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");

    const creditNotes = await prisma.creditNote.findMany({
      where: {
        companyId,
        ...(invoiceId ? { invoiceId } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
        invoice: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(creditNotes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requirePermission("invoices", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { invoiceId, clientId, amount, reason } = body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    // Verify invoice belongs to company if provided
    if (invoiceId) {
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, companyId },
      });
      if (!invoice) {
        return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
      }
    }

    // Verify client belongs to company if provided
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, companyId },
      });
      if (!client) {
        return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
      }
    }

    // Generate credit note number: AV-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await prisma.creditNote.count({
      where: { companyId, number: { startsWith: `AV-${year}-` } },
    });
    const number = `AV-${year}-${String(count + 1).padStart(4, "0")}`;

    const creditNote = await prisma.creditNote.create({
      data: {
        companyId,
        invoiceId: invoiceId || null,
        clientId: clientId || null,
        number,
        amount: parseFloat(amount),
        reason: reason || null,
        status: "ISSUED",
        issuedAt: new Date(),
        createdAt: new Date(),
      },
      include: {
        client: { select: { id: true, name: true } },
        invoice: { select: { id: true, number: true } },
      },
    });

    return NextResponse.json(creditNote, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
