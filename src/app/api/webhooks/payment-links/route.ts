import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, initiateTransfer } from "@/lib/notchpay";

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

const MOBILE_MONEY_CHANNELS: Record<string, "cm.mtn" | "cm.orange"> = {
  MTN_MONEY: "cm.mtn",
  ORANGE_MONEY: "cm.orange",
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

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
      include: {
        paymentLink: {
          include: {
            company: {
              include: {
                bankAccounts: {
                  where: { isDefault: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!tx || tx.status !== "PENDING") {
      return NextResponse.json({ received: true });
    }

    const newStatus = success ? "COMPLETED" : failed ? "FAILED" : null;
    if (!newStatus) {
      return NextResponse.json({ received: true, status: "PENDING" });
    }

    await prisma.paymentLinkTransaction.update({
      where: { id: tx.id },
      data: {
        status: newStatus as "COMPLETED" | "FAILED",
        paidAt: newStatus === "COMPLETED" ? new Date() : null,
      },
    });

    if (newStatus === "COMPLETED") {
      const company = tx.paymentLink.company;
      const defaultAccount = company.bankAccounts[0];

      if (defaultAccount) {
        // Update treasury balance
        await prisma.bankAccount.update({
          where: { id: defaultAccount.id },
          data: { balance: { increment: tx.amount } },
        });

        // Attempt automatic transfer for mobile money accounts
        const channel = MOBILE_MONEY_CHANNELS[defaultAccount.type];
        const phone = defaultAccount.phoneNumber || defaultAccount.accountNumber;

        let payoutRef: string | undefined;
        let payoutStatus: "INITIATED" | "PROCESSING" | "FAILED" = "INITIATED";

        if (channel && phone) {
          const transfer = await initiateTransfer({
            amount: tx.amount,
            currency: tx.paymentLink.currency,
            phoneNumber: phone,
            channel,
            description: `Reversement - ${tx.paymentLink.title}`,
            reference: `payout-${tx.id}`,
          });

          if (transfer) {
            payoutRef = transfer.reference;
            payoutStatus = "PROCESSING";
          } else {
            payoutStatus = "FAILED";
          }
        }

        await prisma.payout.create({
          data: {
            companyId: company.id,
            bankAccountId: defaultAccount.id,
            paymentLinkTransactionId: tx.id,
            amount: tx.amount,
            currency: tx.paymentLink.currency,
            status: payoutStatus,
            payoutRef: payoutRef ?? null,
            completedAt: payoutStatus === "PROCESSING" ? null : undefined,
          },
        });
      }
    }

    console.log(`Webhook payment-links: ${transactionRef} → ${newStatus}`);
    return NextResponse.json({ received: true, status: newStatus });
  } catch (error) {
    console.error("Webhook payment-links error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
