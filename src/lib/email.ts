import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

const FROM_EMAIL = process.env.FROM_EMAIL || "Nkap Control <no-reply@nkapcontrol.com>";
const APP_NAME = "Nkap Control";

const NO_REPLY_NOTICE = `<p style="color: #3f3f46; font-size: 11px; margin: 4px 0 0;">Cet email est envoyé automatiquement — merci de ne pas y répondre.</p>`;

// ============================================================
// EMAIL: Confirmation de paiement d'abonnement
// ============================================================
export async function sendSubscriptionConfirmationEmail({
  to,
  userName,
  plan,
  amount,
  paymentMethod,
  endDate,
}: {
  to: string;
  userName: string;
  plan: string;
  amount: number;
  paymentMethod: string;
  endDate: string;
}) {
  const paymentMethodLabels: Record<string, string> = {
    MTN_MONEY: "MTN Mobile Money",
    ORANGE_MONEY: "Orange Money",
    VIREMENT: "Virement bancaire",
    CARTE_BANCAIRE: "Carte bancaire",
  };

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Confirmation de paiement</p>
      </div>
      <div style="padding: 32px; color: #d4d4d8;">
        <p style="font-size: 16px; margin: 0 0 24px;">Bonjour <strong style="color: white;">${userName}</strong>,</p>
        <p style="margin: 0 0 24px;">Votre paiement a bien été reçu. Votre abonnement est maintenant actif.</p>

        <div style="background: #18181b; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Plan</td>
              <td style="padding: 8px 0; text-align: right; color: white; font-weight: 600;">${plan}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Montant</td>
              <td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 700; font-size: 18px;">${amount.toLocaleString()} XAF</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Mode de paiement</td>
              <td style="padding: 8px 0; text-align: right; color: white;">${paymentMethodLabels[paymentMethod] || paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Valide jusqu'au</td>
              <td style="padding: 8px 0; text-align: right; color: white;">${new Date(endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</td>
            </tr>
          </table>
        </div>

        <p style="margin: 0 0 24px; font-size: 14px; color: #a1a1aa;">Vous pouvez gérer votre abonnement depuis votre tableau de bord.</p>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nkap-control.vercel.app"}/subscription"
             style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Voir mon abonnement
          </a>
        </div>
      </div>
      <div style="padding: 20px 32px; background: #09090b; text-align: center;">
        <p style="color: #52525b; font-size: 12px; margin: 0;">${APP_NAME} - Gestion financiere pour PME camerounaises</p>
        ${NO_REPLY_NOTICE}
      </div>
    </div>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("Resend non configuré - email non envoyé");
      return { success: false, error: "RESEND_API_KEY non configurée" };
    }
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${APP_NAME} - Paiement confirmé - Plan ${plan}`,
      html,
    });
    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Email send exception:", err);
    return { success: false, error: err };
  }
}

// ============================================================
// EMAIL: Envoi de facture
// ============================================================
export async function sendInvoiceEmail({
  to,
  clientName,
  companyName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  items,
  notes,
}: {
  to: string;
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  notes?: string;
}) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #d4d4d8; font-size: 14px;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #a1a1aa; text-align: center; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #a1a1aa; text-align: right; font-size: 14px;">${item.unitPrice.toLocaleString()} ${currency}</td>
        <td style="padding: 10px; border-bottom: 1px solid #27272a; color: white; text-align: right; font-weight: 600; font-size: 14px;">${item.total.toLocaleString()} ${currency}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${companyName}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Facture ${invoiceNumber}</p>
      </div>
      <div style="padding: 32px; color: #d4d4d8;">
        <p style="font-size: 16px; margin: 0 0 24px;">Bonjour <strong style="color: white;">${clientName}</strong>,</p>
        <p style="margin: 0 0 24px;">Veuillez trouver ci-dessous le detail de votre facture.</p>

        <table style="width: 100%; border-collapse: collapse; background: #18181b; border-radius: 12px; overflow: hidden; margin: 0 0 24px;">
          <thead>
            <tr style="background: #27272a;">
              <th style="padding: 12px 10px; text-align: left; color: #71717a; font-size: 12px; text-transform: uppercase;">Description</th>
              <th style="padding: 12px 10px; text-align: center; color: #71717a; font-size: 12px; text-transform: uppercase;">Qté</th>
              <th style="padding: 12px 10px; text-align: right; color: #71717a; font-size: 12px; text-transform: uppercase;">Prix unit.</th>
              <th style="padding: 12px 10px; text-align: right; color: #71717a; font-size: 12px; text-transform: uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background: #18181b; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #71717a; font-size: 14px;">Total TTC</span>
            <span style="color: #10b981; font-weight: 700; font-size: 24px;">${amount.toLocaleString()} ${currency}</span>
          </div>
          <div style="margin-top: 8px;">
            <span style="color: #71717a; font-size: 13px;">Echeance : </span>
            <span style="color: white; font-size: 13px;">${new Date(dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        ${notes ? `<p style="margin: 0 0 24px; font-size: 13px; color: #a1a1aa; font-style: italic;">${notes}</p>` : ""}

        <p style="margin: 0; font-size: 13px; color: #71717a;">Cette facture a été generée via ${APP_NAME}.</p>
      </div>
      <div style="padding: 20px 32px; background: #09090b; text-align: center;">
        <p style="color: #52525b; font-size: 12px; margin: 0;">Envoyé depuis ${APP_NAME}</p>
        ${NO_REPLY_NOTICE}
      </div>
    </div>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("Resend non configuré - email non envoyé");
      return { success: false, error: "RESEND_API_KEY non configurée" };
    }
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Facture ${invoiceNumber} - ${companyName}`,
      html,
    });
    if (error) {
      console.error("Invoice email error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Invoice email exception:", err);
    return { success: false, error: err };
  }
}

// ============================================================
// EMAIL: Code de vérification
// ============================================================
export async function sendVerificationCodeEmail({
  to,
  code,
  userName,
}: {
  to: string;
  code: string;
  userName?: string;
}) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Verification de votre compte</p>
      </div>
      <div style="padding: 32px; color: #d4d4d8; text-align: center;">
        <p style="font-size: 16px; margin: 0 0 24px;">
          ${userName ? `Bonjour <strong style="color: white;">${userName}</strong>,` : "Bonjour,"}
        </p>
        <p style="margin: 0 0 32px;">Voici votre code de verification :</p>

        <div style="background: #18181b; border-radius: 16px; padding: 24px; margin: 0 auto 32px; max-width: 280px;">
          <p style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #10b981; margin: 0;">${code}</p>
        </div>

        <p style="margin: 0 0 8px; font-size: 13px; color: #a1a1aa;">Ce code expire dans <strong style="color: white;">15 minutes</strong>.</p>
        <p style="margin: 0; font-size: 13px; color: #71717a;">Si vous n'avez pas demande ce code, ignorez cet email.</p>
      </div>
      <div style="padding: 20px 32px; background: #09090b; text-align: center;">
        <p style="color: #52525b; font-size: 12px; margin: 0;">${APP_NAME} - Gestion financiere pour PME camerounaises</p>
        ${NO_REPLY_NOTICE}
      </div>
    </div>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("Resend non configuré - email non envoyé");
      return { success: false, error: "RESEND_API_KEY non configurée" };
    }
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${APP_NAME} - Code de verification: ${code}`,
      html,
    });
    if (error) {
      console.error("Verification email error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Verification email exception:", err);
    return { success: false, error: err };
  }
}

// ============================================================
// EMAIL: Bienvenue après vérification du compte
// ============================================================
export async function sendWelcomeEmail({ to, userName }: { to: string; userName: string }) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Bienvenue !</p>
      </div>
      <div style="padding: 32px; color: #d4d4d8; text-align: center;">
        <p style="font-size: 18px; margin: 0 0 8px; color: white; font-weight: 700;">Votre compte est actif !</p>
        <p style="margin: 0 0 24px; font-size: 15px;">Bonjour <strong style="color: white;">${userName}</strong>, votre adresse email a été vérifiée avec succès.</p>
        <p style="margin: 0 0 32px; font-size: 14px; color: #a1a1aa;">Vous pouvez maintenant gérer votre trésorerie, créer des factures, suivre vos dépenses et bien plus encore.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nkap-control.vercel.app"}/dashboard"
           style="display: inline-block; background: #059669; color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
          Accéder à mon espace
        </a>
      </div>
      <div style="padding: 20px 32px; background: #09090b; text-align: center;">
        <p style="color: #52525b; font-size: 12px; margin: 0;">${APP_NAME} · Gestion financière pour PME camerounaises · <a href="mailto:contact@nkapcontrol.com" style="color: #52525b;">contact@nkapcontrol.com</a></p>
        ${NO_REPLY_NOTICE}
      </div>
    </div>
  `;
  try {
    const resend = getResendClient();
    if (!resend) return { success: false };
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject: `Bienvenue sur ${APP_NAME} !`, html });
    if (error) { console.error("Welcome email error:", error); return { success: false }; }
    return { success: true };
  } catch (err) { console.error("Welcome email exception:", err); return { success: false }; }
}

// ============================================================
// EMAIL: Nouvelle demande de paiement (notification au marchand)
// ============================================================
export async function sendPaymentRequestNotification({
  to,
  merchantName,
  payerName,
  paymentMethod,
  amount,
  currency,
  linkTitle,
  dashboardUrl,
}: {
  to: string;
  merchantName: string;
  payerName?: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  linkTitle: string;
  dashboardUrl: string;
}) {
  const methodLabels: Record<string, string> = {
    MTN_MONEY: "MTN Mobile Money", ORANGE_MONEY: "Orange Money",
    VIREMENT: "Virement bancaire", ESPECES: "Espèces",
  };
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Nouvelle demande de paiement</p>
      </div>
      <div style="padding: 32px; color: #d4d4d8;">
        <p style="font-size: 16px; margin: 0 0 20px;">Bonjour <strong style="color: white;">${merchantName}</strong>,</p>
        <p style="margin: 0 0 24px;">Un client vient de soumettre une demande de paiement via votre lien <strong style="color: white;">${linkTitle}</strong>.</p>
        <div style="background: #18181b; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Client</td><td style="padding: 8px 0; text-align: right; color: white;">${payerName || "Anonyme"}</td></tr>
            <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Montant</td><td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 700; font-size: 18px;">${amount.toLocaleString()} ${currency}</td></tr>
            <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Méthode</td><td style="padding: 8px 0; text-align: right; color: white;">${methodLabels[paymentMethod] || paymentMethod}</td></tr>
          </table>
        </div>
        <p style="margin: 0 0 24px; font-size: 14px; color: #a1a1aa;">Connectez-vous à votre tableau de bord pour confirmer ou rejeter cette demande.</p>
        <div style="text-align: center;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Confirmer le paiement
          </a>
        </div>
      </div>
      <div style="padding: 20px 32px; background: #09090b; text-align: center;">
        <p style="color: #52525b; font-size: 12px; margin: 0;">${APP_NAME} · Gestion financière pour PME camerounaises</p>
        ${NO_REPLY_NOTICE}
      </div>
    </div>
  `;
  try {
    const resend = getResendClient();
    if (!resend) return { success: false };
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject: `Nouvelle demande de paiement — ${amount.toLocaleString()} ${currency}`, html });
    if (error) { console.error("Payment request email error:", error); return { success: false }; }
    return { success: true };
  } catch (err) { console.error("Payment request email exception:", err); return { success: false }; }
}

// ============================================================
// EMAIL: Paiement confirmé (notification au client)
// ============================================================
export async function sendPaymentConfirmedEmail({
  to,
  payerName,
  companyName,
  amount,
  currency,
  paymentMethod,
  linkTitle,
}: {
  to: string;
  payerName: string;
  companyName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  linkTitle: string;
}) {
  const methodLabels: Record<string, string> = {
    MTN_MONEY: "MTN Mobile Money", ORANGE_MONEY: "Orange Money",
    VIREMENT: "Virement bancaire", ESPECES: "Espèces",
  };
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${companyName}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Paiement confirmé</p>
      </div>
      <div style="padding: 32px; color: #d4d4d8; text-align: center;">
        <p style="font-size: 18px; margin: 0 0 8px; color: white; font-weight: 700;">Paiement confirmé !</p>
        <p style="margin: 0 0 24px; font-size: 15px;">Bonjour <strong style="color: white;">${payerName}</strong>, votre paiement pour <strong style="color: white;">${linkTitle}</strong> a été confirmé par ${companyName}.</p>
        <div style="background: #18181b; border-radius: 12px; padding: 20px; margin: 0 auto 24px; max-width: 300px; text-align: left;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Montant</td><td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 700; font-size: 18px;">${amount.toLocaleString()} ${currency}</td></tr>
            <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Méthode</td><td style="padding: 8px 0; text-align: right; color: white;">${methodLabels[paymentMethod] || paymentMethod}</td></tr>
          </table>
        </div>
        <p style="font-size: 13px; color: #71717a; margin: 0;">Conservez cet email comme reçu de votre paiement.</p>
      </div>
      <div style="padding: 20px 32px; background: #09090b; text-align: center;">
        <p style="color: #52525b; font-size: 12px; margin: 0;">Paiement sécurisé via ${APP_NAME}</p>
        ${NO_REPLY_NOTICE}
      </div>
    </div>
  `;
  try {
    const resend = getResendClient();
    if (!resend) return { success: false };
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject: `Paiement confirmé — ${amount.toLocaleString()} ${currency} · ${companyName}`, html });
    if (error) { console.error("Payment confirmed email error:", error); return { success: false }; }
    return { success: true };
  } catch (err) { console.error("Payment confirmed email exception:", err); return { success: false }; }
}
