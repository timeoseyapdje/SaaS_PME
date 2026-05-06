"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Search, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Order, OrderStatus } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUSES = [
  { value: "ALL", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmées" },
  { value: "PROCESSING", label: "En traitement" },
  { value: "SHIPPED", label: "Expédiées" },
  { value: "DELIVERED", label: "Livrées" },
  { value: "CANCELLED", label: "Annulées" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) setOrders(await res.json());
    } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="flex flex-col gap-6">
      <Header title="Commandes" subtitle="Suivez et gérez vos ventes" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher une commande..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                status === s.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Button onClick={() => router.push("/orders/new")} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle commande
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Aucune commande"
          description="Créez votre première commande pour commencer à suivre vos ventes."
          actionLabel="Nouvelle commande"
          onAction={() => router.push("/orders/new")}
        />
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="divide-y divide-border">
            {orders.map(order => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{order.number}</p>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.client?.name || "Client non assigné"} · {format(new Date(order.createdAt), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(order.total, order.currency)}</p>
                  <p className="text-xs text-muted-foreground">{order.items?.length || 0} article{(order.items?.length || 0) > 1 ? "s" : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
