import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

export async function GET() {
  try {
    const result = await requirePermission("treasury", "view");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

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
    const result = await requirePermission("treasury", "create");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { name, type, bankName, accountNumber, phoneNumber, balance, isDefault } = body;

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
        phoneNumber: phoneNumber || null,
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
    const result = await requirePermission("treasury", "manage");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

    const body = await request.json();
    const { id, name, type, bankName, accountNumber, phoneNumber, balance, isDefault } = body;

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
        phoneNumber: phoneNumber !== undefined ? (phoneNumber || null) : undefined,
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
    const result = await requirePermission("treasury", "manage");
    if (isNextResponse(result)) return result;
    const companyId = result.session.user.companyId;

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
