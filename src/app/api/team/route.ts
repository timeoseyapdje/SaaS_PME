import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET() {
  const result = await requirePermission("team", "view");
  if (isNextResponse(result)) return result;

  const members = await prisma.user.findMany({
    where: { companyId: result.session.user.companyId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      positionId: true,
      position: { select: { id: true, name: true, isOwner: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}
