import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET() {
  const result = await requirePermission("team", "view");
  if (isNextResponse(result)) return result;

  const positions = await prisma.position.findMany({
    where: { companyId: result.session.user.companyId },
    include: { _count: { select: { users: true } } },
    orderBy: [{ isOwner: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(positions);
}

export async function POST(req: Request) {
  const result = await requirePermission("team", "manage_positions");
  if (isNextResponse(result)) return result;

  const body = await req.json();
  const { name, description, permissions } = body;

  if (!name || !permissions) {
    return NextResponse.json({ error: "Nom et permissions requis" }, { status: 400 });
  }

  const existing = await prisma.position.findUnique({
    where: { companyId_name: { companyId: result.session.user.companyId, name } },
  });

  if (existing) {
    return NextResponse.json({ error: "Un poste avec ce nom existe déjà" }, { status: 409 });
  }

  const position = await prisma.position.create({
    data: {
      companyId: result.session.user.companyId,
      name,
      description: description || null,
      permissions,
    },
  });

  return NextResponse.json(position, { status: 201 });
}
