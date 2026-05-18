import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createFullPermissions, DEFAULT_POSITIONS } from "@/lib/permissions";
import { sendWelcomeEmail } from "@/lib/email";

const createCompanySchema = z.object({
  mode: z.literal("create_company"),
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

const joinCompanySchema = z.object({
  mode: z.literal("join_company"),
  companyId: z.string().min(1),
  message: z.string().optional(),
  userName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.discriminatedUnion("mode", [createCompanySchema, joinCompanySchema]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    if (data.mode === "create_company") {
      const result = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: data.companyName,
            legalName: data.legalName,
            registrationNo: data.registrationNo,
            taxId: data.taxId,
            city: data.city || "Douala",
            phone: data.phone,
            bankAccounts: {
              create: [
                { name: "Compte Principal", type: "COMPTE_COURANT", isDefault: true, balance: 0 },
                { name: "Caisse", type: "CAISSE", balance: 0 },
                { name: "MTN Mobile Money", type: "MTN_MONEY", balance: 0 },
              ],
            },
          },
        });

        const ownerPosition = await tx.position.create({
          data: {
            companyId: company.id,
            name: "Propriétaire",
            description: "Accès complet à toutes les fonctionnalités",
            isOwner: true,
            permissions: createFullPermissions(),
          },
        });

        for (const pos of DEFAULT_POSITIONS) {
          if (pos.isOwner) continue;
          await tx.position.create({
            data: {
              companyId: company.id,
              name: pos.name,
              description: pos.description,
              isOwner: false,
              permissions: pos.permissions,
            },
          });
        }

        const user = await tx.user.create({
          data: {
            name: data.userName,
            email: data.email,
            password: hashedPassword,
            role: "ADMIN",
            companyId: company.id,
            positionId: ownerPosition.id,
          },
        });

        await tx.subscription.create({
          data: {
            companyId: company.id,
            plan: "STARTER",
            status: "ACTIVE",
            startDate: new Date(),
          },
        });

        return { userId: user.id, companyId: company.id, userName: data.userName, email: data.email, companyName: data.companyName };
      });

      sendWelcomeEmail({
        to: result.email,
        userName: result.userName,
      }).catch((err) => console.error("Welcome email failed:", err));

      return NextResponse.json({ success: true, userId: result.userId, companyId: result.companyId });
    } else {
      const company = await prisma.company.findUnique({ where: { id: data.companyId } });
      if (!company) {
        return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: data.userName,
            email: data.email,
            password: hashedPassword,
            role: "VIEWER",
          },
        });

        await tx.admissionRequest.create({
          data: {
            userId: user.id,
            companyId: data.companyId,
            message: data.message || null,
          },
        });

        return { userId: user.id, userName: data.userName, email: data.email };
      });

      sendWelcomeEmail({
        to: result.email,
        userName: result.userName,
      }).catch((err) => console.error("Welcome email failed:", err));

      return NextResponse.json({ success: true, pending: true, userId: result.userId });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
