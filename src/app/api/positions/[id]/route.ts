import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requirePermission("team", "view");
  if (isNextResponse(result)) return result;

  const { id } = await params;

  const position = await prisma.position.findFirst({
    where: { id, companyId: result.session.user.companyId },
    include: { users: { select: { id: true, name: true, email: true } }, _count: { select: { users: true } } },
  });

  if (!position) {
    return NextResponse.json({ error: "Poste introuvable" }, { status: 404 });
  }

  return NextResponse.json(position);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requirePermission("team", "manage_positions");
  if (isNextResponse(result)) return result;

  const { id } = await params;
  const body = await req.json();
  const { name, description, permissions } = body;

  const position = await prisma.position.findFirst({
    where: { id, companyId: result.session.user.companyId },
  });

  if (!position) {
    return NextResponse.json({ error: "Poste introuvable" }, { status: 404 });
  }

  if (position.isOwner) {
    return NextResponse.json({ error: "Le poste Propriétaire ne peut pas être modifié" }, { status: 403 });
  }

  if (name && name !== position.name) {
    const existing = await prisma.position.findUnique({
      where: { companyId_name: { companyId: result.session.user.companyId, name } },
    });
    if (existing) {
      return NextResponse.json({ error: "Un poste avec ce nom existe déjà" }, { status: 409 });
    }
  }

  const updated = await prisma.position.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(permissions && { permissions }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requirePermission("team", "manage_positions");
  if (isNextResponse(result)) return result;

  const { id } = await params;

  const position = await prisma.position.findFirst({
    where: { id, companyId: result.session.user.companyId },
    include: { _count: { select: { users: true } } },
  });

  if (!position) {
    return NextResponse.json({ error: "Poste introuvable" }, { status: 404 });
  }

  if (position.isOwner) {
    return NextResponse.json({ error: "Le poste Propriétaire ne peut pas être supprimé" }, { status: 403 });
  }

  if (position._count.users > 0) {
    return NextResponse.json({ error: "Ce poste est encore attribué à des membres" }, { status: 400 });
  }

  await prisma.position.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
