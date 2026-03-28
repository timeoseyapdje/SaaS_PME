import { prisma } from "@/lib/prisma";

// Limites de messages IA par plan
const AI_LIMITS: Record<string, number> = {
  STARTER: 0,   // Pas d'accès IA
  PRO: 50,      // 50 messages/mois
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
      message: "L'assistant IA est disponible à partir du plan Pro (50 messages/mois). Passez au plan Pro pour en profiter !",
    };
  }

  // Compter les messages du mois en cours
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // On compte via les invocations stockées dans une table simple
  // Comme on n'a pas de table dédiée, on utilise un compteur en mémoire
  // via un champ sur la company ou un cache
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
  // (en attendant une table dédiée ai_usage)
  const monthKey = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, "0")}`;

  const usageRecord = await prisma.currencyRate.findFirst({
    where: {
      fromCode: `AI_USAGE_${companyId}`,
      toCode: monthKey,
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
      message: `Vous avez atteint votre limite de ${limit} messages IA ce mois-ci. Passez au plan Max pour un accès illimité !`,
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
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthKey = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, "0")}`;

  const existing = await prisma.currencyRate.findFirst({
    where: {
      fromCode: `AI_USAGE_${companyId}`,
      toCode: monthKey,
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
        toCode: monthKey,
        rate: 1,
        date: startOfMonth,
      },
    });
  }
}
