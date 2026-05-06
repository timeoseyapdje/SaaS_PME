"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { StockBadge } from "@/components/products/StockBadge";
import { ArrowLeft, Loader2, Save, Package, Plus, Minus, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Product, StockMovement } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MOVEMENT_LABELS: Record<string, string> = {
  IN: "Entrée stock",
  OUT: "Sortie stock",
  ADJUSTMENT: "Ajustement",
  RETURN: "Retour",
};
const MOVEMENT_COLORS: Record<string, string> = {
  IN: "text-emerald-600 dark:text-emerald-400",
  OUT: "text-red-500",
  ADJUSTMENT: "text-amber-500",
  RETURN: "text-blue-500",
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [tab, setTab] = useState<"details" | "stock">("details");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");

  const [form, setForm] = useState({
    name: "", description: "", sku: "", price: "", costPrice: "",
    categoryId: "", unit: "piece", isActive: true, trackStock: true,
    stock: "0", lowStockThreshold: "5",
  });

  const fetchProduct = useCallback(async () => {
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProduct(data);
      setForm({
        name: data.name || "",
        description: data.description || "",
        sku: data.sku || "",
        price: String(data.price),
        costPrice: data.costPrice ? String(data.costPrice) : "",
        categoryId: data.categoryId || "",
        unit: data.unit || "piece",
        isActive: data.isActive,
        trackStock: data.trackStock,
        stock: String(data.stock),
        lowStockThreshold: String(data.lowStockThreshold),
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const set = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), costPrice: form.costPrice ? Number(form.costPrice) : null, stock: Number(form.stock), lowStockThreshold: Number(form.lowStockThreshold), images: product?.images || [] }),
      });
      fetchProduct();
    } finally { setSaving(false); }
  }

  async function adjustStock(type: "IN" | "OUT" | "ADJUSTMENT") {
    if (!qty || Number(qty) <= 0) return;
    setAdjusting(true);
    try {
      await fetch(`/api/products/${id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, quantity: Number(qty), reason: reason || undefined }),
      });
      setQty(""); setReason("");
      fetchProduct();
    } finally { setAdjusting(false); }
  }

  if (loading) return (
    <div className="flex flex-col gap-6">
      <Header title="Produit" />
      <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}</div>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col gap-6">
      <Header title="Produit non trouvé" />
      <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Header title={product.name} subtitle="Détail et gestion du produit" />
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Button>

      {/* Stock status + tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StockBadge stock={product.stock} threshold={product.lowStockThreshold} trackStock={product.trackStock} />
          <span className="text-sm text-muted-foreground">{formatCurrency(product.price, product.currency)}</span>
        </div>
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          {(["details", "stock"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {t === "details" ? "Informations" : "Historique stock"}
            </button>
          ))}
        </div>
      </div>

      {tab === "details" ? (
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={form.name} onChange={e => set("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="PROD-001" />
                </div>
                <div className="space-y-2">
                  <Label>Unité</Label>
                  <select value={form.unit} onChange={e => set("unit", e.target.value)} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
                    {["piece","kg","g","litre","ml","m","boite","sac","carton"].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Produit actif</Label>
                <Switch checked={form.isActive} onCheckedChange={(v: boolean) => set("isActive", v)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Prix</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix de vente (XAF)</Label>
                <Input type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Prix d&apos;achat (XAF)</Label>
                <Input type="number" min="0" value={form.costPrice} onChange={e => set("costPrice", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Stock</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Suivi du stock</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Décrémenter lors des ventes</p>
                </div>
                <Switch checked={form.trackStock} onCheckedChange={(v: boolean) => set("trackStock", v)} />
              </div>
              {form.trackStock && (
                <>
                  <Separator />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ajustement rapide</p>
                  <div className="flex gap-2">
                    <Input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="Quantité" className="flex-1" />
                    <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Motif" className="flex-1" />
                    <Button size="sm" variant="outline" onClick={() => adjustStock("IN")} disabled={adjusting} className="text-emerald-600 border-emerald-300">
                      {adjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => adjustStock("OUT")} disabled={adjusting} className="text-red-500 border-red-300">
                      {adjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Seuil d&apos;alerte</Label>
                      <Input type="number" min="0" value={form.lowStockThreshold} onChange={e => set("lowStockThreshold", e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 pb-8">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-border overflow-hidden">
          <CardHeader><CardTitle className="text-base">Historique des mouvements de stock</CardTitle></CardHeader>
          <CardContent className="p-0">
            {!product.stockMovements || product.stockMovements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Aucun mouvement de stock enregistré</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(product.stockMovements as StockMovement[]).map(m => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className={`text-sm font-medium ${MOVEMENT_COLORS[m.type]}`}>{MOVEMENT_LABELS[m.type]}</p>
                      {m.reason && <p className="text-xs text-muted-foreground">{m.reason}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${m.type === "IN" || m.type === "RETURN" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                        {m.type === "IN" || m.type === "RETURN" ? "+" : "-"}{m.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">{format(new Date(m.createdAt), "d MMM yyyy, HH:mm", { locale: fr })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
