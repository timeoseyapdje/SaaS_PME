import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus } from "@/lib/getmipay";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";
import { planForAmount } from "@/lib/plan-limits";

type Outcome = "COMPLETED" | "FAILED" | "PENDING" | "NOT_FOUND";

// Settles a subscription payment from the status reported by the getMIpay API.
// The callback URL is public, so the caller's claims are never trusted on their own.
async function settleSubscriptionPayment(txRef: string): Promise<Outcome> {
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
    await prisma.payment.updateMany({ where: { id: payment.id, status: "PENDING" }, data: { status: "FAILED" } });
    return "FAILED";
  }
  if (!["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(rawStatus)) {
    return "PENDING";
  }

  const targetPlan = planForAmount(payment.amount);
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Atomic claim so a concurrent callback/webhook cannot extend the subscription twice.
  const settled = await prisma.$transaction(async (tx) => {
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "COMPLETED" } },
      data: { status: "COMPLETED", paidAt: new Date() },
    });
    if (claimed.count === 0) return false;
    await tx.subscription.update({
      where: { id: payment.subscriptionId },
      data: { plan: targetPlan, status: "ACTIVE", startDate: new Date(), endDate },
    });
    return true;
  });
  if (!settled) return "COMPLETED";

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nkapcontrol.com";

  if (!txRef) {
    return NextResponse.redirect(`${baseUrl}/subscription?status=error`);
  }

  try {
    const outcome = await settleSubscriptionPayment(txRef);
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

    if (txRef) await settleSubscriptionPayment(txRef);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("getMIpay subscription webhook POST error:", error);
    return NextResponse.json({ received: true });
  }
}
