import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(request: Request) {
  try {
    const result = await requirePermission("invoices", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // INVOICE or QUOTE

    const where: Record<string, unknown> = { companyId };
    if (type && (type === "INVOICE" || type === "QUOTE")) {
      where.type = type;
    }

    const templates = await prisma.invoiceTemplate.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
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
    const { name, type, notes, paymentTerms, applyTVA, items } = body;

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Données manquantes: name et items sont requis" },
        { status: 400 }
      );
    }

    const templateType = type === "QUOTE" ? "QUOTE" : "INVOICE";

    const template = await prisma.invoiceTemplate.create({
      data: {
        companyId,
        name,
        type: templateType,
        notes: notes || null,
        paymentTerms: paymentTerms || null,
        applyTVA: applyTVA !== undefined ? applyTVA : true,
        items: {
          create: items.map(
            (item: {
              description: string;
              quantity: number;
              unitPrice: number;
              unit?: string;
            }) => ({
              description: item.description,
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice,
              unit: item.unit || null,
            })
          ),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
