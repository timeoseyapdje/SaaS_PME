import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// GET - Lister tous les feedbacks / messages support des clients
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      user: {
        select: { name: true, email: true, company: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json({ feedbacks });
}
