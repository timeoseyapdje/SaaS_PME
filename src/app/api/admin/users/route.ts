import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET - Lister tous les utilisateurs avec leur entreprise
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
    },
  });

  return NextResponse.json(users);
}
