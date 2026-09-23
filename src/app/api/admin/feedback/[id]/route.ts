import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const updateSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]),
});

// PATCH - Changer le statut d'un feedback
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const updated = await prisma.feedback.updateMany({
    where: { id },
    data: { status: parsed.data.status },
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Feedback introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
