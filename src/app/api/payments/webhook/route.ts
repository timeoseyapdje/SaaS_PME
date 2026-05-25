import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";
import { verifyWebhookSignature } from "@/lib/notchpay";

// Maps any provider status to internal status
function mapStatus(event: string, status: string): string {
  if (event === "payment.complete" || ["SUCCESSFUL", "SUCCESS", "COMPLETED", "complete"].includes(status)) return "COMPLETED";
  if (event === "payment.failed"   || ["FAILED", "CANCELLED", "failed", "cancelled"].includes(status)) return "FAILED";
  return "PENDING";
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Verify NotchPay signature if present
    const signature = request.headers.get("x-notch-signature") ?? "";
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Extract ref + status from NotchPay or generic format
    let transactionRef: string | undefined;
    let mappedStatus: string;

    if (body.event && body.data) {
      // NotchPay format
      transactionRef = body.data.reference;
      mappedStatus = mapStatus(body.event, body.data.status ?? "");
    } else {
      // Generic / legacy format
      transactionRef = body.transactionRef;
      mappedStatus = mapStatus("", (body.status ?? "").toUpperCase());
    }

    if (!transactionRef) {
      return NextResponse.json({ error: "transactionRef manquant" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { transactionRef },
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
      console.warn(`Webhook subscription: ref inconnue ${transactionRef}`);
      return NextResponse.json({ received: true });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: mappedStatus as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED",
        paidAt: mappedStatus === "COMPLETED" ? new Date() : null,
      },
    });

    if (mappedStatus === "COMPLETED") {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

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

    console.log(`Webhook subscription: ${transactionRef} → ${mappedStatus}`);
    return NextResponse.json({ received: true, status: mappedStatus });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
