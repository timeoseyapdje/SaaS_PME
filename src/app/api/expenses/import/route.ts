import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

const VALID_CATEGORIES = [
  "SALAIRES", "LOYER", "FOURNITURES", "TRANSPORT", "COMMUNICATION",
  "MARKETING", "TAXES", "ASSURANCE", "MAINTENANCE", "FORMATION",
  "SOUS_TRAITANCE", "AUTRES",
];

const VALID_PAYMENT_METHODS = [
  "ESPECES", "VIREMENT", "CHEQUE", "MTN_MONEY", "ORANGE_MONEY", "CARTE_BANCAIRE",
];

export async function POST(request: Request) {
  try {
    const result = await requirePermission("expenses", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const rows: Record<string, string>[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Aucune donnée fournie" }, { status: 400 });
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2;

      const description = row["Description"]?.trim();
      const rawAmount = row["Montant"]?.trim().replace(/\s/g, "").replace(",", ".");
      const rawDate = row["Date"]?.trim();
      const rawCategory = row["Categorie"]?.trim().toUpperCase();
      const rawPaymentMethod = row["ModePaiement"]?.trim().toUpperCase();

      if (!description) {
        errors.push(`Ligne ${lineNum} : le champ Description est requis`);
        continue;
      }

      const amount = parseFloat(rawAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.push(`Ligne ${lineNum} : montant invalide "${row["Montant"]}"`);
        continue;
      }

      if (!rawDate) {
        errors.push(`Ligne ${lineNum} : le champ Date est requis`);
        continue;
      }

      const parsedDate = new Date(rawDate);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Ligne ${lineNum} : date invalide "${rawDate}" (format attendu: YYYY-MM-DD)`);
        continue;
      }

      const category = (VALID_CATEGORIES.includes(rawCategory) ? rawCategory : "AUTRES") as import("@prisma/client").ExpenseCategory;
      const paymentMethod = (VALID_PAYMENT_METHODS.includes(rawPaymentMethod) ? rawPaymentMethod : "VIREMENT") as import("@prisma/client").PaymentMethod;

      try {
        await prisma.expense.create({
          data: {
            companyId,
            description,
            amount,
            category,
            date: parsedDate,
            paymentMethod,
            currency: "XAF",
            notes: row["Notes"]?.trim() || null,
            isRecurring: false,
          },
        });
        imported++;
      } catch {
        errors.push(`Ligne ${lineNum} : erreur lors de la création (${description})`);
      }
    }

    return NextResponse.json({ imported, errors });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
