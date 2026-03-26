"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Landmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { InvoiceStatus } from "@/types";

interface DashboardData {
  kpis: {
    revenue: { current: number; last: number };
    expenses: { current: number; last: number };
    result: { current: number; last: number };
    treasury: number;
    pendingInvoices: number;
    pendingCount: number;
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
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <Header
        title="Tableau de bord"
        subtitle={`Résumé financier - ${new Date().toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        })}`}
      />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Revenus du mois"
            value={data?.kpis.revenue.current || 0}
            previousValue={data?.kpis.revenue.last}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBg="bg-green-50"
            loading={loading}
          />
          <KPICard
            title="Dépenses du mois"
            value={data?.kpis.expenses.current || 0}
            previousValue={data?.kpis.expenses.last}
            icon={TrendingDown}
            iconColor="text-red-500"
            iconBg="bg-red-50"
            loading={loading}
          />
          <KPICard
            title="Résultat net"
            value={data?.kpis.result.current || 0}
            previousValue={data?.kpis.result.last}
            icon={Wallet}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            loading={loading}
          />
          <KPICard
            title="Trésorerie totale"
            value={data?.kpis.treasury || 0}
            icon={Landmark}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            loading={loading}
            description="Solde de tous les comptes"
          />
        </div>

        {/* Charts & Pending Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart
              data={data?.chartData || []}
              loading={loading}
            />
          </div>
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Factures en attente
                  {data?.kpis.pendingCount ? (
                    <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {data.kpis.pendingCount}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-100 animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : data?.pendingInvoices.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-sm">Aucune facture en attente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data?.pendingInvoices.map((inv) => (
                      <a
                        key={inv.id}
                        href={`/invoices/${inv.id}`}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">
                            {inv.client?.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Échéance: {formatDate(inv.dueDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <InvoiceStatusBadge
                            status={inv.status as InvoiceStatus}
                          />
                          <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                            {formatCurrency(inv.total, inv.currency)}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Invoices */}
        <RecentInvoices
          invoices={
            (data?.recentInvoices as Parameters<
              typeof RecentInvoices
            >[0]["invoices"]) || []
          }
          loading={loading}
        />
      </div>
    </div>
  );
}
