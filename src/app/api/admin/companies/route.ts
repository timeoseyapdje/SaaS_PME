import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET - Lister toutes les entreprises (infos personnelles uniquement, PAS de finances)
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      legalName: true,
      registrationNo: true,
      taxId: true,
      city: true,
      country: true,
      phone: true,
      email: true,
      address: true,
      website: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
        },
      },
      subscription: {
        select: { plan: true, status: true },
      },
    },
  });

  return NextResponse.json(
    companies.map((c) => ({
      ...c,
      plan: c.subscription?.status === "ACTIVE" ? c.subscription.plan : "STARTER",
      subscription: undefined,
    }))
  );
}
