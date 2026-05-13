import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const RESET_PREFIX = "reset:";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    // Always return success to avoid leaking whether email exists
    if (!user) return NextResponse.json({ emailSent: true });

    // Delete any existing reset token for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: RESET_PREFIX + email } });

    const expires = new Date(Date.now() + 15 * 60 * 1000);
    const emailAvailable = !!process.env.RESEND_API_KEY;

    if (emailAvailable) {
      // Code flow: 6-digit code sent by email
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.verificationToken.create({
        data: { identifier: RESET_PREFIX + email, token: code, expires },
      });
      await sendVerificationCodeEmail({ to: email, code, userName: user.name || undefined });
      return NextResponse.json({ emailSent: true });
    } else {
      // No email: generate a one-time token returned directly so the frontend
      // can skip the code step and go straight to the new password form.
      const token = randomBytes(32).toString("hex");
      await prisma.verificationToken.create({
        data: { identifier: RESET_PREFIX + email, token, expires },
      });
      return NextResponse.json({ emailSent: false, resetToken: token });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Verify 6-digit code and return a reset token
export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) return NextResponse.json({ error: "Email et code requis" }, { status: 400 });

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: RESET_PREFIX + email, token: code, expires: { gte: new Date() } },
    });

    if (!record) return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 });

    // Replace the 6-digit code with a secure one-time reset token
    const resetToken = randomBytes(32).toString("hex");
    await prisma.verificationToken.update({
      where: { identifier_token: { identifier: RESET_PREFIX + email, token: code } },
      data: { token: resetToken, expires: new Date(Date.now() + 10 * 60 * 1000) },
    });

    return NextResponse.json({ resetToken });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
