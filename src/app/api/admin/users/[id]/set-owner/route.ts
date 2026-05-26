import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id: userId } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { position: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (!targetUser.companyId) {
    return NextResponse.json({ error: "Cet utilisateur n'appartient à aucune entreprise" }, { status: 400 });
  }

  if (targetUser.position?.isOwner) {
    return NextResponse.json({ error: "Cet utilisateur est déjà propriétaire" }, { status: 400 });
  }

  const ownerPosition = await prisma.position.findFirst({
    where: { companyId: targetUser.companyId, isOwner: true },
  });

  if (!ownerPosition) {
    return NextResponse.json({ error: "Poste Propriétaire introuvable pour cette entreprise" }, { status: 500 });
  }

  // Trouver l'ancien propriétaire s'il existe
  const currentOwner = await prisma.user.findFirst({
    where: { companyId: targetUser.companyId, position: { isOwner: true } },
  });

  const fallbackPosition = await prisma.position.findFirst({
    where: { companyId: targetUser.companyId, isOwner: false },
    orderBy: { createdAt: "asc" },
  });

  const ops = [
    prisma.user.update({
      where: { id: userId },
      data: { positionId: ownerPosition.id },
    }),
  ];

  if (currentOwner) {
    ops.push(
      prisma.user.update({
        where: { id: currentOwner.id },
        data: { positionId: fallbackPosition?.id ?? null },
      })
    );
  }

  await prisma.$transaction(ops);

  return NextResponse.json({
    success: true,
    newOwner: { id: targetUser.id, email: targetUser.email, name: targetUser.name },
    previousOwner: currentOwner ? { id: currentOwner.id, email: currentOwner.email } : null,
  });
}
