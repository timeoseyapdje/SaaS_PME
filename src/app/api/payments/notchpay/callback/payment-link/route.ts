import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/notchpay";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trxref = searchParams.get("trxref");
  const merchantRef = searchParams.get("merchant_ref");
  const slug = searchParams.get("slug");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const notchpayRef = trxref || merchantRef;
  if (!notchpayRef || !slug) {
    return NextResponse.redirect(`${baseUrl}/pay/${slug || "error"}?status=error`);
  }

  try {
    const result = await verifyPayment(notchpayRef);

    if (result.transaction?.status === "complete") {
      const transaction = await prisma.paymentLinkTransaction.findFirst({
        where: {
          OR: [
            { notchpayRef: notchpayRef },
            { notchpayRef: result.transaction.reference },
            { transactionRef: merchantRef || undefined },
          ],
        },
      });

      if (transaction && transaction.status !== "COMPLETED") {
        await prisma.paymentLinkTransaction.update({
          where: { id: transaction.id },
          data: { status: "COMPLETED", paidAt: new Date() },
        });
      }

      return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=success`);
    }

    return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=pending`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/pay/${slug}?status=error`);
  }
}
