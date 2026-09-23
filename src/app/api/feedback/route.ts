import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPE_LABELS = {
  SUPPORT: "Support",
  FEEDBACK: "Avis",
  BUG: "Bug",
} as const;

const feedbackSchema = z.object({
  type: z.enum(["SUPPORT", "FEEDBACK", "BUG"]),
  subject: z.string().trim().min(3, "Sujet trop court").max(150),
  message: z.string().trim().min(10, "Message trop court").max(5000),
  rating: z.number().int().min(1).max(5).optional(),
});

const MAX_PER_HOUR = 10;

// POST - Un client envoie un message support / avis / bug → notifie tous les admins
export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const parsed = feedbackSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Données invalides" }, { status: 400 });
  }
  const { type, subject, message, rating } = parsed.data;

  const recent = await prisma.feedback.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_PER_HOUR) {
    return NextResponse.json({ error: "Trop de messages envoyés. Réessayez plus tard." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, company: { select: { name: true } } },
  });

  const feedback = await prisma.feedback.create({
    data: { userId, type, subject, message, rating: type === "FEEDBACK" ? rating : undefined },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length > 0) {
    const author = user?.company?.name
      ? `${user.name || user.email} (${user.company.name})`
      : user?.name || user?.email || "Un client";
    const preview = message.length > 180 ? `${message.slice(0, 180)}…` : message;
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: `${TYPE_LABELS[type]} — ${subject}`,
        message: `${author}${rating ? ` · ${rating}/5` : ""} : ${preview}`,
        type: type === "FEEDBACK" ? "feedback" : "support",
      })),
    });
  }

  return NextResponse.json({ success: true, id: feedback.id }, { status: 201 });
}
