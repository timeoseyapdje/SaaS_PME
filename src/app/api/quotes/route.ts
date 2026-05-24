import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotal } from "@/lib/tax";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(request: Request) {
  try {
    const result = await requirePermission("quotes", "view");
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

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requirePermission("quotes", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { clientId, validUntil, items, notes, terms, currency, applyTVA, status } = body;

    if (!clientId || !validUntil || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Données manquantes: clientId, validUntil et items sont requis" },
        { status: 400 }
      );
    }

    const count = await prisma.quote.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `DEV-${year}-${String(count + 1).padStart(4, "0")}`;

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    );
    const { tva, total } = calculateInvoiceTotal(subtotal, applyTVA ?? true);

    const quote = await prisma.quote.create({
      data: {
        companyId,
        clientId,
        number,
        status: status || "DRAFT",
        validUntil: new Date(validUntil),
        currency: currency || "XAF",
        subtotal,
        tvaAmount: tva,
        total,
        applyTVA: applyTVA ?? true,
        notes,
        terms,
        items: {
          create: items.map(
            (item: { description: string; quantity: number; unitPrice: number }) => ({
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

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
