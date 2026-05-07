"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Landmark,
  AlertTriangle,
  Package,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { InvoiceStatus } from "@/types";
import Link from "next/link";

interface DashboardData {
  kpis: {
    revenue: { current: number; last: number };
    expenses: { current: number; last: number };
    result: { current: number; last: number };
    treasury: number;
    pendingInvoices: number;
    pendingCount: number;
    activeProducts: number;
    pendingOrders: number;
    lowStockCount: number;
  };
  chartData: Array<{ month: string; revenus: number; depenses: number }>;
  recentInvoices: Array<{
    id: string;
    number: string;
    status: string;
    dueDate: string;
    total: number;
    currency: string;
    client?: { name: string } | null;
  }>;
  pendingInvoices: Array<{
    id: string;
    number: string;
    status: string;
    dueDate: string;
    total: number;
    currency: string;
    client?: { name: string } | null;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Erreur serveur");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Impossible de charger les donnees");
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Tableau de bord" subtitle="Vue globale" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">Verifiez que la base de donnees est accessible et que le seed a ete execute.</p>
            <button
              onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Reessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Tableau de bord"
        subtitle={`Vision financiere globale - ${new Date().toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        })}`}
      />
      <div className="p-2 sm:p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* KPI Cards — 6 indicateurs */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 items-stretch">
            <motion.div variants={itemVariants} className="h-full">
              <KPICard
                title="Revenus du mois"
                value={data?.kpis.revenue.current || 0}
                previousValue={data?.kpis.revenue.last}
                icon={TrendingUp}
                iconColor="text-emerald-500"
                iconBg="bg-emerald-500/10"
                loading={loading}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="h-full">
              <KPICard
                title="Depenses du mois"
                value={data?.kpis.expenses.current || 0}
                previousValue={data?.kpis.expenses.last}
                icon={TrendingDown}
                iconColor="text-rose-500"
                iconBg="bg-rose-500/10"
                loading={loading}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="h-full">
              <KPICard
                title="Resultat net"
                value={data?.kpis.result.current || 0}
                previousValue={data?.kpis.result.last}
                icon={Wallet}
                iconColor="text-indigo-500"
                iconBg="bg-indigo-500/10"
                loading={loading}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="h-full">
              <KPICard
                title="Tresorerie totale"
                value={data?.kpis.treasury || 0}
                icon={Landmark}
                iconColor="text-purple-500"
                iconBg="bg-purple-500/10"
                loading={loading}
                description="Solde de tous les comptes"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="h-full">
              <KPICard
                title="Produits actifs"
                value={data?.kpis.activeProducts || 0}
                icon={Package}
                iconColor="text-amber-500"
                iconBg="bg-amber-500/10"
                loading={loading}
                currency=""
                description={data?.kpis.lowStockCount ? `${data.kpis.lowStockCount} en stock faible` : "Stocks OK"}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="h-full">
              <KPICard
                title="Commandes en cours"
                value={data?.kpis.pendingOrders || 0}
                icon={ShoppingCart}
                iconColor="text-cyan-500"
                iconBg="bg-cyan-500/10"
                loading={loading}
                currency=""
                description="En attente / Confirmées"
              />
            </motion.div>
          </div>

          {/* Alerte stock faible */}
          {!loading && (data?.lowStockProducts?.length ?? 0) > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    Stock faible — {data!.kpis.lowStockCount} produit{data!.kpis.lowStockCount > 1 ? "s" : ""} à réapprovisionner
                  </CardTitle>
                  <Link href="/products/inventory">
                    <button className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline">
                      Voir l&apos;inventaire <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {data!.lowStockProducts.map((p) => (
                      <Link key={p.id} href={`/products/${p.id}`}>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:opacity-80 ${
                          p.stock === 0
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                        }`}>
                          <Package className="w-3 h-3" />
                          {p.name}
                          <span className="font-bold">{p.stock === 0 ? "Rupture" : `${p.stock} restant${p.stock > 1 ? "s" : ""}`}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Charts & Pending Invoices */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <RevenueChart
                data={data?.chartData || []}
                loading={loading}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm shadow-sm flex flex-col">
                <CardHeader className="pb-4 border-b border-border/40">
                  <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-orange-500" />
                    </div>
                    Factures en attente
                    {data?.kpis.pendingCount ? (
                      <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-orange-500/20">
                        {data.kpis.pendingCount}
                      </span>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  {loading ? (
                    <div className="p-4 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 bg-muted/60 animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : !data?.pendingInvoices?.length ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center p-6 text-muted-foreground">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-[15px] font-medium text-foreground mb-1">Tout est a jour</p>
                      <p className="text-xs">Aucune facture en attente de paiement.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40 max-h-[350px] overflow-y-auto">
                      {data.pendingInvoices.map((inv) => (
                        <Link
                          key={inv.id}
                          href={`/invoices/${inv.id}`}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium text-foreground truncate group-hover:text-amber-600 transition-colors">
                              {inv.client?.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Echeance: {formatDate(inv.dueDate)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 ml-4">
                            <span className="text-[14px] font-semibold text-foreground tracking-tight whitespace-nowrap">
                              {formatCurrency(inv.total, inv.currency)}
                            </span>
                            <div className="scale-90 origin-right">
                              <InvoiceStatusBadge status={inv.status as InvoiceStatus} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Invoices */}
          <motion.div variants={itemVariants}>
            <RecentInvoices
              invoices={
                (data?.recentInvoices as Parameters<typeof RecentInvoices>[0]["invoices"]) || []
              }
              loading={loading}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
