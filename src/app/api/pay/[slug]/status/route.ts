import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const txId = new URL(request.url).searchParams.get("txId");
    if (!txId) return NextResponse.json({ status: "NOT_FOUND" }, { status: 400 });

    const tx = await prisma.paymentLinkTransaction.findFirst({
      where: { id: txId, paymentLink: { slug } },
      select: { status: true, amount: true, paymentLink: { select: { currency: true, title: true } } },
    });

    if (!tx) return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({
      status: tx.status,
      amount: tx.amount,
      currency: tx.paymentLink.currency,
      title: tx.paymentLink.title,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}
