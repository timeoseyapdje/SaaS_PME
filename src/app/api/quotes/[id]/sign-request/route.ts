import { NextRequest, NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requirePermission("quotes", "edit");
  if (isNextResponse(result)) return result;
  const companyId = result.session.user.companyId;

  const { id } = await params;

  const quote = await prisma.quote.findFirst({
    where: { id, companyId },
    select: { id: true, status: true },
  });

  if (!quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  if (!["DRAFT", "SENT"].includes(quote.status)) {
    return NextResponse.json(
      { error: "La demande de signature n'est possible que pour les devis en brouillon ou envoyé" },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.quote.update({
    where: { id },
    data: { signatureToken: token },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";
  const signingUrl = `${baseUrl}/sign/${token}`;

  return NextResponse.json({ token, signingUrl });
}
