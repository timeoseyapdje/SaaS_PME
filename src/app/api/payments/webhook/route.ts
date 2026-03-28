import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

// POST - Webhook de callback pour les paiements (MTN MoMo, Orange Money, etc.)
// Ce endpoint est appelé par le provider de paiement quand le paiement est complété
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extraire les données du webhook selon le provider
    const {
      transactionRef,
      status,
      amount,
      paymentMethod,
      provider, // "mtn", "orange", "stripe", etc.
    } = body;

    if (!transactionRef || !status) {
      return NextResponse.json(
        { error: "Données webhook invalides" },
        { status: 400 }
      );
    }

    // Trouver le paiement par référence de transaction
    const payment = await prisma.payment.findFirst({
      where: { transactionRef },
      include: {
        subscription: {
          include: {
            company: {
              include: {
                users: {
                  where: { role: "ADMIN" },
                  select: { email: true, name: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      console.error(`Webhook: Paiement non trouvé pour ref ${transactionRef}`);
      return NextResponse.json(
        { error: "Paiement non trouvé" },
        { status: 404 }
      );
    }

    // Mapper le statut du provider vers notre statut
    const statusMap: Record<string, string> = {
      SUCCESSFUL: "COMPLETED",
      SUCCESS: "COMPLETED",
      COMPLETED: "COMPLETED",
      FAILED: "FAILED",
      CANCELLED: "FAILED",
      PENDING: "PENDING",
    };

    const mappedStatus = statusMap[status.toUpperCase()] || "PENDING";

    // Mettre à jour le paiement
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: mappedStatus as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED",
        paidAt: mappedStatus === "COMPLETED" ? new Date() : null,
      },
    });

    // Si le paiement est complété, activer l'abonnement + envoyer email
    if (mappedStatus === "COMPLETED") {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
        },
      });

      // Envoyer l'email de confirmation
      const adminUser = payment.subscription?.company?.users?.[0];
      if (adminUser?.email) {
        await sendSubscriptionConfirmationEmail({
          to: adminUser.email,
          userName: adminUser.name || "Utilisateur",
          plan: payment.subscription?.plan || "PRO",
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          endDate: endDate.toISOString(),
        });
      }
    }

    // Si échoué, marquer l'abonnement comme suspendu
    if (mappedStatus === "FAILED") {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "SUSPENDED" },
      });
    }

    console.log(
      `Webhook [${provider}]: Paiement ${transactionRef} -> ${mappedStatus} (${amount} XAF)`
    );

    return NextResponse.json({ success: true, status: mappedStatus });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
