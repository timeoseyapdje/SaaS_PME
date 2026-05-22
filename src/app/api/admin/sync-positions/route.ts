import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createTemplatePermissions, PermissionMap, PERMISSION_MODULES, MODULE_ACTIONS } from "@/lib/permissions";

// Maps position names to their template so we can backfill missing modules
const POSITION_NAME_TO_TEMPLATE: Record<string, "comptable" | "lecteur" | "manager"> = {
  comptable: "comptable",
  lecteur: "lecteur",
  "directeur général": "manager",
  manager: "manager",
};

function mergePermissions(stored: PermissionMap, template: PermissionMap): { merged: PermissionMap; changed: boolean } {
  const merged = { ...stored };
  let changed = false;

  for (const mod of PERMISSION_MODULES) {
    if (!merged[mod]) {
      merged[mod] = template[mod] ? [...template[mod]!] : [...MODULE_ACTIONS[mod]];
      changed = true;
    }
  }

  return { merged, changed };
}

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const positions = await prisma.position.findMany({
    where: { isOwner: false },
  });

  const results: { id: string; name: string; updated: boolean }[] = [];

  for (const position of positions) {
    const nameKey = position.name.toLowerCase().trim();
    const templateKey = POSITION_NAME_TO_TEMPLATE[nameKey];

    if (!templateKey) {
      // For unknown positions, only add missing modules with empty arrays so they don't get extra access
      const stored = (position.permissions as PermissionMap) || {};
      const missing = PERMISSION_MODULES.filter((m) => !stored[m]);
      if (missing.length === 0) {
        results.push({ id: position.id, name: position.name, updated: false });
        continue;
      }
      const merged = { ...stored };
      for (const mod of missing) merged[mod] = [];
      await prisma.position.update({ where: { id: position.id }, data: { permissions: merged } });
      results.push({ id: position.id, name: position.name, updated: true });
      continue;
    }

    const template = createTemplatePermissions(templateKey);
    const stored = (position.permissions as PermissionMap) || {};
    const { merged, changed } = mergePermissions(stored, template);

    if (changed) {
      await prisma.position.update({ where: { id: position.id }, data: { permissions: merged } });
    }

    results.push({ id: position.id, name: position.name, updated: changed });
  }

  return NextResponse.json({ synced: results.length, updated: results.filter((r) => r.updated).length, results });
}
