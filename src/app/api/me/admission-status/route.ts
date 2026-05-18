import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const request = await prisma.admissionRequest.findFirst({
    where: { userId: session.user.id },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (!request) {
    return NextResponse.json({ status: null });
  }

  return NextResponse.json({
    status: request.status,
    companyName: request.company.name,
  });
}
