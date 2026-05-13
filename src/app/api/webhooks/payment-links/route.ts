import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/notchpay";

function parseProvider(body: Record<string, unknown>): {
  transactionRef: string | null;
  success: boolean;
  failed: boolean;
} {
  // NotchPay
  if ("event" in body && "data" in body) {
    const data = body.data as Record<string, unknown>;
    return {
      transactionRef: (data.reference as string) ?? null,
      success: body.event === "payment.complete" && data.status === "complete",
      failed: body.event === "payment.failed" || data.status === "failed",
    };
  }

  // CinetPay
  if ("cpm_trans_id" in body) {
    return {
      transactionRef: (body.cpm_trans_id as string) ?? null,
      success: body.cpm_result === "00",
      failed: body.cpm_result !== "00",
    };
  }

  // Generic fallback
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
    const rawBody = await request.text();

    // Verify NotchPay webhook signature if private key is set
    const signature = request.headers.get("x-notch-signature") ?? "";
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const { transactionRef, success, failed } = parseProvider(body);

    if (!transactionRef) {
      return NextResponse.json({ received: true });
    }

    const tx = await prisma.paymentLinkTransaction.findFirst({
      where: { transactionRef },
    });

    if (!tx || tx.status !== "PENDING") {
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
