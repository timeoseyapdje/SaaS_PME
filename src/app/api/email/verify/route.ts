import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail, sendWelcomeEmail } from "@/lib/email";

// POST - Send or resend a verification code
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    if (!user) return NextResponse.json({ success: true });

    // If Resend is not configured, skip email and signal the client
    if (!process.env.RESEND_API_KEY) {
      // Auto-verify the user immediately
      await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
      sendWelcomeEmail({ to: email, userName: user.name || "Utilisateur" }).catch(() => {});
      return NextResponse.json({ success: true, emailSent: false });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({ data: { identifier: email, token: code, expires } });

    const result = await sendVerificationCodeEmail({ to: email, code, userName: user.name || undefined });

    if (!result.success) {
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error("Verification email error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Verify code and mark email as verified
export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) return NextResponse.json({ error: "Email et code requis" }, { status: 400 });

    const token = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: code, expires: { gte: new Date() } },
    });

    if (!token) {
      return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 });
    }

    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: code } },
    });

    // Marquer l'email comme vérifié
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
      select: { name: true },
    });

    // Send welcome email
    sendWelcomeEmail({ to: email, userName: user.name || "Utilisateur" }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
