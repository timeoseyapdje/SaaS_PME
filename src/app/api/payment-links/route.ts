import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

function generateSlug(length = 10) {
  return randomBytes(Math.ceil(length * 3 / 4)).toString("base64url").slice(0, length);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

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
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

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
