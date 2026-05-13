import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// POST - Mark admin and demo emails as verified
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const emails = ["admin@nkapcontrol.com", "demo@nkapcontrol.com"];

  const updated = await prisma.user.updateMany({
    where: { email: { in: emails }, emailVerified: null },
    data: { emailVerified: new Date() },
  });

  const current = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true, emailVerified: true },
  });

  return NextResponse.json({ success: true, updated: updated.count, accounts: current });
}
