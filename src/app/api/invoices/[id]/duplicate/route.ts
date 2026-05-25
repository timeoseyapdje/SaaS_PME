import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requirePermission("invoices", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const source = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: { items: true },
    });

    if (!source) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    const count = await prisma.invoice.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `FAC-${year}-${String(count + 1).padStart(4, "0")}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        clientId: source.clientId,
        number,
        status: "DRAFT",
        dueDate,
        currency: source.currency,
        subtotal: source.subtotal,
        tvaAmount: source.tvaAmount,
        total: source.total,
        applyTVA: source.applyTVA,
        notes: source.notes,
        terms: source.terms,
        items: {
          create: source.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { client: true, items: true },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
