import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET(request: Request) {
  try {
    const result = await requirePermission("suppliers", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { companyId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: { select: { expenses: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requirePermission("suppliers", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { name, email, phone, address, city, taxId, type, notes } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        companyId,
        name,
        email,
        phone,
        address,
        city,
        taxId,
        type: type || "ENTREPRISE",
        notes,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const result = await requirePermission("suppliers", "edit");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { id, name, email, phone, address, city, taxId, type, notes } = body;

    const existing = await prisma.supplier.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fournisseur non trouvé" },
        { status: 404 }
      );
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: { name, email, phone, address, city, taxId, type, notes },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requirePermission("suppliers", "delete");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const existing = await prisma.supplier.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fournisseur non trouvé" },
        { status: 404 }
      );
    }

    await prisma.supplier.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
