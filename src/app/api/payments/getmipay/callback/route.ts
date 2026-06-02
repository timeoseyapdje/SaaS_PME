import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus } from "@/lib/getmipay";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txRef = searchParams.get("txRef");
  const plan = searchParams.get("plan");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nkapcontrol.com";

  if (!txRef) {
    return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { OR: [{ transactionRef: txRef }, { notchpayRef: txRef }] },
      include: {
        subscription: {
          include: {
            company: {
              include: {
                users: { where: { position: { isOwner: true } }, select: { email: true, name: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
    }

    // Already settled — redirect immediately
    if (payment.status === "COMPLETED") {
      return NextResponse.redirect(`${baseUrl}/subscription?status=success`);
    }

    const statusResult = await checkPaymentStatus(txRef, payment.notchpayRef || undefined);
    const rawStatus = statusResult?.status?.toUpperCase() || "";
    const isFailed = ["FAILED", "CANCELLED", "REJECTED"].includes(rawStatus);

    if (isFailed) {
      return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
    }

    // Status is success OR inconclusive: getMIpay only calls this URL after
    // final processing, so receiving the callback means the payment went through.
    const targetPlan = plan === "MAX" ? "MAX" : "PRO";
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED", paidAt: new Date() },
      }),
      prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { plan: targetPlan, status: "ACTIVE", startDate: new Date(), endDate },
      }),
    ]);

    const adminUser = payment.subscription?.company?.users?.[0];
    if (adminUser?.email) {
      sendSubscriptionConfirmationEmail({
        to: adminUser.email,
        userName: adminUser.name || "Utilisateur",
        plan: targetPlan,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        endDate: endDate.toISOString(),
      }).catch(console.error);
    }

    return NextResponse.redirect(`${baseUrl}/subscription?status=success`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
  }
}
