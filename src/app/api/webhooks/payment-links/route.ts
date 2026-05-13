import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/payment-links
// Called automatically by CinetPay or NotchPay when a payment is confirmed.
// Set this URL in your aggregator dashboard as the notify/webhook URL.
//
// CinetPay format:  POST with cpm_trans_id, cpm_result ("00" = success), cpm_amount
// NotchPay format:  POST with event ("payment.complete"), data.reference, data.status

function parseProvider(body: Record<string, unknown>): {
  transactionRef: string | null;
  success: boolean;
  failed: boolean;
} {
  // CinetPay
  if ("cpm_trans_id" in body) {
    return {
      transactionRef: (body.cpm_trans_id as string) ?? null,
      success: body.cpm_result === "00",
      failed: body.cpm_result !== "00",
    };
  }

  // NotchPay
  if ("event" in body && "data" in body) {
    const data = body.data as Record<string, unknown>;
    return {
      transactionRef: (data.reference as string) ?? null,
      success: body.event === "payment.complete" && data.status === "complete",
      failed: body.event === "payment.failed" || data.status === "failed",
    };
  }

  // Generic fallback (transactionRef + status field)
  const ref = (body.transactionRef ?? body.transaction_ref ?? body.ref) as string | null;
  const status = ((body.status as string) ?? "").toUpperCase();
  return {
    transactionRef: ref ?? null,
    success: ["COMPLETED", "SUCCESS", "SUCCESSFUL"].includes(status),
    failed: ["FAILED", "CANCELLED", "REJECTED"].includes(status),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionRef, success, failed } = parseProvider(body);

    if (!transactionRef) {
      return NextResponse.json({ error: "transactionRef manquant" }, { status: 400 });
    }

    const tx = await prisma.paymentLinkTransaction.findFirst({
      where: { transactionRef },
    });

    if (!tx) {
      // Unknown ref — return 200 so the provider doesn't keep retrying
      console.warn(`Webhook payment-links: ref inconnue ${transactionRef}`);
      return NextResponse.json({ received: true });
    }

    if (tx.status !== "PENDING") {
      // Already processed
      return NextResponse.json({ received: true });
    }

    const newStatus = success ? "COMPLETED" : failed ? "FAILED" : null;
    if (newStatus) {
      await prisma.paymentLinkTransaction.update({
        where: { id: tx.id },
        data: {
          status: newStatus as "COMPLETED" | "FAILED",
          paidAt: newStatus === "COMPLETED" ? new Date() : null,
        },
      });
      console.log(`Webhook payment-links: ${transactionRef} → ${newStatus}`);
    }

    return NextResponse.json({ received: true, status: newStatus ?? "PENDING" });
  } catch (error) {
    console.error("Webhook payment-links error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
