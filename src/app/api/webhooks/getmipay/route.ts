import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initiatePayOut, checkPaymentStatus } from "@/lib/getmipay";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

const MOBILE_MONEY_METHODS: Record<string, "MTN_MONEY" | "ORANGE_MONEY"> = {
  MTN_MONEY: "MTN_MONEY",
  ORANGE_MONEY: "ORANGE_MONEY",
};

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

    // Payment link transaction — full handling: status + balance + payout
    const plTx = await prisma.paymentLinkTransaction.findFirst({
      where: { OR: [{ transactionRef }, { notchpayRef: transactionRef }] },
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

    if (!plTx || plTx.status !== "PENDING") {
      return NextResponse.json({ received: true });
    }

    if (mappedStatus === "FAILED") {
      await prisma.paymentLinkTransaction.update({
        where: { id: plTx.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ received: true });
    }

    // If status is ambiguous (PENDING or unknown), query getMIpay API before settling
    if (mappedStatus !== "COMPLETED") {
      const statusResult = await checkPaymentStatus(
        plTx.transactionRef || plTx.id,
        plTx.notchpayRef || undefined
      );
      const apiStatus = (statusResult?.status || "").toUpperCase();
      const isApiSuccess = ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(apiStatus);
      const isApiFailed = ["FAILED", "CANCELLED", "REJECTED"].includes(apiStatus);

      if (isApiFailed) {
        await prisma.paymentLinkTransaction.update({
          where: { id: plTx.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ received: true });
      }

      if (!isApiSuccess) {
        // Still genuinely pending — do not settle yet
        return NextResponse.json({ received: true });
      }
    }

    // Status is confirmed COMPLETED: atomic update to prevent double-settlement
    const settled = await prisma.paymentLinkTransaction.updateMany({
      where: { id: plTx.id, status: "PENDING" },
      data: { status: "COMPLETED", paidAt: new Date() },
    });
    if (settled.count === 0) return NextResponse.json({ received: true });

    {
      const company = plTx.paymentLink.company;
      const defaultAccount = company.bankAccounts[0];

      if (defaultAccount) {
        await prisma.bankAccount.update({
          where: { id: defaultAccount.id },
          data: { balance: { increment: plTx.amount } },
        });

        const existingPayout = await prisma.payout.findUnique({
          where: { paymentLinkTransactionId: plTx.id },
        });

        if (!existingPayout) {
          const method = MOBILE_MONEY_METHODS[defaultAccount.type];
          const phone = defaultAccount.phoneNumber || defaultAccount.accountNumber;
          let payoutRef: string | undefined;
          let payoutStatus: "INITIATED" | "PROCESSING" | "FAILED" = "INITIATED";

          if (method && phone) {
            const payout = await initiatePayOut({
              amount: plTx.amount,
              currency: plTx.paymentLink.currency,
              wallet: phone,
              description: `Reversement - ${plTx.paymentLink.title}`,
              paymentMethod: method,
              reference: `payout-${plTx.id}`,
            });
            if (payout) { payoutRef = payout.transactionReference; payoutStatus = "PROCESSING"; }
            else { payoutStatus = "FAILED"; }
          }

          await prisma.payout.create({
            data: {
              companyId: company.id,
              bankAccountId: defaultAccount.id,
              paymentLinkTransactionId: plTx.id,
              amount: plTx.amount,
              currency: plTx.paymentLink.currency,
              status: payoutStatus,
              payoutRef: payoutRef ?? null,
            },
          });
        }
      }

      // Auto-generate invoice when a client is linked to the payment link
      if (plTx.paymentLink.clientId) {
        const year = new Date().getFullYear();
        const invoiceCount = await prisma.invoice.count({ where: { companyId: company.id } });
        const number = `FAC-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;
        await prisma.invoice.create({
          data: {
            companyId: company.id,
            clientId: plTx.paymentLink.clientId,
            number,
            status: "PAID",
            dueDate: new Date(),
            paidAt: new Date(),
            currency: plTx.paymentLink.currency,
            subtotal: plTx.amount,
            tvaRate: 0,
            tvaAmount: 0,
            total: plTx.amount,
            applyTVA: false,
            notes: `Paiement via lien — ${plTx.paymentLink.title}`,
            items: {
              create: [{
                description: plTx.paymentLink.title,
                quantity: 1,
                unitPrice: plTx.amount,
                total: plTx.amount,
              }],
            },
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("getMIpay webhook error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
