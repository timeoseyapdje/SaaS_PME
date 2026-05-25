import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requirePermission("invoices", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;

    const creditNote = await prisma.creditNote.findFirst({
      where: { id, companyId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        invoice: { select: { id: true, number: true, total: true } },
      },
    });

    if (!creditNote) {
      return NextResponse.json({ error: "Avoir non trouvé" }, { status: 404 });
    }

    return NextResponse.json(creditNote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requirePermission("invoices", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;

    const existing = await prisma.creditNote.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Avoir non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { status, reason, amount } = body;

    const creditNote = await prisma.creditNote.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(reason !== undefined ? { reason } : {}),
        ...(amount !== undefined ? { amount: parseFloat(amount) } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
        invoice: { select: { id: true, number: true } },
      },
    });

    return NextResponse.json(creditNote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requirePermission("invoices", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { id } = await params;

    const existing = await prisma.creditNote.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Avoir non trouvé" }, { status: 404 });
    }

    await prisma.creditNote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
