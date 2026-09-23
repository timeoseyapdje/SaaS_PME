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
  // Atomic update: only proceeds if transaction is still PENDING
  const updated = await prisma.paymentLinkTransaction.updateMany({
    where: { id: txId, status: "PENDING" },
    data: { status: outcome, paidAt: outcome === "COMPLETED" ? new Date() : null },
  });

  if (updated.count === 0) return; // already settled by another process

  if (outcome !== "COMPLETED") return;

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

  if (!transaction) return;

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

  if (transaction.paymentLink.clientId) {
    const year = new Date().getFullYear();
    const invoiceCount = await prisma.invoice.count({ where: { companyId: company.id } });
    const number = `FAC-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;
    await prisma.invoice.create({
      data: {
        companyId: company.id,
        clientId: transaction.paymentLink.clientId,
        number,
        status: "PAID",
        dueDate: new Date(),
        paidAt: new Date(),
        currency: transaction.paymentLink.currency,
        subtotal: transaction.amount,
        tvaRate: 0,
        tvaAmount: 0,
        total: transaction.amount,
        applyTVA: false,
        notes: `Paiement via lien — ${transaction.paymentLink.title}`,
        items: {
          create: [{
            description: transaction.paymentLink.title,
            quantity: 1,
            unitPrice: transaction.amount,
            total: transaction.amount,
          }],
        },
      },
    });
  }
}

// Helper: resolve outcome from getMIpay status API, or null if inconclusive
async function resolveOutcome(ref: string, payId?: string): Promise<"COMPLETED" | "FAILED" | null> {
  const result = await checkPaymentStatus(ref, payId);
  const raw = (result?.status || "").toUpperCase();
  if (["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(raw)) return "COMPLETED";
  if (["FAILED", "CANCELLED", "REJECTED", "TIMEOUT"].includes(raw)) return "FAILED";
  return null;
}

// GET — called by getMIpay to redirect the user after USSD processing
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get("txId");
  const slug = searchParams.get("slug");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";

  if (!txId || !slug) {
    return NextResponse.redirect(`${baseUrl}/pay/${slug || "unknown"}/failed`);
  }

  try {
    const transaction = await prisma.paymentLinkTransaction.findUnique({
      where: { id: txId },
      include: { paymentLink: true },
    });

    if (!transaction) {
      return NextResponse.redirect(`${baseUrl}/pay/${slug}/failed`);
    }

    const txParams = new URLSearchParams({
      txId,
      amount: String(transaction.amount),
      currency: transaction.paymentLink.currency,
      title: transaction.paymentLink.title,
    });

    // Already settled — just redirect
    if (transaction.status === "COMPLETED") {
      return NextResponse.redirect(`${baseUrl}/pay/${slug}/confirmed?${txParams.toString()}`);
    }
    if (transaction.status === "FAILED") {
      return NextResponse.redirect(`${baseUrl}/pay/${slug}/failed?${txParams.toString()}&reason=cancelled`);
    }

    // Try getMIpay API if we have a reference
    // providerRef holds the getMIpay transaction_reference (MPAYIN_...)
    if (transaction.providerRef) {
      const outcome = await resolveOutcome(transaction.providerRef);
      if (outcome === "FAILED") {
        await settleTransaction(txId, "FAILED");
        return NextResponse.redirect(`${baseUrl}/pay/${slug}/failed?${txParams.toString()}&reason=cancelled`);
      }
      if (outcome === "COMPLETED") {
        await settleTransaction(txId, "COMPLETED");
        return NextResponse.redirect(`${baseUrl}/pay/${slug}/confirmed?${txParams.toString()}`);
      }
    }

    // Not confirmed by the getMIpay API yet: the pending page keeps polling /status.
    return NextResponse.redirect(`${baseUrl}/pay/${slug}/pending?txId=${txId}`);
  } catch (error) {
    console.error("getMIpay payment-link callback GET error:", error);
    return NextResponse.redirect(`${baseUrl}/pay/${slug}/pending?txId=${txId}`);
  }
}

// POST — webhook from getMIpay after payment status changes
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // getMIpay sends order_id (= providerRef, MPAYIN_...); txId is in our callback URL.
    const txId = url.searchParams.get("txId");
    const orderId = (body.order_id as string | undefined) || (body.data?.order_id as string | undefined);
    if (!txId && !orderId) return NextResponse.json({ received: true });

    // This URL is public: the body's status is never trusted, only the getMIpay API's.
    const tx = await prisma.paymentLinkTransaction.findFirst({
      where: txId ? { id: txId } : { providerRef: orderId },
      select: { id: true, providerRef: true, status: true },
    });

    if (!tx || tx.status !== "PENDING" || !tx.providerRef) return NextResponse.json({ received: true });

    const outcome = await resolveOutcome(tx.providerRef);
    if (outcome) await settleTransaction(tx.id, outcome);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("getMIpay payment-link webhook POST error:", error);
    return NextResponse.json({ received: true });
  }
}
