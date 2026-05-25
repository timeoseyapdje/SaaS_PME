"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  ShoppingBag,
  Calendar,
  Building2,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

type PurchaseOrderStatus = "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED";

interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string | null;
  total: number;
}

interface PurchaseOrder {
  id: string;
  number: string;
  status: PurchaseOrderStatus;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  applyTVA: boolean;
  notes: string | null;
  expectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
  } | null;
  items: PurchaseOrderItem[];
}

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  RECEIVED: "Reçu",
  CANCELLED: "Annulé",
};

const STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  RECEIVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    fetch(`/api/purchase-orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.error ? null : data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(status: PurchaseOrderStatus) {
    setActionLoading(true);
    const res = await fetch(`/api/purchase-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder(updated);
      setConfirmCancel(false);
      toast({ title: "Statut mis à jour", description: `Bon de commande marqué comme ${STATUS_LABELS[status].toLowerCase()}` });
    } else {
      const data = await res.json();
      toast({ title: "Erreur", description: data.error || "Impossible de mettre à jour", variant: "destructive" });
    }
    setActionLoading(false);
  }

  async function handleDelete() {
    setActionLoading(true);
    const res = await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Bon de commande supprimé" });
      router.push("/purchase-orders");
    } else {
      const data = await res.json();
      toast({ title: "Erreur", description: data.error || "Impossible de supprimer", variant: "destructive" });
    }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="Bon de commande" subtitle="" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="Introuvable" subtitle="" />
        <main className="flex-1 p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <ShoppingBag className="w-10 h-10" />
          <p>Ce bon de commande n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
          <Link href="/purchase-orders">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux bons de commande
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const canDelete = ["DRAFT", "CANCELLED"].includes(order.status);
  const canCancel = !["CANCELLED", "RECEIVED"].includes(order.status);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title={order.number} subtitle="Détail du bon de commande" />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link href="/purchase-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>

            {order.status === "DRAFT" && (
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                onClick={() => handleStatusChange("SENT")}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Envoyer
              </Button>
            )}

            {order.status === "SENT" && (
              <Button
                size="sm"
                variant="outline"
                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                disabled={actionLoading}
                onClick={() => handleStatusChange("RECEIVED")}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Marquer comme reçu
              </Button>
            )}

            {canCancel && (
              confirmCancel ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Annuler ?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange("CANCELLED")}
                  >
                    Oui
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>
                    Non
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                  onClick={() => setConfirmCancel(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              )
            )}

            {canDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Supprimer ?</span>
                  <Button size="sm" variant="destructive" disabled={actionLoading} onClick={handleDelete}>
                    {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Oui"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Non
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Fournisseur</p>
                {order.supplier ? (
                  <>
                    <p className="font-semibold text-sm truncate">{order.supplier.name}</p>
                    {order.supplier.city && (
                      <p className="text-xs text-muted-foreground truncate">{order.supplier.city}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Non spécifié</p>
                )}
              </div>
            </CardContent>
          </Card>

          {order.supplier?.email && (
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Email fournisseur</p>
                  <p className="font-semibold text-sm truncate">{order.supplier.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {order.supplier?.phone && (
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
                  <p className="font-semibold text-sm">{order.supplier.phone}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date de création</p>
                <p className="font-semibold text-sm">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </CardContent>
          </Card>

          {order.expectedAt && (
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Livraison prévue</p>
                  <p className="font-semibold text-sm">
                    {new Date(order.expectedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Items table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Articles commandés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-muted-foreground">Description</th>
                    <th className="py-2 text-right font-medium text-muted-foreground w-20">Qté</th>
                    <th className="py-2 text-left font-medium text-muted-foreground w-20 pl-3">Unité</th>
                    <th className="py-2 text-right font-medium text-muted-foreground w-32">Prix unit.</th>
                    <th className="py-2 text-right font-medium text-muted-foreground w-32">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 pl-3 text-muted-foreground">{item.unit || "—"}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-medium">{formatCurrency(order.totalHT)}</span>
              </div>
              {order.applyTVA && (
                <div className="flex justify-between w-full text-sm">
                  <span className="text-muted-foreground">TVA (19,25%)</span>
                  <span className="font-medium">{formatCurrency(order.totalTVA)}</span>
                </div>
              )}
              {!order.applyTVA && (
                <div className="flex justify-between w-full text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span className="text-muted-foreground italic text-xs">Non applicable</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between w-full">
                <span className="font-bold">Total TTC</span>
                <span className="font-bold text-lg text-blue-700 dark:text-blue-400">
                  {formatCurrency(order.totalTTC)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
