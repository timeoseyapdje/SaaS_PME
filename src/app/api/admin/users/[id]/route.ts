import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, SUPER_ADMIN_EMAIL } from "@/lib/admin";

// PATCH - Modifier le rôle d'un utilisateur (Super Admin uniquement)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await request.json();
  const { role } = body;

  if (!role || !["ADMIN", "ACCOUNTANT", "VIEWER"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  if (targetUser.email === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Impossible de modifier le rôle du Super Admin" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}

// DELETE - Supprimer un utilisateur (Super Admin uniquement)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  if (targetUser.email === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Impossible de supprimer le Super Admin" }, { status: 403 });
  }

  // Delete auth data then the user
  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.account.deleteMany({ where: { userId: id } });
  await prisma.notification.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

