import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id: companyId } = await params;

  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    include: { payments: true },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Aucun abonnement trouvé" }, { status: 404 });
  }

  await prisma.$transaction([
    // Marquer tous les paiements comme FAILED
    prisma.payment.updateMany({
      where: { subscriptionId: subscription.id },
      data: { status: "FAILED" },
    }),
    // Rétrograder l'abonnement à STARTER et le suspendre
    prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: "STARTER",
        status: "SUSPENDED",
        endDate: new Date(),
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: "Abonnement suspendu et paiements annulés",
    previousPlan: subscription.plan,
    paymentsAffected: subscription.payments.length,
  });
}
