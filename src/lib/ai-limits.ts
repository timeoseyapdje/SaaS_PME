import { prisma } from "@/lib/prisma";

// Limites de messages IA par plan (PAR JOUR)
const AI_LIMITS: Record<string, number> = {
  STARTER: 0,   // Pas d'accès IA
  PRO: 10,      // 10 messages/jour
  MAX: -1,      // Illimité (-1 = pas de limite)
};

interface AIUsageResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  plan: string;
  message?: string;
}

/**
 * Vérifie si l'utilisateur peut envoyer un message IA
 * et retourne les infos d'utilisation
 */
export async function checkAIUsage(companyId: string): Promise<AIUsageResult> {
  // Récupérer le plan de l'entreprise
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    select: { plan: true, status: true },
  });

  const plan = subscription?.status === "ACTIVE" ? subscription.plan : "STARTER";
  const limit = AI_LIMITS[plan] ?? 0;

  // Plan MAX = illimité
  if (limit === -1) {
    return {
      allowed: true,
      remaining: -1,
      limit: -1,
      used: 0,
      plan,
    };
  }

  // Plan STARTER = pas d'accès
  if (limit === 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      used: 0,
      plan,
      message: "L'assistant IA est disponible à partir du plan Pro (10 messages/jour). Passez au plan Pro pour en profiter !",
    };
  }

  // Compter les messages du jour en cours
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      used: 0,
      plan,
      message: "Entreprise non trouvée",
    };
  }

  // Utiliser le modèle CurrencyRate comme compteur temporaire
  const dayKey = `${startOfDay.getFullYear()}-${String(startOfDay.getMonth() + 1).padStart(2, "0")}-${String(startOfDay.getDate()).padStart(2, "0")}`;

  const usageRecord = await prisma.currencyRate.findFirst({
    where: {
      fromCode: `AI_USAGE_${companyId}`,
      toCode: dayKey,
    },
  });

  const used = usageRecord?.rate || 0;
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      used,
      plan,
      message: `Vous avez atteint votre limite de ${limit} messages IA aujourd'hui. Revenez demain ou passez au plan Max pour un accès illimité !`,
    };
  }

  return {
    allowed: true,
    remaining,
    limit,
    used,
    plan,
  };
}

/**
 * Incrémente le compteur d'utilisation IA
 */
export async function incrementAIUsage(companyId: string): Promise<void> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dayKey = `${startOfDay.getFullYear()}-${String(startOfDay.getMonth() + 1).padStart(2, "0")}-${String(startOfDay.getDate()).padStart(2, "0")}`;

  const existing = await prisma.currencyRate.findFirst({
    where: {
      fromCode: `AI_USAGE_${companyId}`,
      toCode: dayKey,
    },
  });

  if (existing) {
    await prisma.currencyRate.update({
      where: { id: existing.id },
      data: { rate: existing.rate + 1 },
    });
  } else {
    await prisma.currencyRate.create({
      data: {
        fromCode: `AI_USAGE_${companyId}`,
        toCode: dayKey,
        rate: 1,
        date: startOfDay,
      },
    });
  }
}
