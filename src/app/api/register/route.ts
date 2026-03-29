import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  companyName: z.string().min(2),
  legalName: z.string().optional(),
  registrationNo: z.string().optional(),
  taxId: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  userName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const company = await prisma.company.create({
      data: {
        name: data.companyName,
        legalName: data.legalName,
        registrationNo: data.registrationNo,
        taxId: data.taxId,
        city: data.city || "Douala",
        phone: data.phone,
        bankAccounts: {
          create: [
            {
              name: "Compte Principal",
              type: "COMPTE_COURANT",
              isDefault: true,
              balance: 0,
            },
            {
              name: "Caisse",
              type: "CAISSE",
              balance: 0,
            },
            {
              name: "MTN Mobile Money",
              type: "MTN_MONEY",
              balance: 0,
            },
          ],
        },
      },
    });

    const user = await prisma.user.create({
      data: {
        name: data.userName,
        email: data.email,
        password: hashedPassword,
        role: "ACCOUNTANT",
        companyId: company.id,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
