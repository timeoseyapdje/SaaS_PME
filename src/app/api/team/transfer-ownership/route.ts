import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as { id: string; companyId?: string };
  if (!user.companyId) {
    return NextResponse.json({ error: "Aucune entreprise associée" }, { status: 403 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { position: true },
  });

  if (!currentUser?.position?.isOwner) {
    return NextResponse.json({ error: "Seul le propriétaire peut transférer la propriété" }, { status: 403 });
  }

  const { targetUserId } = await req.json();

  if (!targetUserId || targetUserId === user.id) {
    return NextResponse.json({ error: "Cible invalide" }, { status: 400 });
  }

  const targetUser = await prisma.user.findFirst({
    where: { id: targetUserId, companyId: user.companyId },
    include: { position: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Membre introuvable dans cette entreprise" }, { status: 404 });
  }

  if (targetUser.position?.isOwner) {
    return NextResponse.json({ error: "Ce membre est déjà propriétaire" }, { status: 400 });
  }

  const ownerPosition = await prisma.position.findFirst({
    where: { companyId: user.companyId, isOwner: true },
  });

  const fallbackPosition = await prisma.position.findFirst({
    where: { companyId: user.companyId, isOwner: false },
    orderBy: { createdAt: "asc" },
  });

  if (!ownerPosition) {
    return NextResponse.json({ error: "Poste Propriétaire introuvable" }, { status: 500 });
  }

  await prisma.$transaction([
    // Le nouvel owner prend le poste Propriétaire
    prisma.user.update({
      where: { id: targetUserId },
      data: { positionId: ownerPosition.id },
    }),
    // L'ancien owner prend le premier poste non-owner disponible
    prisma.user.update({
      where: { id: user.id },
      data: { positionId: fallbackPosition?.id ?? null },
    }),
  ]);

  return NextResponse.json({ success: true });
}
