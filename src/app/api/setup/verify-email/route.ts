import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint to verify an email without being logged in.
// Requires ?secret=SETUP_SECRET env var (default: "nkap-setup-2026" for easy bootstrapping).
export async function POST(request: Request) {
  try {
    const { email, secret } = await request.json();

    const expectedSecret = process.env.SETUP_SECRET || "nkap-setup-2026";
    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Secret invalide" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Déjà vérifié" });
    }

    await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });

    return NextResponse.json({ success: true, message: `${email} vérifié avec succès` });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
