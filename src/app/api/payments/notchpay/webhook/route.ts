import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/notchpay";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-notchpay-signature") || "";

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  const event = JSON.parse(payload);
  const { reference, status } = event.data || {};

  if (!reference) {
    return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { notchpayRef: reference },
    include: { subscription: true },
  });

  if (!payment) {
    const plTransaction = await prisma.paymentLinkTransaction.findFirst({
      where: { notchpayRef: reference },
    });

    if (plTransaction && status === "complete") {
      await prisma.paymentLinkTransaction.update({
        where: { id: plTransaction.id },
        data: { status: "COMPLETED", paidAt: new Date() },
      });
    }

    return NextResponse.json({ received: true });
  }

  if (status === "complete") {
    const targetPlan = payment.amount >= 10000 ? "MAX" : "PRO";

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED", paidAt: new Date() },
      }),
      prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          plan: targetPlan,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);
  } else if (status === "failed" || status === "cancelled") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}
