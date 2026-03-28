import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/email";

// POST - Envoyer un code de vérification par email
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou pas (sécurité)
      return NextResponse.json({ success: true, message: "Si cet email existe, un code a été envoyé." });
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocker le code avec expiration (15 minutes)
    // On utilise le champ VerificationToken de Prisma
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Supprimer les anciens tokens pour cet utilisateur
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Créer le nouveau token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires,
      },
    });

    // Envoyer l'email
    const result = await sendVerificationCodeEmail({
      to: email,
      code,
      userName: user.name || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Code de vérification envoyé",
    });
  } catch (error) {
    console.error("Verification email error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Vérifier un code
export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
    }

    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        expires: { gte: new Date() },
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Code invalide ou expiré" },
        { status: 400 }
      );
    }

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: code,
        },
      },
    });

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Email vérifié avec succès",
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
