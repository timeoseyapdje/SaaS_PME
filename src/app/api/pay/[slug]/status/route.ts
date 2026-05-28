import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus, initiatePayOut } from "@/lib/getmipay";

const MOBILE_MONEY_METHODS: Record<string, "MTN_MONEY" | "ORANGE_MONEY"> = {
  MTN_MONEY: "MTN_MONEY",
  ORANGE_MONEY: "ORANGE_MONEY",
};

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const txId = new URL(request.url).searchParams.get("txId");
    if (!txId) return NextResponse.json({ status: "NOT_FOUND" }, { status: 400 });

    const tx = await prisma.paymentLinkTransaction.findFirst({
      where: { id: txId, paymentLink: { slug } },
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

    if (!tx) return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });

    // Already settled — return immediately
    if (tx.status === "COMPLETED" || tx.status === "FAILED") {
      return NextResponse.json({
        status: tx.status,
        amount: tx.amount,
        currency: tx.paymentLink.currency,
        title: tx.paymentLink.title,
      });
    }

    // Still PENDING: ask getMIpay directly for real-time status
    // Per docs: valid references are order_id (= txId = transaction.id) OR soleaspay_reference.
    // transaction_reference is NOT accepted — always fall back to txId (order_id).
    {
      const isKnown = (s: string) =>
        ["SUCCESS","SUCCESSFUL","COMPLETED","PAID","FAILED","CANCELLED","REJECTED"].includes(s);

      let apiStatus = tx.notchpayRef ? await checkPaymentStatus(tx.notchpayRef) : null;
      let raw = apiStatus?.status?.toUpperCase() || "";

      if (!isKnown(raw)) {
        const byOrderId = await checkPaymentStatus(txId);
        if (byOrderId) { apiStatus = byOrderId; raw = byOrderId.status?.toUpperCase() || ""; }
      }

      const isSuccess = ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(raw);
      const isFailed = ["FAILED", "CANCELLED", "REJECTED"].includes(raw);

      // Sandbox fallback: getMIpay sandbox doesn't fire webhooks for test numbers.
      // If we're in sandbox and getMIpay acknowledges the payment (apiStatus non-null)
      // and it's been pending >15s, the test number auto-trigger has completed internally.
      const isSandbox = (process.env.GETMIPAY_BASE_URL || "").includes("sandbox");
      const ageMs = Date.now() - new Date(tx.createdAt).getTime();
      const sandboxAutoConfirm = isSandbox && apiStatus !== null && !isFailed && ageMs > 15_000;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";
      const expectedCallbackUrl = `${appUrl}/api/payments/getmipay/callback/payment-link?slug=${slug}&txId=${txId}`;
      const debug = { ref: tx.notchpayRef, orderId: txId, apiStatus, raw, expectedCallbackUrl };

      if (isSuccess || sandboxAutoConfirm) {
        await prisma.paymentLinkTransaction.update({
          where: { id: tx.id },
          data: { status: "COMPLETED", paidAt: new Date() },
        });

        // Credit company balance and trigger payout
        const company = tx.paymentLink.company;
        const defaultAccount = company.bankAccounts[0];
        if (defaultAccount) {
          await prisma.bankAccount.update({
            where: { id: defaultAccount.id },
            data: { balance: { increment: tx.amount } },
          });

          const existingPayout = await prisma.payout.findUnique({
            where: { paymentLinkTransactionId: tx.id },
          });

          if (!existingPayout) {
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
              if (payout) { payoutRef = payout.transactionReference; payoutStatus = "PROCESSING"; }
              else { payoutStatus = "FAILED"; }
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

        return NextResponse.json({
          status: "COMPLETED",
          amount: tx.amount,
          currency: tx.paymentLink.currency,
          title: tx.paymentLink.title,
        });
      }

      if (isFailed) {
        await prisma.paymentLinkTransaction.update({
          where: { id: tx.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({
          status: "FAILED",
          amount: tx.amount,
          currency: tx.paymentLink.currency,
          title: tx.paymentLink.title,
        });
      }

      return NextResponse.json({
        status: "PENDING",
        amount: tx.amount,
        currency: tx.paymentLink.currency,
        title: tx.paymentLink.title,
        debug,
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}
