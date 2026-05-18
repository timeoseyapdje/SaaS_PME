import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET() {
  const result = await requirePermission("team", "invite");
  if (isNextResponse(result)) return result;

  const requests = await prisma.admissionRequest.findMany({
    where: { companyId: result.session.user.companyId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      position: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as { id: string; companyId?: string };

  if (user.companyId) {
    return NextResponse.json({ error: "Vous appartenez déjà à une entreprise" }, { status: 400 });
  }

  const { companyId, message } = await req.json();

  if (!companyId) {
    return NextResponse.json({ error: "ID entreprise requis" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  }

  const existing = await prisma.admissionRequest.findUnique({
    where: { userId_companyId: { userId: user.id, companyId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà envoyé une demande à cette entreprise" }, { status: 409 });
  }

  const request = await prisma.admissionRequest.create({
    data: {
      userId: user.id,
      companyId,
      message: message || null,
    },
  });

  return NextResponse.json(request, { status: 201 });
}
