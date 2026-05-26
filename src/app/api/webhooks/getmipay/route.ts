import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

function mapStatus(status: string): string {
  const s = status.toUpperCase();
  if (["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(s)) return "COMPLETED";
  if (["FAILED", "CANCELLED", "REJECTED"].includes(s)) return "FAILED";
  return "PENDING";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const transactionRef =
      body.external_reference ||
      body.transaction_reference ||
      body.data?.external_reference ||
      body.data?.transaction_reference;

    const rawStatus =
      body.status ||
      body.data?.status ||
      "";

    if (!transactionRef) {
      return NextResponse.json({ received: true });
    }

    const mappedStatus = mapStatus(rawStatus);

    // Subscription payment
    const payment = await prisma.payment.findFirst({
      where: { OR: [{ transactionRef }, { notchpayRef: transactionRef }] },
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

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: mappedStatus as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED",
          paidAt: mappedStatus === "COMPLETED" ? new Date() : null,
        },
      });

      if (mappedStatus === "COMPLETED") {
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "ACTIVE", startDate: new Date(), endDate },
        });

        const adminUser = payment.subscription?.company?.users?.[0];
        if (adminUser?.email) {
          sendSubscriptionConfirmationEmail({
            to: adminUser.email,
            userName: adminUser.name || "Utilisateur",
            plan: payment.subscription?.plan || "PRO",
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            endDate: endDate.toISOString(),
          }).catch(console.error);
        }
      }

      if (mappedStatus === "FAILED") {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "SUSPENDED" },
        });
      }

      return NextResponse.json({ received: true, status: mappedStatus });
    }

    // Payment link transaction
    const plTx = await prisma.paymentLinkTransaction.findFirst({
      where: { OR: [{ transactionRef }, { notchpayRef: transactionRef }] },
    });

    if (plTx && plTx.status === "PENDING") {
      await prisma.paymentLinkTransaction.update({
        where: { id: plTx.id },
        data: {
          status: mappedStatus === "COMPLETED" ? "COMPLETED" : mappedStatus === "FAILED" ? "FAILED" : "PENDING",
          paidAt: mappedStatus === "COMPLETED" ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("getMIpay webhook error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
