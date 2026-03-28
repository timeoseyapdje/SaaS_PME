import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, SUPER_ADMIN_EMAIL } from "@/lib/admin";

// PATCH - Modifier le rôle d'un utilisateur (Super Admin uniquement)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await request.json();
  const { role } = body;

  if (!role || !["ADMIN", "ACCOUNTANT", "VIEWER"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  // Vérifier que l'utilisateur cible existe
  const targetUser = await prisma.user.findUnique({
    where: { id: params.id },
    select: { email: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  // Empêcher de modifier le rôle du Super Admin lui-même
  if (targetUser.email === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Impossible de modifier le rôle du Super Admin" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}
