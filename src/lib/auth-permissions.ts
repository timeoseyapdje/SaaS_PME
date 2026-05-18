import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PermissionMap, PermissionModule, hasPermission, createFullPermissions } from "@/lib/permissions";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function getUserPermissions(userId: string): Promise<PermissionMap | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { position: true },
  });

  if (!user) return null;

  if (user.email === SUPER_ADMIN_EMAIL) {
    return createFullPermissions();
  }

  if (!user.position) return null;

  return user.position.permissions as PermissionMap;
}

export async function requirePermission(
  module: PermissionModule,
  action: string
): Promise<
  | { session: { user: { id: string; email: string; companyId: string; positionId: string } }; permissions: PermissionMap }
  | NextResponse
> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as { id: string; email?: string; companyId?: string; positionId?: string };

  if (user.email === SUPER_ADMIN_EMAIL) {
    return {
      session: {
        user: {
          id: user.id,
          email: user.email!,
          companyId: user.companyId || "",
          positionId: user.positionId || "",
        },
      },
      permissions: createFullPermissions(),
    };
  }

  if (!user.companyId) {
    return NextResponse.json({ error: "Aucune entreprise associée" }, { status: 403 });
  }

  const permissions = await getUserPermissions(user.id);

  if (!permissions || !hasPermission(permissions, module, action)) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  return {
    session: {
      user: {
        id: user.id,
        email: user.email || "",
        companyId: user.companyId,
        positionId: user.positionId || "",
      },
    },
    permissions,
  };
}

export function isNextResponse(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}
