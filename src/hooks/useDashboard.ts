"use client";

import { useState, useEffect, useCallback } from "react";

interface DashboardKPIs {
  revenue: { current: number; last: number };
  expenses: { current: number; last: number };
  result: { current: number; last: number };
  treasury: number;
  pendingInvoices: number;
  pendingCount: number;
}

interface ChartData {
  month: string;
  revenus: number;
  depenses: number;
}

interface DashboardData {
  kpis: DashboardKPIs;
  chartData: ChartData[];
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

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}
