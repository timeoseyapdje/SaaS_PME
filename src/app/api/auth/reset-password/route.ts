import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const RESET_PREFIX = "reset:";

export async function POST(request: Request) {
  try {
    const { email, resetToken, newPassword } = await request.json();

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
    }

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: RESET_PREFIX + email, token: resetToken, expires: { gte: new Date() } },
    });

    if (!record) {
      return NextResponse.json({ error: "Lien de réinitialisation invalide ou expiré" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: RESET_PREFIX + email, token: resetToken } },
    });

    // Invalidate all existing sessions
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user) await prisma.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
