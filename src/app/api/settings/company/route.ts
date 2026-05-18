import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";
import { isDemoAccount } from "@/lib/demo";

export async function GET() {
  try {
    const result = await requirePermission("settings", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await requirePermission("settings", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    if (isDemoAccount(result.session.user.email)) {
      return NextResponse.json({ error: "Modification non autorisée en mode démo" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      legalName,
      registrationNo,
      taxId,
      address,
      city,
      phone,
      email,
      website,
    } = body;

    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        legalName,
        registrationNo,
        taxId,
        address,
        city,
        phone,
        email,
        website,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
