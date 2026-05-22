export const PERMISSION_MODULES = [
  "dashboard",
  "invoices",
  "expenses",
  "treasury",
  "products",
  "orders",
  "clients",
  "suppliers",
  "reports",
  "payment_links",
  "settings",
  "team",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const MODULE_ACTIONS: Record<PermissionModule, readonly string[]> = {
  dashboard: ["view"],
  invoices: ["view", "create", "edit", "delete", "send"],
  expenses: ["view", "create", "edit", "delete"],
  treasury: ["view", "manage"],
  products: ["view", "create", "edit", "delete"],
  orders: ["view", "create", "edit", "delete"],
  clients: ["view", "create", "edit", "delete"],
  suppliers: ["view", "create", "edit", "delete"],
  reports: ["view", "export"],
  payment_links: ["view", "create", "edit", "delete"],
  settings: ["view", "edit"],
  team: ["view", "invite", "manage_positions", "remove_members"],
};

export const MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: "Tableau de bord",
  invoices: "Facturation",
  expenses: "Dépenses & Recettes",
  treasury: "Trésorerie",
  products: "Produits",
  orders: "Commandes",
  clients: "Clients",
  suppliers: "Fournisseurs",
  reports: "Rapports",
  payment_links: "Liens de paiement",
  settings: "Paramètres",
  team: "Équipe",
};

export const ACTION_LABELS: Record<string, string> = {
  view: "Voir",
  create: "Créer",
  edit: "Modifier",
  delete: "Supprimer",
  send: "Envoyer",
  manage: "Gérer",
  export: "Exporter",
  invite: "Inviter",
  manage_positions: "Gérer les postes",
  remove_members: "Retirer des membres",
};

export type PermissionMap = {
  [K in PermissionModule]?: string[];
};

export function createFullPermissions(): PermissionMap {
  const permissions: PermissionMap = {};
  for (const mod of PERMISSION_MODULES) {
    permissions[mod] = [...MODULE_ACTIONS[mod]];
  }
  return permissions;
}

export function hasPermission(
  permissions: PermissionMap | null | undefined,
  module: PermissionModule,
  action: string
): boolean {
  if (!permissions) return false;
  const actions = permissions[module];
  if (!actions) return false;
  return actions.includes(action);
}

export function hasAnyPermission(
  permissions: PermissionMap | null | undefined,
  module: PermissionModule
): boolean {
  if (!permissions) return false;
  const actions = permissions[module];
  return !!actions && actions.length > 0;
}

export type PositionTemplate = "comptable" | "lecteur" | "manager";

export function createTemplatePermissions(template: PositionTemplate): PermissionMap {
  switch (template) {
    case "comptable":
      return {
        dashboard: ["view"],
        invoices: ["view", "create", "edit", "send"],
        expenses: ["view", "create", "edit"],
        treasury: ["view"],
        products: ["view"],
        orders: ["view", "create", "edit"],
        clients: ["view", "create", "edit"],
        suppliers: ["view", "create", "edit"],
        reports: ["view", "export"],
        payment_links: ["view", "create", "edit", "delete"],
        settings: ["view"],
        team: ["view"],
      };
    case "lecteur":
      return {
        dashboard: ["view"],
        invoices: ["view"],
        expenses: ["view"],
        treasury: ["view"],
        products: ["view"],
        orders: ["view"],
        clients: ["view"],
        suppliers: ["view"],
        reports: ["view"],
        payment_links: ["view"],
        settings: ["view"],
        team: ["view"],
      };
    case "manager":
      return {
        dashboard: ["view"],
        invoices: ["view", "create", "edit", "delete", "send"],
        expenses: ["view", "create", "edit", "delete"],
        treasury: ["view", "manage"],
        products: ["view", "create", "edit", "delete"],
        orders: ["view", "create", "edit", "delete"],
        clients: ["view", "create", "edit", "delete"],
        suppliers: ["view", "create", "edit", "delete"],
        reports: ["view", "export"],
        payment_links: ["view", "create", "edit", "delete"],
        settings: ["view", "edit"],
        team: ["view", "invite"],
      };
  }
}

export const DEFAULT_POSITIONS = [
  {
    name: "Propriétaire",
    description: "Accès complet à toutes les fonctionnalités",
    isOwner: true,
    permissions: createFullPermissions(),
  },
  {
    name: "Directeur Général",
    description: "Accès étendu avec gestion d'équipe",
    isOwner: false,
    permissions: createTemplatePermissions("manager"),
  },
  {
    name: "Comptable",
    description: "Gestion financière et facturation",
    isOwner: false,
    permissions: createTemplatePermissions("comptable"),
  },
  {
    name: "Lecteur",
    description: "Consultation en lecture seule",
    isOwner: false,
    permissions: createTemplatePermissions("lecteur"),
  },
] as const;
