import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }), session: null };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Accès refusé - Admin requis" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}
