import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

const PLAN_USER_LIMITS: Record<string, number> = {
  STARTER: 1,
  PRO: 5,
  MAX: -1,
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requirePermission("team", "invite");
  if (isNextResponse(result)) return result;

  const { id } = await params;
  const { status, positionId } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const request = await prisma.admissionRequest.findFirst({
    where: { id, companyId: result.session.user.companyId, status: "PENDING" },
  });

  if (!request) {
    return NextResponse.json({ error: "Demande introuvable ou déjà traitée" }, { status: 404 });
  }

  if (status === "APPROVED") {
    if (!positionId) {
      return NextResponse.json({ error: "Poste requis pour l'approbation" }, { status: 400 });
    }

    const position = await prisma.position.findFirst({
      where: { id: positionId, companyId: result.session.user.companyId },
    });

    if (!position) {
      return NextResponse.json({ error: "Poste introuvable" }, { status: 404 });
    }

    if (position.isOwner) {
      return NextResponse.json({ error: "Impossible d'attribuer le poste Propriétaire" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: result.session.user.companyId },
      include: {
        _count: { select: { users: true } },
        subscription: { select: { plan: true } },
      },
    });

    if (company) {
      const plan = company.subscription?.plan || "STARTER";
      const maxUsers = PLAN_USER_LIMITS[plan] ?? 1;
      if (maxUsers !== -1 && company._count.users >= maxUsers) {
        return NextResponse.json(
          { error: `Limite d'utilisateurs atteinte pour le plan ${plan}` },
          { status: 403 }
        );
      }
    }

    await prisma.$transaction([
      prisma.admissionRequest.update({
        where: { id },
        data: { status: "APPROVED", reviewedBy: result.session.user.id, positionId },
      }),
      prisma.user.update({
        where: { id: request.userId },
        data: { companyId: result.session.user.companyId, positionId },
      }),
    ]);
  } else {
    await prisma.admissionRequest.update({
      where: { id },
      data: { status: "REJECTED", reviewedBy: result.session.user.id },
    });
  }

  return NextResponse.json({ success: true, status });
}
