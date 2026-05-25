"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
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
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ShoppingBag,
  Eye,
  Trash2,
  XCircle,
  Send,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

type PurchaseOrderStatus = "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED";

interface PurchaseOrder {
  id: string;
  number: string;
  status: PurchaseOrderStatus;
  totalTTC: number;
  totalHT: number;
  totalTVA: number;
  applyTVA: boolean;
  notes: string | null;
  expectedAt: string | null;
  createdAt: string;
  supplier: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  RECEIVED: "Reçu",
  CANCELLED: "Annulé",
};

const STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "text-muted-foreground bg-muted",
  SENT: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
  RECEIVED: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
  CANCELLED: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40",
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/purchase-orders?${params}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timeout);
  }, [fetchOrders]);

  async function handleStatusChange(id: string, status: PurchaseOrderStatus) {
    const res = await fetch(`/api/purchase-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchOrders();
      toast({ title: "Statut mis à jour" });
    } else {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setConfirmDelete(null);
      fetchOrders();
      toast({ title: "Bon de commande supprimé" });
    } else {
      const data = await res.json();
      toast({ title: "Erreur", description: data.error || "Impossible de supprimer", variant: "destructive" });
    }
  }

  const stats = {
    total: orders.length,
    draft: orders.filter((o) => o.status === "DRAFT").length,
    sent: orders.filter((o) => o.status === "SENT").length,
    received: orders.filter((o) => o.status === "RECEIVED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    totalAmount: orders.reduce((sum, o) => sum + o.totalTTC, 0),
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Bons de commande" subtitle="Gérez vos commandes fournisseurs" />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="h-[88px] border-border bg-card shadow-sm">
            <CardContent className="p-3.5 h-full flex flex-col justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">TOTAL</p>
              <p className="text-[22px] font-bold leading-none">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground truncate">{formatCurrency(stats.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card className="h-[88px] border-border bg-card shadow-sm">
            <CardContent className="p-3.5 h-full flex flex-col justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">EN ATTENTE</p>
              <p className="text-[22px] font-bold leading-none text-amber-500">{stats.draft + stats.sent}</p>
              <p className="text-[10px] text-muted-foreground">{stats.draft} brouillon · {stats.sent} envoyé</p>
            </CardContent>
          </Card>
          <Card className="h-[88px] border-border bg-card shadow-sm">
            <CardContent className="p-3.5 h-full flex flex-col justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">REÇUS</p>
              <p className="text-[22px] font-bold leading-none text-emerald-500">{stats.received}</p>
              <p className="text-[10px] text-muted-foreground">Livraisons confirmées</p>
            </CardContent>
          </Card>
          <Card className="h-[88px] border-border bg-card shadow-sm">
            <CardContent className="p-3.5 h-full flex flex-col justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">ANNULÉS</p>
              <p className="text-[22px] font-bold leading-none text-red-500">{stats.cancelled}</p>
              <p className="text-[10px] text-muted-foreground">Commandes annulées</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters + New button */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou fournisseur..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="DRAFT">Brouillons</SelectItem>
                <SelectItem value="SENT">Envoyés</SelectItem>
                <SelectItem value="RECEIVED">Reçus</SelectItem>
                <SelectItem value="CANCELLED">Annulés</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/purchase-orders/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau bon de commande
            </Button>
          </Link>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Chargement...
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                <ShoppingBag className="w-8 h-8" />
                <p className="text-sm">Aucun bon de commande trouvé</p>
                <Link href="/purchase-orders/new">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Créer un bon de commande
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Numéro</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fournisseur</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date prévue</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Montant TTC</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/purchase-orders/${order.id}`)}
                      >
                        <td className="px-4 py-3 font-medium font-mono text-blue-600 dark:text-blue-400">
                          {order.number}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {order.supplier?.name || <span className="italic text-xs">Sans fournisseur</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {order.expectedAt
                            ? new Date(order.expectedAt).toLocaleDateString("fr-FR")
                            : <span className="text-xs italic">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(order.totalTTC)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/purchase-orders/${order.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {order.status === "DRAFT" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                title="Marquer comme envoyé"
                                onClick={() => handleStatusChange(order.id, "SENT")}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            {order.status === "SENT" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-500 hover:text-emerald-700"
                                title="Marquer comme reçu"
                                onClick={() => handleStatusChange(order.id, "RECEIVED")}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {["DRAFT", "CANCELLED"].includes(order.status) && (
                              confirmDelete === order.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleDelete(order.id)}
                                  >
                                    Oui
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setConfirmDelete(null)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => setConfirmDelete(order.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
