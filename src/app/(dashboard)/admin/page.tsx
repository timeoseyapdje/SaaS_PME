"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Ticket,
  Clock,
  Crown,
  Zap,
  Rocket,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface PlanCount {
  plan: string;
  count: number;
}

interface RecentUser {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  companyName: string | null;
  companyCity: string | null;
  plan: string;
}

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  activeSubscriptions: number;
  subscriptionsByPlan: PlanCount[];
  totalPromoCodes: number;
  activePromoCodes: number;
  recentUsers: RecentUser[];
  newUsersThisMonth: number;
  userGrowth: number;
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

  const planLabels: Record<string, { label: string; color: string }> = {
    STARTER: { label: "Starter", color: "text-zinc-400" },
    PRO: { label: "Pro", color: "text-emerald-400" },
    MAX: { label: "Max", color: "text-amber-400" },
  };

  const planIcons: Record<string, typeof Zap> = {
    STARTER: Zap,
    PRO: Crown,
    MAX: Rocket,
  };

  const kpis = [
    {
      label: "Utilisateurs",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      growth: stats?.userGrowth,
    },
    {
      label: "Entreprises",
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/20",
    },
    {
      label: "Abonnements actifs",
      value: stats?.activeSubscriptions || 0,
      icon: Crown,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Codes promo actifs",
      value: `${stats?.activePromoCodes || 0} / ${stats?.totalPromoCodes || 0}`,
      icon: Ticket,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Panneau d&apos;administration</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Vue d&apos;ensemble de la plateforme Nkap Control
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-4 rounded-xl border ${kpi.bg}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">{kpi.label}</p>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              </div>
              {kpi.growth !== undefined && kpi.growth !== 0 && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    kpi.growth > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {kpi.growth > 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(kpi.growth)}%
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Répartition abonnements + Accès rapide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Répartition par plan */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Répartition par plan</h2>
          {stats?.subscriptionsByPlan && stats.subscriptionsByPlan.length > 0 ? (
            <div className="space-y-3">
              {stats.subscriptionsByPlan.map((s) => {
                const PlanIcon = planIcons[s.plan] || Zap;
                const total = stats.activeSubscriptions || 1;
                const percent = Math.round((s.count / total) * 100);
                return (
                  <div key={s.plan} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlanIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-sm text-zinc-300">{s.plan}</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {s.count} <span className="text-zinc-500 font-normal text-xs">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Aucun abonnement actif</p>
          )}

          <div className="mt-5 pt-4 border-t border-zinc-800/50 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Nouveaux ce mois</span>
              <span className="text-emerald-400 font-medium">+{stats?.newUsersThisMonth || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Codes promo actifs</span>
              <span className="text-zinc-300 font-medium">
                {stats?.activePromoCodes || 0} / {stats?.totalPromoCodes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Derniers inscrits */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-white">Derniers inscrits</h2>
            </div>
            {(stats?.newUsersThisMonth || 0) > 0 && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                +{stats?.newUsersThisMonth} ce mois
              </span>
            )}
          </div>
          {stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-2">
              {stats.recentUsers.map((user) => {
                const planInfo = planLabels[user.plan] || planLabels.STARTER;
                const PlanIcon = planIcons[user.plan] || Zap;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2.5 border-b border-zinc-800/30 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Users className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {user.name || "Sans nom"}
                        </p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <PlanIcon className={`w-3 h-3 ${planInfo.color}`} />
                        <span className={`text-xs font-medium ${planInfo.color}`}>
                          {planInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        {user.companyCity && (
                          <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {user.companyCity}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-600 ml-1">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Aucun utilisateur inscrit</p>
          )}
        </div>
      </div>

      {/* Accès rapide */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Accès rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { label: "Gérer les utilisateurs", href: "/admin/users", icon: Users, desc: `${stats?.totalUsers || 0} utilisateurs` },
            { label: "Gérer les entreprises", href: "/admin/companies", icon: Building2, desc: `${stats?.totalCompanies || 0} entreprises` },
            { label: "Gérer les codes promo", href: "/admin/promo-codes", icon: Ticket, desc: `${stats?.activePromoCodes || 0} actifs` },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-700/50"
            >
              <link.icon className="w-4 h-4" />
              <div>
                <p className="font-medium">{link.label}</p>
                <p className="text-[10px] text-zinc-600">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
