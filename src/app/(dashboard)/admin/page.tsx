"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  FileText,
  TrendingUp,
  TrendingDown,
  Ticket,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalInvoices: number;
  totalRevenues: number;
  totalExpenses: number;
  totalPromoCodes: number;
  activePromoCodes: number;
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    company: { name: string } | null;
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: "Utilisateurs", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Entreprises", value: stats?.totalCompanies || 0, icon: Building2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Factures", value: stats?.totalInvoices || 0, icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Revenus plateforme", value: `${((stats?.totalRevenues || 0) / 1000000).toFixed(1)}M XAF`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Dépenses totales", value: `${((stats?.totalExpenses || 0) / 1000000).toFixed(1)}M XAF`, icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { label: "Codes promo actifs", value: `${stats?.activePromoCodes || 0} / ${stats?.totalPromoCodes || 0}`, icon: Ticket, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Panneau d&apos;administration</h1>
        <p className="text-zinc-400 text-sm mt-1">Vue d&apos;ensemble de la plateforme Nkap Control</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 rounded-xl border ${kpi.bg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick links + Recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick links */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Accès rapide</h2>
          <div className="space-y-2">
            {[
              { label: "Gérer les utilisateurs", href: "/admin/users", icon: Users },
              { label: "Gérer les entreprises", href: "/admin/companies", icon: Building2 },
              { label: "Gérer les codes promo", href: "/admin/promo-codes", icon: Ticket },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-white">Derniers inscrits</h2>
          </div>
          {stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-zinc-800/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{user.name || "Sans nom"}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">{user.company?.name || "Aucune entreprise"}</p>
                    <p className="text-[10px] text-zinc-600">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Aucun utilisateur inscrit</p>
          )}
        </div>
      </div>
    </div>
  );
}
