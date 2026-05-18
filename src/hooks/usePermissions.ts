"use client";

import { useState, useEffect, useCallback } from "react";
import { PermissionMap, PermissionModule, hasPermission, hasAnyPermission } from "@/lib/permissions";

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/permissions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.permissions) {
          setPermissions(data.permissions);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const can = useCallback(
    (module: PermissionModule, action: string) => hasPermission(permissions, module, action),
    [permissions]
  );

  const canAny = useCallback(
    (module: PermissionModule) => hasAnyPermission(permissions, module),
    [permissions]
  );

  return { permissions, loading, can, canAny };
}
