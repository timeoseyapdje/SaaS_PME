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
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Zap,
  Rocket,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface RecentPayment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  companyName: string;
  plan: string;
}

interface PlanCount {
  plan: string;
  count: number;
}

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalInvoices: number;
  platformRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number;
  mrr: number;
  activeSubscriptions: number;
  subscriptionsByPlan: PlanCount[];
  totalPayments: number;
  pendingPayments: number;
  recentPayments: RecentPayment[];
  totalPromoCodes: number;
  activePromoCodes: number;
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    company: { name: string } | null;
  }[];
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

  const formatXAF = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M XAF`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K XAF`;
    return `${amount.toLocaleString()} XAF`;
  };

  const kpis = [
    {
      label: "Revenus plateforme",
      value: formatXAF(stats?.platformRevenue || 0),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      subtitle: "Total des paiements",
    },
    {
      label: "MRR",
      value: formatXAF(stats?.mrr || 0),
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      subtitle: "Revenu mensuel récurrent",
    },
    {
      label: "Revenus ce mois",
      value: formatXAF(stats?.revenueThisMonth || 0),
      icon: CreditCard,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      growth: stats?.revenueGrowth,
    },
    {
      label: "Abonnements actifs",
      value: stats?.activeSubscriptions || 0,
      icon: Crown,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
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
  ];

  const paymentMethodLabels: Record<string, string> = {
    MTN_MONEY: "MTN MoMo",
    ORANGE_MONEY: "Orange Money",
    VIREMENT: "Virement",
    CARTE_BANCAIRE: "Carte",
    ESPECES: "Especes",
    CHEQUE: "Cheque",
  };

  const paymentStatusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "En attente", color: "text-amber-400 bg-amber-500/10" },
    COMPLETED: { label: "Payé", color: "text-emerald-400 bg-emerald-500/10" },
    FAILED: { label: "Échoué", color: "text-rose-400 bg-rose-500/10" },
    REFUNDED: { label: "Remboursé", color: "text-zinc-400 bg-zinc-500/10" },
  };

  const planIcons: Record<string, typeof Zap> = {
    STARTER: Zap,
    PRO: Crown,
    MAX: Rocket,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Panneau d&apos;administration</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Vue d&apos;ensemble de la plateforme Nkap Control
        </p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">{kpi.label}</p>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  {"subtitle" in kpi && kpi.subtitle && (
                    <p className="text-[10px] text-zinc-600">{kpi.subtitle}</p>
                  )}
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

      {/* Répartition abonnements + Stats rapides */}
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
              <span className="text-zinc-500">Factures créées</span>
              <span className="text-zinc-300 font-medium">{stats?.totalInvoices || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Paiements reçus</span>
              <span className="text-zinc-300 font-medium">{stats?.totalPayments || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Paiements en attente</span>
              <span className="text-amber-400 font-medium">{stats?.pendingPayments || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Codes promo actifs</span>
              <span className="text-zinc-300 font-medium">
                {stats?.activePromoCodes || 0} / {stats?.totalPromoCodes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Derniers paiements plateforme */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-white">Derniers paiements</h2>
            </div>
            {(stats?.pendingPayments || 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" />
                {stats?.pendingPayments} en attente
              </div>
            )}
          </div>
          {stats?.recentPayments && stats.recentPayments.length > 0 ? (
            <div className="space-y-2">
              {stats.recentPayments.map((payment) => {
                const statusInfo = paymentStatusLabels[payment.status] || {
                  label: payment.status,
                  color: "text-zinc-400",
                };
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2.5 border-b border-zinc-800/30 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {payment.companyName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod} · Plan{" "}
                          {payment.plan}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Aucun paiement enregistré</p>
          )}
        </div>
      </div>

      {/* Accès rapide + Derniers inscrits */}
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
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-zinc-800/30 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {user.name || "Sans nom"}
                    </p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">
                      {user.company?.name || "Aucune entreprise"}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </p>
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
