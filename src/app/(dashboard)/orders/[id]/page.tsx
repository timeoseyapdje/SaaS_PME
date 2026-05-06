"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ArrowLeft, FileText, Loader2, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Order, OrderStatus } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const NEXT_STATUS: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  PENDING: { label: "Confirmer", next: "CONFIRMED" },
  CONFIRMED: { label: "Mettre en traitement", next: "PROCESSING" },
  PROCESSING: { label: "Marquer expédiée", next: "SHIPPED" },
  SHIPPED: { label: "Marquer livrée", next: "DELIVERED" },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) setOrder(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  async function updateStatus(status: OrderStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setOrder(await res.json());
    } finally { setUpdating(false); }
  }

  async function convertToInvoice() {
    if (!order) return;
    setConverting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: order.clientId || null,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          currency: order.currency,
          applyTVA: order.applyTVA,
          notes: `Commande ${order.number}`,
          items: order.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });
      if (res.ok) {
        const invoice = await res.json();
        router.push(`/invoices/${invoice.id}`);
      }
    } finally { setConverting(false); }
  }

  if (loading) return (
    <div className="flex flex-col gap-6"><Header title="Commande" />
      <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}</div>
    </div>
  );

  if (!order) return (
    <div className="flex flex-col gap-6"><Header title="Commande non trouvée" />
      <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
    </div>
  );

  const nextStatus = NEXT_STATUS[order.status as OrderStatus];
  const isCancellable = !["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Header title={order.number} subtitle="Détail de la commande" />
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Button>

      {/* Status timeline */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
            {STATUS_FLOW.map((s, i) => {
              const statusIdx = STATUS_FLOW.indexOf(order.status as OrderStatus);
              const isDone = i <= statusIdx;
              const isCurrent = s === order.status;
              return (
                <div key={s} className="flex items-center gap-1 shrink-0">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isCurrent ? "bg-emerald-500 text-white" :
                    isDone ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <OrderStatusBadge status={s} />
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <ChevronRight className={`w-3 h-3 shrink-0 ${isDone ? "text-emerald-400" : "text-muted-foreground/40"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info + actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <OrderStatusBadge status={order.status as OrderStatus} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium text-foreground">{order.client?.name || "Non assigné"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">{format(new Date(order.createdAt), "d MMMM yyyy", { locale: fr })}</span>
            </div>
            {order.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livré le</span>
                <span className="font-medium text-foreground">{format(new Date(order.deliveredAt), "d MMMM yyyy", { locale: fr })}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {nextStatus && (
              <Button className="w-full" onClick={() => updateStatus(nextStatus.next)} disabled={updating}>
                {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {nextStatus.label}
              </Button>
            )}
            {order.status === "CONFIRMED" && (
              <Button variant="outline" className="w-full" onClick={convertToInvoice} disabled={converting}>
                {converting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Convertir en facture
              </Button>
            )}
            {isCancellable && (
              <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => updateStatus("CANCELLED")} disabled={updating}>
                Annuler la commande
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Articles */}
      <Card className="border-border">
        <CardHeader><CardTitle className="text-base">Articles</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} × {formatCurrency(item.unitPrice, order.currency)}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(item.total, order.currency)}</p>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span>{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            {order.applyTVA && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA (19,25%)</span>
                <span>{formatCurrency(order.tvaAmount, order.currency)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total TTC</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(order.total, order.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{order.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
