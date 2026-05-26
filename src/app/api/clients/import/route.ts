import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

const VALID_TYPES = ["PARTICULIER", "ENTREPRISE", "ONG", "ADMINISTRATION"];

export async function POST(request: Request) {
  try {
    const result = await requirePermission("clients", "create");
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
      const lineNum = i + 2; // +2 because row 1 is headers

      const name = row["Nom"]?.trim();
      if (!name) {
        errors.push(`Ligne ${lineNum} : le champ Nom est requis`);
        continue;
      }

      const rawType = row["Type"]?.trim().toUpperCase();
      const type = VALID_TYPES.includes(rawType) ? rawType : "ENTREPRISE";

      try {
        await prisma.client.create({
          data: {
            companyId,
            name,
            email: row["Email"]?.trim() || null,
            phone: row["Telephone"]?.trim() || null,
            address: row["Adresse"]?.trim() || null,
            city: row["Ville"]?.trim() || null,
            type: type as "PARTICULIER" | "ENTREPRISE" | "ONG" | "ADMINISTRATION",
            notes: row["Notes"]?.trim() || null,
          },
        });
        imported++;
      } catch {
        errors.push(`Ligne ${lineNum} : erreur lors de la création (${name})`);
      }
    }

    return NextResponse.json({ imported, errors });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
