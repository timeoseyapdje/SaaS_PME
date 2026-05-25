import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const quote = await prisma.quote.findFirst({
    where: { signatureToken: token },
    select: {
      id: true,
      number: true,
      status: true,
      issueDate: true,
      validUntil: true,
      currency: true,
      subtotal: true,
      tvaAmount: true,
      total: true,
      applyTVA: true,
      notes: true,
      signedAt: true,
      client: {
        select: { name: true, email: true, phone: true },
      },
      company: {
        select: { name: true, email: true, phone: true, city: true },
      },
      items: {
        select: { description: true, quantity: true, unitPrice: true, total: true },
      },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  }

  return NextResponse.json(quote);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const quote = await prisma.quote.findFirst({
    where: { signatureToken: token },
    select: { id: true, status: true },
  });

  if (!quote) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  }

  if (!["DRAFT", "SENT"].includes(quote.status)) {
    return NextResponse.json(
      { error: "Ce devis a déjà été traité" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { action } = body as { action: "accept" | "reject" };

  if (action === "accept") {
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: "ACCEPTED",
        signedAt: new Date(),
        signatureToken: null,
      },
    });
    return NextResponse.json({ success: true, action: "accepted" });
  } else if (action === "reject") {
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: "REJECTED",
        signatureToken: null,
      },
    });
    return NextResponse.json({ success: true, action: "rejected" });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
