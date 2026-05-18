import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializePayment, generateReference } from "@/lib/notchpay";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { payerName, email, phone } = await req.json();

  const paymentLink = await prisma.paymentLink.findFirst({
    where: { slug, status: "ACTIVE" },
    include: { company: true },
  });

  if (!paymentLink) {
    return NextResponse.json({ error: "Lien de paiement invalide ou expiré" }, { status: 404 });
  }

  const merchantRef = generateReference("PL");
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const result = await initializePayment({
      amount: paymentLink.amount,
      currency: "XAF",
      email: email || "",
      phone,
      description: paymentLink.description || `Paiement — ${paymentLink.company.name}`,
      reference: merchantRef,
      callbackUrl: `${baseUrl}/api/payments/notchpay/callback/payment-link?merchant_ref=${merchantRef}&slug=${slug}`,
    });

    if (result) {
      await prisma.paymentLinkTransaction.create({
        data: {
          paymentLinkId: paymentLink.id,
          amount: paymentLink.amount,
          paymentMethod: "NOTCHPAY",
          payerName: payerName || null,
          phoneNumber: phone || null,
          status: "PENDING",
          notchpayRef: result.reference,
          transactionRef: merchantRef,
        },
      });

      return NextResponse.json({ checkoutUrl: result.checkoutUrl, reference: result.reference });
    }

    return NextResponse.json({ error: "Erreur NotchPay" }, { status: 500 });
  } catch (error) {
    console.error("NotchPay payment link error:", error);
    return NextResponse.json({ error: "Erreur de paiement" }, { status: 500 });
  }
}
