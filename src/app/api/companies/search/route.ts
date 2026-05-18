import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const companies = await prisma.company.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      city: true,
      _count: { select: { users: true } },
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(companies);
}
