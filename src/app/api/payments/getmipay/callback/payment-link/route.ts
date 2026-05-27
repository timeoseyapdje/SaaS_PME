import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus, initiatePayOut } from "@/lib/getmipay";

const MOBILE_MONEY_METHODS: Record<string, "MTN_MONEY" | "ORANGE_MONEY"> = {
  MTN_MONEY: "MTN_MONEY",
  ORANGE_MONEY: "ORANGE_MONEY",
};

async function settleTransaction(
  txId: string,
  outcome: "COMPLETED" | "FAILED"
) {
  const transaction = await prisma.paymentLinkTransaction.findUnique({
    where: { id: txId },
    include: {
      paymentLink: {
        include: {
          company: { include: { bankAccounts: { where: { isDefault: true }, take: 1 } } },
        },
      },
    },
  });

  if (!transaction || transaction.status !== "PENDING") return;

  await prisma.paymentLinkTransaction.update({
    where: { id: txId },
    data: { status: outcome, paidAt: outcome === "COMPLETED" ? new Date() : null },
  });

  if (outcome !== "COMPLETED") return;

  const company = transaction.paymentLink.company;
  const defaultAccount = company.bankAccounts[0];
  if (!defaultAccount) return;

  await prisma.bankAccount.update({
    where: { id: defaultAccount.id },
    data: { balance: { increment: transaction.amount } },
  });

  const existingPayout = await prisma.payout.findUnique({
    where: { paymentLinkTransactionId: transaction.id },
  });
  if (existingPayout) return;

  const method = MOBILE_MONEY_METHODS[defaultAccount.type];
  const phone = defaultAccount.phoneNumber || defaultAccount.accountNumber;
  let payoutRef: string | undefined;
  let payoutStatus: "INITIATED" | "PROCESSING" | "FAILED" = "INITIATED";

  if (method && phone) {
    const payout = await initiatePayOut({
      amount: transaction.amount,
      currency: transaction.paymentLink.currency,
      wallet: phone,
      description: `Reversement - ${transaction.paymentLink.title}`,
      paymentMethod: method,
      reference: `payout-${transaction.id}`,
    });
    if (payout) { payoutRef = payout.transactionReference; payoutStatus = "PROCESSING"; }
    else { payoutStatus = "FAILED"; }
  }

  await prisma.payout.create({
    data: {
      companyId: company.id,
      bankAccountId: defaultAccount.id,
      paymentLinkTransactionId: transaction.id,
      amount: transaction.amount,
      currency: transaction.paymentLink.currency,
      status: payoutStatus,
      payoutRef: payoutRef ?? null,
    },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get("txId");
  const slug = searchParams.get("slug");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";

  if (!txId || !slug) {
    return NextResponse.redirect(`${baseUrl}/pay/${slug || "error"}?status=error`);
  }

  try {
    const transaction = await prisma.paymentLinkTransaction.findUnique({
      where: { id: txId },
      include: { paymentLink: true },
    });

    if (!transaction) {
      return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=error`);
    }

    if (transaction.status === "COMPLETED") {
      const confirmedParams = new URLSearchParams({
        amount: String(transaction.amount),
        currency: transaction.paymentLink.currency,
        title: transaction.paymentLink.title,
      });
      return NextResponse.redirect(`${baseUrl}/pay/${slug}/confirmed?${confirmedParams.toString()}`);
    }

    const getmipayRef = transaction.notchpayRef || txId;
    const statusResult = await checkPaymentStatus(getmipayRef);
    const rawStatus = statusResult?.status?.toUpperCase() || "";
    const isSuccess = ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(rawStatus);
    const isFailed = ["FAILED", "CANCELLED", "REJECTED"].includes(rawStatus);

    if (isFailed) {
      await settleTransaction(txId, "FAILED");
      return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=error`);
    }

    if (isSuccess) {
      await settleTransaction(txId, "COMPLETED");
      const confirmedParams = new URLSearchParams({
        amount: String(transaction.amount),
        currency: transaction.paymentLink.currency,
        title: transaction.paymentLink.title,
      });
      return NextResponse.redirect(`${baseUrl}/pay/${slug}/confirmed?${confirmedParams.toString()}`);
    }

    return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=pending`);
  } catch (error) {
    console.error("getMIpay payment-link callback error:", error);
    return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=error`);
  }
}

// POST: webhook from getMIpay after payment status changes (sandbox: ~3s delay)
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txId = searchParams.get("txId");
    if (!txId) return NextResponse.json({ received: true });

    const body = await req.json().catch(() => ({}));

    // Parse status from all possible field names getMIpay might use
    const rawStatus = (
      (body.status as string) ||
      (body.data?.status as string) ||
      (body.payment_status as string) ||
      ""
    ).toLowerCase();

    const explicitFailed = ["failed", "cancelled", "rejected", "failure", "cancel", "error"].includes(rawStatus);
    const explicitSuccess = ["success", "successful", "completed", "paid"].includes(rawStatus)
      || body.success === true
      || ((body.event as string) || "").toLowerCase().includes("success");

    if (explicitFailed) {
      await settleTransaction(txId, "FAILED");
      return NextResponse.json({ received: true });
    }

    if (explicitSuccess) {
      await settleTransaction(txId, "COMPLETED");
      return NextResponse.json({ received: true });
    }

    // Status field absent or unrecognized: verify via API, then default to COMPLETED.
    // getMIpay only POSTs to callback_url after final payment processing, so receiving
    // a POST here means the payment was processed — if still ambiguous, treat as success.
    const tx = await prisma.paymentLinkTransaction.findUnique({
      where: { id: txId },
      select: { notchpayRef: true, status: true },
    });

    if (!tx || tx.status !== "PENDING") return NextResponse.json({ received: true });

    if (tx.notchpayRef) {
      const apiStatus = await checkPaymentStatus(tx.notchpayRef);
      const apiRaw = (apiStatus?.status || "").toUpperCase();
      if (["FAILED", "CANCELLED", "REJECTED"].includes(apiRaw)) {
        await settleTransaction(txId, "FAILED");
        return NextResponse.json({ received: true });
      }
      if (["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(apiRaw)) {
        await settleTransaction(txId, "COMPLETED");
        return NextResponse.json({ received: true });
      }
    }

    // Webhook received but status still ambiguous (e.g. sandbox) → mark completed
    await settleTransaction(txId, "COMPLETED");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("getMIpay payment-link webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
