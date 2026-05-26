import { NextResponse } from "next/server";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const result = await requirePermission("invoices", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const now = new Date();
    const updated = await prisma.invoice.updateMany({
      where: {
        companyId,
        status: "SENT",
        dueDate: { lt: now },
      },
      data: { status: "OVERDUE" },
    });

    return NextResponse.json({ updated: updated.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
