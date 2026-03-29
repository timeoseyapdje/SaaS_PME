import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoAccount } from "@/lib/demo";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    if (isDemoAccount(session.user.email)) {
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
