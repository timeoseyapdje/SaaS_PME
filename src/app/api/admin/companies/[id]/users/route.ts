import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin";
import { canAddUser, getMaxUsers } from "@/lib/plan-limits";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET - Lister les utilisateurs d'une entreprise avec les infos de limite
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const company = await prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      subscription: {
        select: { plan: true, status: true },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
  }

  const plan = company.subscription?.status === "ACTIVE" ? company.subscription.plan : "STARTER";
  const maxUsers = getMaxUsers(plan);

  return NextResponse.json({
    companyId: company.id,
    companyName: company.name,
    plan,
    maxUsers,
    currentCount: company.users.length,
    canAdd: canAddUser(plan, company.users.length),
    users: company.users,
  });
}

// POST - Ajouter un utilisateur à une entreprise
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await request.json();
  const { name, email, role = "VIEWER", password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
  }

  if (!["ADMIN", "ACCOUNTANT", "VIEWER"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  // Vérifier que l'entreprise existe et récupérer son plan
  const company = await prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: { select: { users: true } },
      subscription: {
        select: { plan: true, status: true },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
  }

  const plan = company.subscription?.status === "ACTIVE" ? company.subscription.plan : "STARTER";
  const maxUsers = getMaxUsers(plan);

  // Vérifier la limite d'utilisateurs
  if (!canAddUser(plan, company._count.users)) {
    const limitMsg = maxUsers === -1 ? "illimité" : `${maxUsers}`;
    return NextResponse.json({
      error: `Limite atteinte : le plan ${plan} autorise ${limitMsg} utilisateur(s). Passez à un plan supérieur.`,
    }, { status: 403 });
  }

  // Vérifier que l'email n'est pas déjà utilisé
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 });
  }

  // Créer l'utilisateur
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashedPassword,
      role,
      companyId: id,
      emailVerified: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(newUser, { status: 201 });
}
