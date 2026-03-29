import { NextResponse } from "next/server";

// Compte démo - lecture seule
export const DEMO_EMAIL = "demo@nkapcontrol.cm";

export function isDemoAccount(email: string | null | undefined): boolean {
  return email === DEMO_EMAIL;
}

export function demoGuard(email: string | null | undefined) {
  if (isDemoAccount(email)) {
    return NextResponse.json(
      { error: "Modification non autorisée en mode démo. Créez votre propre compte pour utiliser cette fonctionnalité." },
      { status: 403 }
    );
  }
  return null;
}
