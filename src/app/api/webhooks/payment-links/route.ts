import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initiatePayOut } from "@/lib/getmipay";

const MOBILE_MONEY_METHODS: Record<string, "MTN_MONEY" | "ORANGE_MONEY"> = {
  MTN_MONEY: "MTN_MONEY",
  ORANGE_MONEY: "ORANGE_MONEY",
};

function parseWebhookBody(body: Record<string, unknown>): {
  transactionRef: string | null;
  success: boolean;
  failed: boolean;
} {
  // getMIpay format
  if ("transaction_reference" in body || "external_reference" in body || (body.data && typeof body.data === "object")) {
    const data = (body.data as Record<string, unknown>) || body;
    const ref = (data.external_reference || data.transaction_reference || body.external_reference || body.transaction_reference) as string | null;
    const status = ((data.status || body.status) as string || "").toUpperCase();
    return {
      transactionRef: ref ?? null,
      success: ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(status),
      failed: ["FAILED", "CANCELLED", "REJECTED"].includes(status),
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
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const { transactionRef, success, failed } = parseWebhookBody(body);

    if (!transactionRef) {
      return NextResponse.json({ received: true });
    }

    const tx = await prisma.paymentLinkTransaction.findFirst({
      where: {
        OR: [
          { notchpayRef: transactionRef },
          { transactionRef },
          { id: transactionRef },
        ],
      },
      include: {
        paymentLink: {
          include: {
            company: {
              include: {
                bankAccounts: { where: { isDefault: true }, take: 1 },
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
      const existingPayout = await prisma.payout.findUnique({
        where: { paymentLinkTransactionId: tx.id },
      });

      if (!existingPayout) {
        const company = tx.paymentLink.company;
        const defaultAccount = company.bankAccounts[0];

        if (defaultAccount) {
          await prisma.bankAccount.update({
            where: { id: defaultAccount.id },
            data: { balance: { increment: tx.amount } },
          });

          const method = MOBILE_MONEY_METHODS[defaultAccount.type];
          const phone = defaultAccount.phoneNumber || defaultAccount.accountNumber;

          let payoutRef: string | undefined;
          let payoutStatus: "INITIATED" | "PROCESSING" | "FAILED" = "INITIATED";

          if (method && phone) {
            const payout = await initiatePayOut({
              amount: tx.amount,
              currency: tx.paymentLink.currency,
              wallet: phone,
              description: `Reversement - ${tx.paymentLink.title}`,
              paymentMethod: method,
              reference: `payout-${tx.id}`,
            });

            if (payout) {
              payoutRef = payout.transactionReference;
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
            },
          });
        }
      }
    }

    console.log(`Webhook payment-links: ${transactionRef} → ${newStatus}`);
    return NextResponse.json({ received: true, status: newStatus });
  } catch (error) {
    console.error("Webhook payment-links error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
