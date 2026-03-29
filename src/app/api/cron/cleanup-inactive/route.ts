import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cette route peut être appelée par un cron Vercel ou manuellement
// Supprime les comptes VIEWER inactifs depuis plus de 6 mois
export async function GET(request: Request) {
  // Vérifier le secret pour sécuriser le cron
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Trouver les comptes VIEWER qui ne se sont pas connectés depuis 6 mois
  // On utilise updatedAt comme indicateur d'activité
  const inactiveViewers = await prisma.user.findMany({
    where: {
      role: "VIEWER",
      updatedAt: { lt: sixMonthsAgo },
      // Ne pas supprimer les comptes système
      email: {
        notIn: ["admin@nkapcontrol.cm", "demo@nkapcontrol.cm"],
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      updatedAt: true,
    },
  });

  if (inactiveViewers.length === 0) {
    return NextResponse.json({
      message: "Aucun compte VIEWER inactif à supprimer",
      deleted: 0,
    });
  }

  // Supprimer les comptes inactifs
  const deletedIds = inactiveViewers.map((u) => u.id);

  await prisma.user.deleteMany({
    where: {
      id: { in: deletedIds },
    },
  });

  return NextResponse.json({
    message: `${inactiveViewers.length} compte(s) VIEWER inactif(s) supprimé(s)`,
    deleted: inactiveViewers.length,
    deletedUsers: inactiveViewers.map((u) => ({
      email: u.email,
      name: u.name,
      lastActivity: u.updatedAt,
    })),
  });
}
