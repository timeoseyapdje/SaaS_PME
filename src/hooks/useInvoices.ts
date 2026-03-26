"use client";

import { useState, useEffect, useCallback } from "react";
import { Invoice, InvoiceStatus } from "@/types";

interface UseInvoicesOptions {
  status?: string;
  search?: string;
  clientId?: string;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.status && options.status !== "ALL") {
        params.set("status", options.status);
      }
      if (options.search) params.set("search", options.search);
      if (options.clientId) params.set("clientId", options.clientId);

      const response = await fetch(`/api/invoices?${params}`);
      if (!response.ok) throw new Error("Erreur de chargement");
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [options.status, options.search, options.clientId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  async function createInvoice(data: {
    clientId: string;
    dueDate: string;
    currency: string;
    applyTVA: boolean;
    notes?: string;
    terms?: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
  }) {
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Erreur de création");
    }
    const invoice = await response.json();
    fetchInvoices();
    return invoice;
  }

  async function updateStatus(id: string, status: InvoiceStatus) {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Erreur de mise à jour");
    fetchInvoices();
  }

  async function deleteInvoice(id: string) {
    const response = await fetch(`/api/invoices/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erreur de suppression");
    fetchInvoices();
  }

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoice,
    updateStatus,
    deleteInvoice,
  };
}
