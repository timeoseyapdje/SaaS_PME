import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const EXEMPT_EMAILS = ["admin@nkapcontrol.com", "demo@nkapcontrol.com"];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true, emailVerified: true, role: true },
    });

    if (!user || !user.password) {
      // Ne pas révéler si l'utilisateur existe
      return NextResponse.json({ status: "ok" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ status: "ok" });
    }

    // Credentials valides mais email non vérifié
    if (!EXEMPT_EMAILS.includes(email) && !user.emailVerified) {
      return NextResponse.json({ status: "email_not_verified" });
    }

    return NextResponse.json({ status: "ok", role: user.role });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
