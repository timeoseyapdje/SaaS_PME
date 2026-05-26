"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { CAMEROON_TAX } from "@/lib/tax";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
}

interface OrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

const EMPTY_ITEM: OrderItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  unit: "",
};

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  const [supplierId, setSupplierId] = useState<string>("");
  const [expectedAt, setExpectedAt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [applyTVA, setApplyTVA] = useState<boolean>(true);
  const [items, setItems] = useState<OrderItem[]>([{ ...EMPTY_ITEM }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((data) => {
        setSuppliers(Array.isArray(data) ? data : []);
        setSuppliersLoading(false);
      })
      .catch(() => setSuppliersLoading(false));
  }, []);

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalHT = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalTVA = applyTVA ? totalHT * CAMEROON_TAX.TVA_RATE : 0;
  const totalTTC = totalHT + totalTVA;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      toast({ title: "Erreur", description: "Ajoutez au moins un article", variant: "destructive" });
      return;
    }

    for (const item of items) {
      if (!item.description.trim()) {
        toast({ title: "Erreur", description: "Chaque article doit avoir une description", variant: "destructive" });
        return;
      }
      if (item.quantity <= 0) {
        toast({ title: "Erreur", description: "La quantité doit être supérieure à 0", variant: "destructive" });
        return;
      }
      if (item.unitPrice < 0) {
        toast({ title: "Erreur", description: "Le prix unitaire ne peut pas être négatif", variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplierId && supplierId !== "none" ? supplierId : undefined,
          expectedAt: expectedAt || undefined,
          notes: notes || undefined,
          applyTVA,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit || undefined,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "Bon de commande créé", description: `Numéro ${data.number}` });
        router.push(`/purchase-orders/${data.id}`);
      } else {
        toast({ title: "Erreur", description: data.error || "Impossible de créer le bon de commande", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Nouveau bon de commande" subtitle="Créez un bon de commande fournisseur" />

      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Back */}
          <Link href="/purchase-orders">
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>

          {/* Header info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Fournisseur</label>
                {suppliersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Chargement...
                  </div>
                ) : (
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun fournisseur</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}{s.city ? ` — ${s.city}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Expected date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date de livraison prévue</label>
                <Input
                  type="date"
                  value={expectedAt}
                  onChange={(e) => setExpectedAt(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                  placeholder="Notes internes, instructions de livraison..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* TVA toggle */}
              <div className="flex items-center gap-3 md:col-span-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={applyTVA}
                  onClick={() => setApplyTVA((v) => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${applyTVA ? "bg-primary" : "bg-input"}`}
                >
                  <span
                    className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${applyTVA ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
                <label className="text-sm font-medium cursor-pointer" onClick={() => setApplyTVA((v) => !v)}>
                  Appliquer la TVA (19,25%)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Articles commandés</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-[1fr_80px_100px_120px_40px] gap-2 text-xs font-medium text-muted-foreground px-0">
                <span>Description *</span>
                <span className="text-center">Qté *</span>
                <span>Unité</span>
                <span className="text-right">Prix unit. *</span>
                <span />
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_80px_100px_120px_40px] gap-2 items-start p-3 md:p-0 rounded-lg border border-border md:border-0 md:rounded-none">
                  {/* Mobile label */}
                  <p className="text-xs font-medium text-muted-foreground md:hidden">Article {index + 1}</p>

                  <Input
                    placeholder="Description de l'article"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Qté"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    className="text-center"
                    required
                  />
                  <Input
                    placeholder="Unité"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Prix unit."
                    min="0"
                    step="1"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="text-right"
                    required
                  />
                  <div className="flex items-center justify-end md:justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      title="Supprimer cet article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Per-row subtotal */}
                  <div className="text-right text-sm font-medium text-muted-foreground md:hidden">
                    Sous-total: {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </div>
              ))}

              <Button type="button" variant="ghost" size="sm" className="w-full border border-dashed border-border" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un article
              </Button>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
                <div className="flex justify-between w-full text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span className="font-medium">{formatCurrency(totalHT)}</span>
                </div>
                <div className="flex justify-between w-full text-sm">
                  <span className="text-muted-foreground">TVA (19,25%)</span>
                  <span className="font-medium">
                    {applyTVA ? formatCurrency(totalTVA) : <span className="italic text-xs">Non applicable</span>}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between w-full">
                  <span className="font-bold">Total TTC</span>
                  <span className="font-bold text-lg text-blue-700 dark:text-blue-400">
                    {formatCurrency(totalTTC)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link href="/purchase-orders">
              <Button type="button" variant="outline" disabled={submitting}>
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Créer le bon de commande
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
