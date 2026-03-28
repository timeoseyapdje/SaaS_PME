import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET - Lister toutes les entreprises avec stats
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          users: true,
          invoices: true,
          clients: true,
          expenses: true,
          revenues: true,
        },
      },
    },
  });

  return NextResponse.json(companies);
}
