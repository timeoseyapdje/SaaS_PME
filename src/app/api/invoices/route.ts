import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotal } from "@/lib/tax";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(request: Request) {
  try {
    const result = await requirePermission("invoices", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { companyId };
    if (status && status !== "ALL") where.status = status;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
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
    const { clientId, dueDate, items, notes, terms, currency, applyTVA, status, isRecurring, recurrenceInterval, nextDueDate } = body;

    if (!clientId || !dueDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Données manquantes: clientId, dueDate et items sont requis" },
        { status: 400 }
      );
    }

    // Auto-generate invoice number
    const count = await prisma.invoice.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `FAC-${year}-${String(count + 1).padStart(4, "0")}`;

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    );
    const { tva, total } = calculateInvoiceTotal(subtotal, applyTVA ?? true);

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        clientId,
        number,
        status: status || "DRAFT",
        dueDate: new Date(dueDate),
        currency: currency || "XAF",
        subtotal,
        tvaAmount: tva,
        total,
        applyTVA: applyTVA ?? true,
        notes,
        terms,
        isRecurring: isRecurring ?? false,
        recurrenceInterval: isRecurring ? (recurrenceInterval || null) : null,
        nextDueDate: isRecurring && nextDueDate ? new Date(nextDueDate) : null,
        items: {
          create: items.map(
            (item: {
              description: string;
              quantity: number;
              unitPrice: number;
            }) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })
          ),
        },
      },
      include: { client: true, items: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
