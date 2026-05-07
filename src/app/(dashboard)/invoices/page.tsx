"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Plus, Search, Download } from "lucide-react";
import { Invoice, InvoiceStatus } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { exportToExcel, exportToCSV, formatInvoicesForExport } from "@/lib/export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoicesPage() {
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
    <div className="flex flex-col gap-5">
      <Header title="Factures" subtitle="Gérez vos factures clients" />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "TOTAL", count: stats.total, amount: formatCurrency(stats.totalAmount), color: "text-foreground" },
          { label: "PAYÉES", count: stats.paid, amount: formatCurrency(stats.paidAmount), color: "text-emerald-500" },
          { label: "EN ATTENTE", count: stats.pending, amount: formatCurrency(stats.pendingAmount), color: "text-amber-500" },
          { label: "EN RETARD", count: stats.overdue, amount: "Action requise", color: "text-rose-500" },
        ].map((s) => (
          <Card key={s.label} className="h-[88px] border-border bg-card shadow-sm">
            <CardContent className="p-3.5 h-full flex flex-col justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className={`text-[22px] font-bold leading-none ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.amount}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
        {invoices.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToExcel(formatInvoicesForExport(invoices), "Factures", "Factures")}>
                Exporter Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(formatInvoicesForExport(invoices), "Factures")}>
                Exporter CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Link href="/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
        </Link>
      </div>

      {/* Invoice table */}
      <Card className="border-border shadow-sm">
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
  );
}
