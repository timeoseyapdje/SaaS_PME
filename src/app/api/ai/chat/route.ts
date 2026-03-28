import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildFinancialContext } from "@/lib/ai-context";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const SYSTEM_PROMPT = `Tu es "Nkap AI", l'assistant financier intelligent de Nkap Control — une application de gestion financière conçue pour les PME camerounaises.

🎯 TON RÔLE:
- Tu es un expert en comptabilité OHADA, fiscalité camerounaise et gestion de trésorerie
- Tu analyses les données financières réelles de l'utilisateur pour donner des réponses précises
- Tu donnes des conseils concrets et actionnables adaptés au contexte camerounais

📋 RÈGLES:
- Réponds TOUJOURS en français
- Sois concis mais complet (pas de blabla inutile)
- Formate les montants en FCFA avec séparateurs de milliers
- Utilise des emojis pour structurer tes réponses (📊 💰 ⚠️ ✅ 📈 📉)
- Si tu proposes des actions, numérote-les
- Si une information n'est pas dans les données, dis-le clairement
- Quand tu analyses des tendances, compare toujours au mois précédent
- Pour la fiscalité: TVA = 19,25%, IS = 33%, Patente = variable par commune

💡 TU PEUX:
- Analyser les KPIs et expliquer les tendances
- Identifier les factures en retard et suggérer des relances
- Décomposer les dépenses et trouver des économies possibles
- Calculer des ratios financiers (marge nette, taux de recouvrement, etc.)
- Conseiller sur la gestion de trésorerie
- Estimer les obligations fiscales (TVA, IS)
- Comparer les performances mois par mois
- Alerter sur les risques financiers

DONNÉES FINANCIÈRES DE L'UTILISATEUR:
`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    const body = await request.json();
    const { messages } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages requis" }, { status: 400 });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
      return NextResponse.json({
        message: "⚠️ L'assistant IA n'est pas encore configuré. Ajoutez votre clé API Anthropic dans le fichier `.env` (variable `ANTHROPIC_API_KEY`) pour activer cette fonctionnalité.\n\nVous pouvez obtenir une clé sur https://console.anthropic.com",
      });
    }

    // Build financial context from real data
    const financialContext = await buildFinancialContext(companyId);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT + financialContext,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === "text");
    const messageText = textContent ? textContent.text : "Désolé, je n'ai pas pu générer de réponse.";

    return NextResponse.json({ message: messageText });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la communication avec l'IA", message: "❌ Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
