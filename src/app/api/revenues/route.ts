import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { companyId };
    if (category && category !== "ALL") where.category = category;
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to) (where.date as Record<string, Date>).lte = new Date(to);
    }
    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }

    const revenues = await prisma.revenue.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(revenues);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    const body = await request.json();
    const {
      category,
      description,
      amount,
      currency,
      date,
      paymentMethod,
      notes,
      isRecurring,
    } = body;

    if (!category || !description || !amount || !date) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    const revenue = await prisma.revenue.create({
      data: {
        companyId,
        category,
        description,
        amount: parseFloat(amount),
        currency: currency || "XAF",
        date: new Date(date),
        paymentMethod: paymentMethod || "VIREMENT",
        notes,
        isRecurring: isRecurring || false,
      },
    });

    return NextResponse.json(revenue, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;

    const body = await request.json();
    const {
      id,
      category,
      description,
      amount,
      currency,
      date,
      paymentMethod,
      notes,
      isRecurring,
    } = body;

    const existing = await prisma.revenue.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Recette non trouvée" }, { status: 404 });
    }

    const revenue = await prisma.revenue.update({
      where: { id },
      data: {
        category,
        description,
        amount: parseFloat(amount),
        currency,
        date: new Date(date),
        paymentMethod,
        notes,
        isRecurring,
      },
    });

    return NextResponse.json(revenue);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const existing = await prisma.revenue.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Recette non trouvée" }, { status: 404 });
    }

    await prisma.revenue.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
