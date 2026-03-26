"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  TrendingDown,
  Landmark,
  BarChart3,
  Users,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

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
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>([
    "Facturation",
    "Finances",
    "Contacts",
  ]);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-lg leading-none">FinancePME</p>
          <p className="text-gray-400 text-xs mt-0.5">Gestion financière</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navigation.map((item) => {
          if (item.children) {
            const isOpen = openGroups.includes(item.name);
            const isActive = item.children.some(
              (child) =>
                pathname === child.href ||
                pathname.startsWith(child.href + "/")
            );
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleGroup(item.name)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600/20 text-blue-300"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-2 rounded-lg text-sm transition-colors",
                          pathname === child.href ||
                            pathname.startsWith(child.href + "/")
                            ? "bg-blue-600 text-white font-medium"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-700">
        <div className="flex items-center gap-2 px-3 py-2">
          <Landmark className="w-4 h-4 text-gray-500" />
          <p className="text-xs text-gray-500">Cameroun - OHADA</p>
        </div>
      </div>
    </div>
  );
}
