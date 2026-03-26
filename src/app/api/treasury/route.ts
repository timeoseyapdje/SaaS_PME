import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
    }

    const accounts = await prisma.bankAccount.findMany({
      where: { companyId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return NextResponse.json({
      accounts,
      totalBalance,
    });
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
    const { name, type, bankName, accountNumber, balance, isDefault } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Nom et type requis" },
        { status: 400 }
      );
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { companyId },
        data: { isDefault: false },
      });
    }

    const account = await prisma.bankAccount.create({
      data: {
        companyId,
        name,
        type,
        bankName,
        accountNumber,
        balance: balance || 0,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = (session.user as { companyId?: string }).companyId;

    const body = await request.json();
    const { id, name, type, bankName, accountNumber, balance, isDefault } = body;

    const existing = await prisma.bankAccount.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Compte non trouvé" }, { status: 404 });
    }

    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { companyId },
        data: { isDefault: false },
      });
    }

    const account = await prisma.bankAccount.update({
      where: { id },
      data: {
        name,
        type,
        bankName,
        accountNumber,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
        isDefault,
      },
    });

    return NextResponse.json(account);
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

    const existing = await prisma.bankAccount.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Compte non trouvé" }, { status: 404 });
    }

    await prisma.bankAccount.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
