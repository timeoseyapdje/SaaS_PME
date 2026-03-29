import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET - Lister tous les utilisateurs avec leur entreprise et abonnement
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
          subscription: {
            select: { plan: true, status: true },
          },
        },
      },
    },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      company: u.company
        ? {
            id: u.company.id,
            name: u.company.name,
            city: u.company.city,
            plan: u.company.subscription?.status === "ACTIVE" ? u.company.subscription.plan : "STARTER",
          }
        : null,
    }))
  );
}
