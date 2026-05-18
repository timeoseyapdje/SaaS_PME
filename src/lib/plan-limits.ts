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
