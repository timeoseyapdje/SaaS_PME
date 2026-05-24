import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializePayment, isNotchPayConfigured, calculateGrossAmount } from "@/lib/notchpay";
import { sendPaymentRequestNotification } from "@/lib/email";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const link = await prisma.paymentLink.findUnique({
      where: { slug },
      include: {
        company: { select: { name: true, phone: true, email: true, logo: true, city: true } },
        client: { select: { name: true, email: true } },
      },
    });

    if (!link) return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    if (link.status !== "ACTIVE") return NextResponse.json({ error: "Ce lien de paiement est désactivé" }, { status: 410 });
    if (link.expiresAt && link.expiresAt < new Date()) {
      await prisma.paymentLink.update({ where: { slug }, data: { status: "EXPIRED" } });
      return NextResponse.json({ error: "Ce lien de paiement a expiré" }, { status: 410 });
    }
    if (link.maxUses && link.currentUses >= link.maxUses) {
      return NextResponse.json({ error: "Ce lien a atteint son nombre maximum d'utilisations" }, { status: 410 });
    }

    const { grossAmount, feeAmount } = calculateGrossAmount(link.amount);
    // Only expose safe fields to the public
    return NextResponse.json({
      id: link.id,
      title: link.title,
      description: link.description,
      amount: link.amount,
      currency: link.currency,
      slug: link.slug,
      status: link.status,
      currentUses: link.currentUses,
      maxUses: link.maxUses,
      company: link.company,
      client: link.client,
      notchpayEnabled: isNotchPayConfigured(),
      grossAmount,
      feeAmount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const link = await prisma.paymentLink.findUnique({
      where: { slug },
      include: { company: { select: { name: true, email: true } } },
    });

    if (!link || link.status !== "ACTIVE") {
      return NextResponse.json({ error: "Lien invalide ou désactivé" }, { status: 404 });
    }

    const { paymentMethod, phoneNumber, payerName, payerEmail } = await request.json();
    if (!paymentMethod) {
      return NextResponse.json({ error: "Méthode de paiement requise" }, { status: 400 });
    }

    // For online mobile money payments, gross up the amount so company receives exactly link.amount
    const isOnline = isNotchPayConfigured() && ["MTN_MONEY", "ORANGE_MONEY"].includes(paymentMethod);
    const { grossAmount, feeAmount } = calculateGrossAmount(link.amount);
    const chargedAmount = isOnline ? grossAmount : link.amount;

    const transaction = await prisma.paymentLinkTransaction.create({
      data: {
        paymentLinkId: link.id,
        amount: link.amount,
        grossAmount: isOnline ? grossAmount : null,
        feeAmount: isOnline ? feeAmount : null,
        paymentMethod,
        phoneNumber: phoneNumber || null,
        payerName: payerName || null,
        status: "PENDING",
      },
    });

    await prisma.paymentLink.update({
      where: { slug },
      data: { currentUses: { increment: 1 } },
    });

    if (link.company?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";
      sendPaymentRequestNotification({
        to: link.company.email,
        merchantName: link.company.name,
        payerName: payerName || undefined,
        paymentMethod,
        amount: link.amount,
        currency: link.currency,
        linkTitle: link.title,
        dashboardUrl: `${appUrl}/payment-links`,
      }).catch(console.error);
    }

    if (isOnline) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";
      // Callback = user redirect after payment (GET), NOT the webhook (POST)
      const callbackUrl = `${appUrl}/api/payments/notchpay/callback/payment-link?slug=${slug}`;
      const email = payerEmail || link.company?.email || "client@nkapcontrol.com";

      const notchpay = await initializePayment({
        email,
        amount: chargedAmount,
        currency: link.currency,
        reference: transaction.id,
        description: link.title,
        callbackUrl,
        phone: phoneNumber || undefined,
      });

      if (notchpay) {
        await prisma.paymentLinkTransaction.update({
          where: { id: transaction.id },
          data: {
            notchpayRef: notchpay.reference,       // trx.xxx from NotchPay
            transactionRef: transaction.id,          // our own merchant ref
          },
        });
        return NextResponse.json({ checkoutUrl: notchpay.checkoutUrl });
      }
    }

    return NextResponse.json({ message: "Transaction enregistrée. Le marchand vous contactera pour confirmation." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
