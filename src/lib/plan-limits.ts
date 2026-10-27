import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Limites d'utilisateurs par plan d'abonnement
// Starter: 1 utilisateur, Pro: 5 utilisateurs, Max: illimité
export const PLAN_USER_LIMITS: Record<string, number> = {
  STARTER: 1,
  PRO: 5,
  MAX: -1, // -1 = illimité
};

export function getMaxUsers(plan: string): number {
  return PLAN_USER_LIMITS[plan] ?? 1;
}

export function canAddUser(plan: string, currentUserCount: number): boolean {
  const max = getMaxUsers(plan);
  if (max === -1) return true;
  return currentUserCount < max;
}

export function getRemainingSlots(plan: string, currentUserCount: number): number {
  const max = getMaxUsers(plan);
  if (max === -1) return -1; // illimité
  return Math.max(0, max - currentUserCount);
}

export const SUBSCRIPTION_PRICES: Record<string, number> = {
  PRO: 3000,
  MAX: 10000,
};

// Le plan payé se déduit du montant réellement encaissé, jamais d'un paramètre d'URL.
export function planForAmount(amount: number): "PRO" | "MAX" {
  return amount >= SUBSCRIPTION_PRICES.MAX ? "MAX" : "PRO";
}

export const STARTER_MONTHLY_INVOICE_LIMIT = 20;

// Un abonnement expiré ou non actif retombe sur Starter.
export async function getEffectivePlan(companyId: string): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    select: { plan: true, status: true, endDate: true },
  });
  if (!subscription || subscription.status !== "ACTIVE") return "STARTER";
  if (subscription.plan !== "STARTER" && subscription.endDate && subscription.endDate < new Date()) return "STARTER";
  return subscription.plan;
}

export async function checkInvoiceQuota(companyId: string): Promise<NextResponse | null> {
  if ((await getEffectivePlan(companyId)) !== "STARTER") return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const count = await prisma.invoice.count({ where: { companyId, createdAt: { gte: monthStart } } });
  if (count < STARTER_MONTHLY_INVOICE_LIMIT) return null;

  return NextResponse.json(
    { error: `Limite de ${STARTER_MONTHLY_INVOICE_LIMIT} factures par mois atteinte sur le plan Starter. Passez au plan Pro pour des factures illimitées.` },
    { status: 403 }
  );
}
