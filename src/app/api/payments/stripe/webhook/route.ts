import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string)
  : null;

// POST - Webhook Stripe pour confirmer les paiements
export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch {
      return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { companyId, userId, plan, amountXAF, promoCode } = session.metadata || {};

      if (!companyId || !plan) {
        console.error("Stripe webhook: metadata manquante");
        return NextResponse.json({ error: "Metadata manquante" }, { status: 400 });
      }

      const finalAmount = parseInt(amountXAF || "0");
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Gérer le code promo
      if (promoCode) {
        const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
        if (promo) {
          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { currentUses: { increment: 1 } },
          });
          if (userId) {
            await prisma.promoCodeUsage.create({
              data: { promoCodeId: promo.id, userId },
            });
          }
        }
      }

      // Créer/mettre à jour l'abonnement
      const subscription = await prisma.subscription.upsert({
        where: { companyId },
        update: {
          plan: plan as "PRO" | "MAX",
          amount: finalAmount,
          paymentMethod: "CARTE_BANCAIRE",
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
        },
        create: {
          companyId,
          plan: plan as "PRO" | "MAX",
          amount: finalAmount,
          currency: "XAF",
          paymentMethod: "CARTE_BANCAIRE",
          status: "ACTIVE",
          endDate,
        },
      });

      // Enregistrer le paiement
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: finalAmount,
          currency: "XAF",
          paymentMethod: "CARTE_BANCAIRE",
          transactionRef: session.payment_intent as string,
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });

      // Envoyer email de confirmation
      if (session.customer_email) {
        const user = await prisma.user.findFirst({
          where: { companyId },
          select: { name: true },
        });
        sendSubscriptionConfirmationEmail({
          to: session.customer_email,
          userName: user?.name || "Utilisateur",
          plan,
          amount: finalAmount,
          paymentMethod: "CARTE_BANCAIRE",
          endDate: endDate.toISOString(),
        }).catch((err) => console.error("Email error:", err));
      }

      console.log(`Stripe: Paiement ${session.payment_intent} confirmé - Plan ${plan} pour ${companyId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
