import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus } from "@/lib/getmipay";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

type Outcome = "COMPLETED" | "FAILED" | "PENDING" | "NOT_FOUND";

// Settles a subscription payment from the status reported by the getMIpay API.
// The callback URL is public, so the caller's claims are never trusted on their own.
async function settleSubscriptionPayment(txRef: string, plan: string | null): Promise<Outcome> {
  const payment = await prisma.payment.findFirst({
    where: { OR: [{ transactionRef: txRef }, { providerRef: txRef }] },
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

  if (!payment) return "NOT_FOUND";
  if (payment.status === "COMPLETED") return "COMPLETED";

  const statusResult = await checkPaymentStatus(payment.providerRef || txRef);
  const rawStatus = statusResult?.status?.toUpperCase() || "";

  if (["FAILED", "CANCELLED", "REJECTED", "TIMEOUT"].includes(rawStatus)) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return "FAILED";
  }
  if (!["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(rawStatus)) {
    return "PENDING";
  }

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

  return "COMPLETED";
}

// GET — user redirected here by getMIpay after USSD processing
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txRef = searchParams.get("txRef");
  const plan = searchParams.get("plan");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nkapcontrol.com";

  if (!txRef) {
    return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
  }

  try {
    const outcome = await settleSubscriptionPayment(txRef, plan);
    const status = outcome === "COMPLETED" ? "success" : outcome === "PENDING" ? "pending" : "error";
    return NextResponse.redirect(`${baseUrl}/subscription?status=${status}`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
  }
}

// POST — server-to-server notification from getMIpay
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const txRef =
      url.searchParams.get("txRef") ||
      (body.order_id as string | undefined) ||
      (body.data?.order_id as string | undefined) ||
      null;

    if (txRef) await settleSubscriptionPayment(txRef, url.searchParams.get("plan"));
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("getMIpay subscription webhook POST error:", error);
    return NextResponse.json({ received: true });
  }
}
