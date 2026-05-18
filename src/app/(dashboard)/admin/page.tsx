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
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

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
  totalPromoUsages: number;
  recentUsers: RecentUser[];
  newUsersThisMonth: number;
  userGrowth: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
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

  const planLabels: Record<string, { label: string; color: string }> = {
    STARTER: { label: "Starter", color: "text-muted-foreground" },
    PRO: { label: "Pro", color: "text-emerald-400" },
    MAX: { label: "Max", color: "text-amber-400" },
  };

  const planIcons: Record<string, typeof Zap> = {
    STARTER: Zap,
    PRO: Crown,
    MAX: Rocket,
  };

  const paymentMethodLabels: Record<string, string> = {
    MTN_MONEY: "MTN MoMo",
    ORANGE_MONEY: "Orange Money",
    VIREMENT: "Virement",
    CARTE_BANCAIRE: "Carte",
  };

  const paymentStatusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "En attente", color: "text-amber-400 bg-amber-500/10" },
    COMPLETED: { label: "Payé", color: "text-emerald-400 bg-emerald-500/10" },
    FAILED: { label: "Échoué", color: "text-rose-400 bg-rose-500/10" },
    REFUNDED: { label: "Remboursé", color: "text-muted-foreground bg-muted" },
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
      subtitle: "Montants réels (promos incluses)",
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

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Administration" subtitle="Vue d'ensemble de la plateforme Nkap Control" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-6">
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
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  {"subtitle" in kpi && kpi.subtitle && (
                    <p className="text-[10px] text-muted-foreground">{kpi.subtitle}</p>
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

      {/* Répartition abonnements + Derniers paiements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Répartition par plan */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Répartition par plan</h2>
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
                        <PlanIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{s.plan}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {s.count} <span className="text-muted-foreground font-normal text-xs">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
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
            <p className="text-sm text-muted-foreground">Aucun abonnement actif</p>
          )}

          <div className="mt-5 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Paiements reçus</span>
              <span className="text-foreground font-medium">{stats?.totalPayments || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Paiements en attente</span>
              <span className="text-amber-400 font-medium">{stats?.pendingPayments || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Codes promo utilisés</span>
              <span className="text-foreground font-medium">{stats?.totalPromoUsages || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Codes promo actifs</span>
              <span className="text-foreground font-medium">
                {stats?.activePromoCodes || 0} / {stats?.totalPromoCodes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Derniers paiements plateforme */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Derniers paiements</h2>
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
                  color: "text-muted-foreground",
                };
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {payment.companyName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod} · Plan{" "}
                          {payment.plan}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun paiement enregistré</p>
          )}
        </div>
      </div>

      {/* Accès rapide + Derniers inscrits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick links */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Accès rapide</h2>
          <div className="space-y-2">
            {[
              { label: "Gérer les utilisateurs", href: "/admin/users", icon: Users, desc: `${stats?.totalUsers || 0} utilisateurs` },
              { label: "Gérer les entreprises", href: "/admin/companies", icon: Building2, desc: `${stats?.totalCompanies || 0} entreprises` },
              { label: "Gérer les codes promo", href: "/admin/promo-codes", icon: Ticket, desc: `${stats?.activePromoCodes || 0} actifs` },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <link.icon className="w-4 h-4" />
                <div>
                  <p className="font-medium">{link.label}</p>
                  <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Derniers inscrits</h2>
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
                    className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.name || "Sans nom"}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
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
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {user.companyCity}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun utilisateur inscrit</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
