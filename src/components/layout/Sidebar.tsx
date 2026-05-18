"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  TrendingDown,
  Landmark,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  Ticket,
  Building2,
  CreditCard,
  Bell,
  Mail,
  LogOut,
  Menu,
  X,
  Package,
  Tag,
  ShoppingCart,
  Plus,
  Link2,
  Boxes,
} from "lucide-react";
import { useState, useMemo } from "react";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { usePermissions } from "@/hooks/usePermissions";

interface NavChild {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Produits",
    icon: Package,
    children: [
      { name: "Catalogue", href: "/products" },
      { name: "Catégories", href: "/products/categories" },
      { name: "Inventaire", href: "/products/inventory" },
    ],
  },
  {
    name: "Ventes",
    icon: ShoppingCart,
    children: [
      { name: "Commandes", href: "/orders" },
      { name: "Nouvelle commande", href: "/orders/new" },
      { name: "Liens de paiement", href: "/payment-links" },
    ],
  },
  {
    name: "Facturation",
    icon: FileText,
    children: [
      { name: "Toutes les factures", href: "/invoices" },
      { name: "Nouvelle facture", href: "/invoices/new" },
    ],
  },
  {
    name: "Finances",
    icon: TrendingDown,
    children: [
      { name: "Dépenses & Recettes", href: "/expenses" },
      { name: "Trésorerie", href: "/treasury" },
    ],
  },
  {
    name: "Rapports",
    icon: BarChart3,
    children: [{ name: "Résultats financiers", href: "/reports" }],
  },
  {
    name: "Contacts",
    icon: Tag,
    children: [
      { name: "Clients", href: "/clients" },
      { name: "Fournisseurs", href: "/suppliers" },
    ],
  },
  {
    name: "Équipe",
    icon: Users,
    children: [
      { name: "Membres", href: "/team" },
      { name: "Postes", href: "/team/positions" },
      { name: "Demandes", href: "/team/requests" },
    ],
  },
  { name: "Abonnement", href: "/subscription", icon: CreditCard },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

const superAdminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    name: "Gestion",
    icon: Shield,
    children: [
      { name: "Utilisateurs", href: "/admin/users" },
      { name: "Entreprises", href: "/admin/companies" },
      { name: "Codes Promo", href: "/admin/promo-codes" },
    ],
  },
  {
    name: "Communication",
    icon: Mail,
    children: [
      { name: "Notifications", href: "/admin/notifications" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { canAny } = usePermissions();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = userRole === "ADMIN";

  const filteredNavigation = useMemo(() => {
    return navigation.filter((item) => {
      if (item.name === "Dashboard") return canAny("dashboard");
      if (item.name === "Produits") return canAny("products");
      if (item.name === "Ventes") return canAny("orders") || canAny("payment_links");
      if (item.name === "Facturation") return canAny("invoices");
      if (item.name === "Finances") return canAny("expenses") || canAny("treasury");
      if (item.name === "Rapports") return canAny("reports");
      if (item.name === "Contacts") return canAny("clients") || canAny("suppliers");
      if (item.name === "Équipe") return canAny("team");
      if (item.name === "Paramètres") return canAny("settings");
      return true;
    });
  }, [canAny]);
  const [openGroups, setOpenGroups] = useState<string[]>([
    "Facturation",
    "Finances",
    "Contacts",
    "Gestion",
    "Communication",
    "Produits",
    "Ventes",
  ]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 lg:px-6 lg:py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 bg-white overflow-hidden p-0.5">
            <img src="/logo.jpeg" alt="Nkap Control Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg tracking-tight leading-none">Nkap Control</p>
            <p className="text-muted-foreground text-[11px] mt-1 font-medium tracking-wide">GESTION FINANCIERE</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 lg:px-4 lg:py-4 overflow-y-auto space-y-1.5 scrollbar-none">
        {(isAdmin ? superAdminNavigation : filteredNavigation).map((item) => {
          if (item.children) {
            const isOpen = openGroups.includes(item.name);
            const isActive = item.children.some(
              (child) =>
                pathname === child.href ||
                pathname.startsWith(child.href + "/")
            );
            return (
              <div key={item.name} className="mb-1">
                <button
                  onClick={() => toggleGroup(item.name)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-500" : "text-muted-foreground group-hover:text-foreground")} />
                    {item.name}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
                  )}
                </button>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-[22px] mt-1 space-y-1 border-l border-border pl-4 py-1"
                  >
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block relative"
                        >
                          {isChildActive && (
                            <motion.div
                              layoutId="active-nav-indicator"
                              className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-r-full"
                            />
                          )}
                          <span
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                              isChildActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {child.name}
                          </span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setMobileOpen(false)}
              className="block relative"
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-emerald-500/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative z-10",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "text-muted-foreground")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 lg:px-6 lg:py-6 mt-auto space-y-3">
        {/* Theme toggle */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground font-medium">Apparence</span>
          <ThemeToggle />
        </div>

        {/* Logout button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all group cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
          Déconnexion
        </button>

        <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border">
          <div className="bg-muted p-2 rounded-lg">
            <Landmark className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Cameroun</p>
            <p className="text-[10px] text-muted-foreground">Norme OHADA</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card/90 backdrop-blur-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-background/95 backdrop-blur-2xl border-r border-border text-foreground transition-transform duration-300 ease-in-out shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-card/80 backdrop-blur-2xl border border-border text-foreground h-[calc(100vh-32px)] fixed left-4 top-4 rounded-2xl z-30 transition-all shadow-lg overflow-hidden">
        {sidebarContent}
      </div>
    </>
  );
}
