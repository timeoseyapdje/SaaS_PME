"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Invoice, InvoiceStatus } from "@/types";
import { formatCurrency } from "@/lib/currency";

export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(timeout);
  }, [fetchInvoices]);

  async function handleStatusChange(id: string, status: InvoiceStatus) {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchInvoices();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette facture ?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    fetchInvoices();
    toast({ title: "Supprimé", description: "Facture supprimée", variant: "success" as never });
  }

  // Stats
  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    pending: invoices.filter((i) => i.status === "SENT").length,
    overdue: invoices.filter((i) => i.status === "OVERDUE").length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices
      .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
      .reduce((sum, i) => sum + i.total, 0),
  };

  return (
    <div>
      <Header title="Factures" subtitle="Gérez vos factures clients" />
      <div className="p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total factures</p>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(stats.totalAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Payées</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(stats.paidAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(stats.pendingAmount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">En retard</p>
              <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
              <p className="text-xs text-gray-400 mt-1">Action requise</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par numéro ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="SENT">Envoyée</SelectItem>
              <SelectItem value="PAID">Payée</SelectItem>
              <SelectItem value="OVERDUE">En retard</SelectItem>
              <SelectItem value="CANCELLED">Annulée</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/invoices/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </Link>
        </div>

        {/* Invoice table */}
        <Card>
          <CardContent className="p-0">
            <InvoiceTable
              invoices={invoices}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
