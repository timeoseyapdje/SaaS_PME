import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const FROM_EMAIL = process.env.FROM_EMAIL || "Nkap Control <onboarding@resend.dev>";
const APP_NAME = "Nkap Control";

// POST - Envoyer une notification/email aux utilisateurs
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { subject, message, targetType, targetUserIds } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Sujet et message requis" },
        { status: 400 }
      );
    }

    // Récupérer les destinataires
    let users;
    if (targetType === "specific" && targetUserIds?.length > 0) {
      // Utilisateurs spécifiques
      users = await prisma.user.findMany({
        where: { id: { in: targetUserIds } },
        select: { id: true, name: true, email: true },
      });
    } else {
      // Tous les utilisateurs
      users = await prisma.user.findMany({
        select: { id: true, name: true, email: true },
      });
    }

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Aucun destinataire trouvé" },
        { status: 400 }
      );
    }

    const resend = getResendClient();
    let emailsSent = 0;
    let emailsFailed = 0;

    // Envoyer les emails
    if (resend) {
      for (const user of users) {
        try {
          const html = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
              </div>
              <div style="padding: 32px; color: #d4d4d8;">
                <p style="font-size: 16px; margin: 0 0 24px;">
                  Bonjour <strong style="color: white;">${user.name || "Utilisateur"}</strong>,
                </p>
                <div style="background: #18181b; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                  <h2 style="color: white; font-size: 16px; margin: 0 0 12px;">${subject}</h2>
                  <div style="color: #a1a1aa; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                </div>
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nkap-control.vercel.app"}/dashboard"
                     style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Acceder au tableau de bord
                  </a>
                </div>
              </div>
              <div style="padding: 20px 32px; background: #09090b; text-align: center;">
                <p style="color: #52525b; font-size: 12px; margin: 0;">${APP_NAME} - Gestion financiere pour PME camerounaises</p>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: FROM_EMAIL,
            to: user.email,
            subject: `${APP_NAME} - ${subject}`,
            html,
          });
          emailsSent++;
        } catch (err) {
          console.error(`Erreur envoi email à ${user.email}:`, err);
          emailsFailed++;
        }
      }
    } else {
      return NextResponse.json(
        { error: "Service email non configuré (RESEND_API_KEY manquante)" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      totalTargeted: users.length,
      emailsSent,
      emailsFailed,
      message: `Notification envoyée à ${emailsSent} utilisateur(s)`,
    });
  } catch (err) {
    console.error("Admin notification error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
