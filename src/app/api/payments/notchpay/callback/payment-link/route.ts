import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment, initiateTransfer } from "@/lib/notchpay";

const MOBILE_MONEY_CHANNELS: Record<string, "cm.mtn" | "cm.orange"> = {
  MTN_MONEY: "cm.mtn",
  ORANGE_MONEY: "cm.orange",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trxref = searchParams.get("trxref");
  const merchantRef = searchParams.get("merchant_ref");
  const slug = searchParams.get("slug");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";

  const notchpayRef = trxref || merchantRef;
  if (!notchpayRef || !slug) {
    return NextResponse.redirect(`${baseUrl}/pay/${slug || "error"}?status=error`);
  }

  try {
    const result = await verifyPayment(notchpayRef);

    if (result.transaction?.status === "complete") {
      // Find transaction by notchpayRef OR transactionRef (merchant ref)
      const transaction = await prisma.paymentLinkTransaction.findFirst({
        where: {
          OR: [
            { notchpayRef: notchpayRef },
            { notchpayRef: result.transaction.reference },
            { transactionRef: merchantRef || undefined },
            { id: merchantRef || undefined },
          ],
        },
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

      if (transaction && transaction.status !== "COMPLETED") {
        await prisma.paymentLinkTransaction.update({
          where: { id: transaction.id },
          data: { status: "COMPLETED", paidAt: new Date() },
        });

        // Trigger payout to merchant's default bank account
        const company = transaction.paymentLink.company;
        const defaultAccount = company.bankAccounts[0];

        if (defaultAccount) {
          // Update treasury balance
          await prisma.bankAccount.update({
            where: { id: defaultAccount.id },
            data: { balance: { increment: transaction.amount } },
          });

          // Attempt automatic transfer for mobile money accounts
          const channel = MOBILE_MONEY_CHANNELS[defaultAccount.type];
          const phone = defaultAccount.phoneNumber || defaultAccount.accountNumber;

          let payoutRef: string | undefined;
          let payoutStatus: "INITIATED" | "PROCESSING" | "FAILED" = "INITIATED";

          if (channel && phone) {
            const transfer = await initiateTransfer({
              amount: transaction.amount,
              currency: transaction.paymentLink.currency,
              phoneNumber: phone,
              channel,
              description: `Reversement - ${transaction.paymentLink.title}`,
              reference: `payout-${transaction.id}`,
            });

            if (transfer) {
              payoutRef = transfer.reference;
              payoutStatus = "PROCESSING";
            } else {
              payoutStatus = "FAILED";
            }
          }

          // Check if payout already exists (idempotency)
          const existingPayout = await prisma.payout.findUnique({
            where: { paymentLinkTransactionId: transaction.id },
          });

          if (!existingPayout) {
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
        }
      }

      return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=success`);
    }

    return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=pending`);
  } catch (error) {
    console.error("Payment link callback error:", error);
    return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=error`);
  }
}
