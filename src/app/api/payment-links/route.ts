import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

function generateSlug(length = 10) {
  return randomBytes(Math.ceil(length * 3 / 4)).toString("base64url").slice(0, length);
}

export async function GET() {
  try {
    const result = await requirePermission("payment_links", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const links = await prisma.paymentLink.findMany({
      where: { companyId },
      include: {
        client: { select: { id: true, name: true } },
        transactions: { select: { id: true, status: true, amount: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requirePermission("payment_links", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { title, description, amount, currency, expiresAt, maxUses, clientId, invoiceId, orderId } = body;

    if (!title || !amount) {
      return NextResponse.json({ error: "Titre et montant obligatoires" }, { status: 400 });
    }

    const slug = generateSlug(10);

    const link = await prisma.paymentLink.create({
      data: {
        companyId,
        title,
        description,
        amount: Number(amount),
        currency: currency || "XAF",
        slug,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        clientId: clientId || null,
        invoiceId: invoiceId || null,
        orderId: orderId || null,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
