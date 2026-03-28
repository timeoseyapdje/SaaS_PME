"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  TrendingDown,
  Landmark,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Shield,
  Ticket,
  Building2,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

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
    icon: Users,
    children: [
      { name: "Clients", href: "/clients" },
      { name: "Fournisseurs", href: "/suppliers" },
    ],
  },
  { name: "Abonnement", href: "/subscription", icon: CreditCard },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

const adminNavigation: NavItem[] = [
  {
    name: "Administration",
    icon: Shield,
    children: [
      { name: "Dashboard Admin", href: "/admin" },
      { name: "Utilisateurs", href: "/admin/users" },
      { name: "Entreprises", href: "/admin/companies" },
      { name: "Codes Promo", href: "/admin/promo-codes" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = userRole === "ADMIN";
  const [openGroups, setOpenGroups] = useState<string[]>([
    "Facturation",
    "Finances",
    "Contacts",
    "Administration",
  ]);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex flex-col w-64 bg-zinc-950/60 backdrop-blur-2xl border border-white/5 text-zinc-300 h-[calc(100vh-32px)] fixed left-4 top-4 rounded-2xl z-30 transition-all shadow-2xl overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 bg-white overflow-hidden p-0.5">
          <img src="/logo.jpeg" alt="Nkap Control Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="font-bold text-white text-lg tracking-tight leading-none">Nkap Control</p>
          <p className="text-zinc-500 text-[11px] mt-1 font-medium tracking-wide">GESTION FINANCIERE</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1.5 scrollbar-none">
        {[...navigation, ...(isAdmin ? adminNavigation : [])].map((item) => {
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
                      ? "text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-400")} />
                    {item.name}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-zinc-600 transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-600 transition-transform" />
                  )}
                </button>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-[22px] mt-1 space-y-1 border-l border-zinc-800/80 pl-4 py-1"
                  >
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
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
                                ? "bg-emerald-500/10 text-emerald-400 font-medium"
                                : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
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
                    ? "text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-zinc-500")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 mt-auto">
        <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
          <div className="bg-zinc-800 p-2 rounded-lg">
            <Landmark className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-300">Cameroun</p>
            <p className="text-[10px] text-zinc-500">Norme OHADA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
