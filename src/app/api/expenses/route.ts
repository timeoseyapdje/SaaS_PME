import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(request: Request) {
  try {
    const result = await requirePermission("expenses", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = { companyId };
    if (category && category !== "ALL") where.category = category;
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to) (where.date as Record<string, Date>).lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { supplier: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requirePermission("expenses", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const {
      category,
      description,
      amount,
      currency,
      date,
      paymentMethod,
      supplierId,
      notes,
      isRecurring,
    } = body;

    if (!category || !description || !amount || !date) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        companyId,
        category,
        description,
        amount: parseFloat(amount),
        currency: currency || "XAF",
        date: new Date(date),
        paymentMethod: paymentMethod || "VIREMENT",
        supplierId: supplierId || null,
        notes,
        isRecurring: isRecurring || false,
      },
      include: {
        supplier: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const result = await requirePermission("expenses", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const {
      id,
      category,
      description,
      amount,
      currency,
      date,
      paymentMethod,
      supplierId,
      notes,
      isRecurring,
    } = body;

    const existing = await prisma.expense.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Dépense non trouvée" }, { status: 404 });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        category,
        description,
        amount: parseFloat(amount),
        currency,
        date: new Date(date),
        paymentMethod,
        supplierId: supplierId || null,
        notes,
        isRecurring,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requirePermission("expenses", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const existing = await prisma.expense.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Dépense non trouvée" }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
