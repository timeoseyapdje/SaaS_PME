"use client";

import { useState, useEffect, useCallback } from "react";
import { Client, ClientType } from "@/types";

interface ClientWithCount extends Client {
  _count?: { invoices: number };
}

export function useClients(search?: string) {
  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const response = await fetch(`/api/clients?${params}`);
      if (!response.ok) throw new Error("Erreur de chargement");
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  async function createClient(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    taxId?: string;
    type?: ClientType;
    notes?: string;
  }) {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Erreur de création");
    }
    const client = await response.json();
    fetchClients();
    return client;
  }

  async function updateClient(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      taxId?: string;
      type?: ClientType;
      notes?: string;
    }
  ) {
    const response = await fetch("/api/clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error("Erreur de mise à jour");
    fetchClients();
  }

  async function deleteClient(id: string) {
    const response = await fetch(`/api/clients?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erreur de suppression");
    fetchClients();
  }

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}
