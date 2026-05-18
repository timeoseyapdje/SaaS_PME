import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function PUT(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const result = await requirePermission("team", "manage_positions");
  if (isNextResponse(result)) return result;

  const { userId } = await params;
  const { positionId } = await req.json();

  const member = await prisma.user.findFirst({
    where: { id: userId, companyId: result.session.user.companyId },
    include: { position: true },
  });

  if (!member) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  if (member.position?.isOwner) {
    return NextResponse.json({ error: "Impossible de modifier le poste du propriétaire" }, { status: 403 });
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

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { positionId },
    include: { position: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const result = await requirePermission("team", "remove_members");
  if (isNextResponse(result)) return result;

  const { userId } = await params;

  if (userId === result.session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous retirer vous-même" }, { status: 400 });
  }

  const member = await prisma.user.findFirst({
    where: { id: userId, companyId: result.session.user.companyId },
    include: { position: true },
  });

  if (!member) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  if (member.position?.isOwner) {
    return NextResponse.json({ error: "Impossible de retirer le propriétaire" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { companyId: null, positionId: null },
  });

  return NextResponse.json({ success: true, message: "Membre retiré de l'entreprise" });
}
