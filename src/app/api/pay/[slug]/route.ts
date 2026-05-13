import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializePayment, isNotchPayConfigured } from "@/lib/notchpay";
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

    return NextResponse.json({ ...link, notchpayEnabled: isNotchPayConfigured() });
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

    // Create transaction record
    const transaction = await prisma.paymentLinkTransaction.create({
      data: {
        paymentLinkId: link.id,
        amount: link.amount,
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

    // Notify the merchant by email
    if (link.company?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkap-control.vercel.app";
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

    // If NotchPay is configured, initialize online payment
    if (isNotchPayConfigured()) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkap-control.vercel.app";
      const callbackUrl = `${appUrl}/api/webhooks/payment-links`;
      const email = payerEmail || link.company?.email || "client@nkapcontrol.com";

      const notchpay = await initializePayment({
        email,
        amount: link.amount,
        currency: link.currency,
        reference: transaction.id,
        description: link.title,
        callbackUrl,
      });

      if (notchpay) {
        // Save the NotchPay reference for webhook matching
        await prisma.paymentLinkTransaction.update({
          where: { id: transaction.id },
          data: { transactionRef: notchpay.reference },
        });
        return NextResponse.json({ checkoutUrl: notchpay.checkoutUrl });
      }
    }

    // Fallback: manual confirmation flow
    return NextResponse.json({ message: "Transaction enregistrée. Le marchand vous contactera pour confirmation." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
