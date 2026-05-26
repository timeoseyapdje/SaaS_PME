import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus, initiatePayOut } from "@/lib/getmipay";

const MOBILE_MONEY_METHODS: Record<string, "MTN_MONEY" | "ORANGE_MONEY"> = {
  MTN_MONEY: "MTN_MONEY",
  ORANGE_MONEY: "ORANGE_MONEY",
};

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

    if (!transaction) {
      return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=error`);
    }

    const getmipayRef = transaction.notchpayRef || txId;
    const statusResult = await checkPaymentStatus(getmipayRef);
    const rawStatus = statusResult?.status?.toUpperCase() || "";
    const isSuccess = ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(rawStatus);

    if (isSuccess && transaction.status !== "COMPLETED") {
      await prisma.paymentLinkTransaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED", paidAt: new Date() },
      });

      const company = transaction.paymentLink.company;
      const defaultAccount = company.bankAccounts[0];

      if (defaultAccount) {
        await prisma.bankAccount.update({
          where: { id: defaultAccount.id },
          data: { balance: { increment: transaction.amount } },
        });

        const existingPayout = await prisma.payout.findUnique({
          where: { paymentLinkTransactionId: transaction.id },
        });

        if (!existingPayout) {
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
              paymentLinkTransactionId: transaction.id,
              amount: transaction.amount,
              currency: transaction.paymentLink.currency,
              status: payoutStatus,
              payoutRef: payoutRef ?? null,
            },
          });
        }
      }

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
