import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/notchpay";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trxref = searchParams.get("trxref");
  const merchantRef = searchParams.get("merchant_ref");
  const plan = searchParams.get("plan");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!trxref && !merchantRef) {
    return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
  }

  try {
    // Prefer trxref (NotchPay's own reference). If absent, look up notchpayRef from DB.
    let notchpayRef = trxref;
    if (!notchpayRef && merchantRef) {
      const dbPayment = await prisma.payment.findFirst({
        where: { OR: [{ transactionRef: merchantRef }, { notchpayRef: merchantRef }] },
      });
      notchpayRef = dbPayment?.notchpayRef || merchantRef;
    }

    const result = await verifyPayment(notchpayRef!);

    if (result.transaction?.status === "complete") {
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { notchpayRef: notchpayRef },
            { notchpayRef: result.transaction.reference },
            { transactionRef: merchantRef || undefined },
          ],
        },
        include: { subscription: true },
      });

      if (payment && payment.status !== "COMPLETED") {
        const targetPlan = plan === "MAX" ? "MAX" : "PRO";

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
      }

      return NextResponse.redirect(`${baseUrl}/subscription?status=success`);
    }

    return NextResponse.redirect(`${baseUrl}/subscription?status=pending`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
  }
}
