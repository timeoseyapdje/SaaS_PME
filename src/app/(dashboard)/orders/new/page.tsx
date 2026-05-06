"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Loader2, Save, Search } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Client, Product } from "@/types";

interface OrderLine { productId?: string; description: string; quantity: number; unitPrice: number; total: number; }

export default function NewOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [clientId, setClientId] = useState("");
  const [notes, setNotes] = useState("");
  const [applyTVA, setApplyTVA] = useState(true);
  const [lines, setLines] = useState<OrderLine[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
    fetch("/api/products?isActive=true").then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  function addProductLine(product: Product) {
    setLines(prev => [...prev, { productId: product.id, description: product.name, quantity: 1, unitPrice: product.price, total: product.price }]);
    setShowProductSearch(false);
    setProductSearch("");
  }

  function updateLine(i: number, field: keyof OrderLine, value: string | number) {
    setLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l;
      const updated = { ...l, [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        updated.total = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  }

  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const tvaAmount = applyTVA ? subtotal * 0.1925 : 0;
  const total = subtotal + tvaAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.some(l => !l.description)) { setError("Renseignez tous les articles"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientId || null, items: lines, notes, applyTVA }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push("/orders");
    } catch { setError("Erreur serveur"); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Header title="Nouvelle commande" subtitle="Créez une commande pour un client" />
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Client</CardTitle></CardHeader>
          <CardContent>
            <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
              <option value="">Sans client assigné</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Articles</CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowProductSearch(!showProductSearch)}>
                <Search className="w-4 h-4 mr-2" /> Catalogue
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setLines(prev => [...prev, { description: "", quantity: 1, unitPrice: 0, total: 0 }])}>
                <Plus className="w-4 h-4 mr-2" /> Ligne libre
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showProductSearch && (
              <div className="border border-border rounded-xl p-3 bg-muted/30 space-y-2">
                <Input placeholder="Rechercher dans le catalogue..." value={productSearch} onChange={e => setProductSearch(e.target.value)} autoFocus />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredProducts.slice(0, 8).map(p => (
                    <button key={p.id} type="button" onClick={() => addProductLine(p)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-background transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
                      </div>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">{formatCurrency(p.price, p.currency)}</p>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Aucun produit trouvé</p>}
                </div>
              </div>
            )}
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1">
                  {i === 0 && <Label className="text-xs">Description</Label>}
                  <Input value={line.description} onChange={e => updateLine(i, "description", e.target.value)} placeholder="Article ou service" required />
                </div>
                <div className="col-span-2 space-y-1">
                  {i === 0 && <Label className="text-xs">Qté</Label>}
                  <Input type="number" min="0.01" step="0.01" value={line.quantity} onChange={e => updateLine(i, "quantity", Number(e.target.value))} />
                </div>
                <div className="col-span-2 space-y-1">
                  {i === 0 && <Label className="text-xs">Prix unit.</Label>}
                  <Input type="number" min="0" value={line.unitPrice} onChange={e => updateLine(i, "unitPrice", Number(e.target.value))} />
                </div>
                <div className="col-span-2 space-y-1">
                  {i === 0 && <Label className="text-xs">Total</Label>}
                  <p className="h-10 flex items-center text-sm font-medium text-foreground">{formatCurrency(line.total, "XAF")}</p>
                </div>
                <div className="col-span-1">
                  <button type="button" onClick={() => setLines(prev => prev.filter((_, idx) => idx !== i))} className="h-10 w-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal, "XAF")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={applyTVA} onCheckedChange={setApplyTVA} />
                  <span className="text-muted-foreground">TVA (19,25%)</span>
                </div>
                <span className="font-medium">{formatCurrency(tvaAmount, "XAF")}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total TTC</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(total, "XAF")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Instructions de livraison..." className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>}
        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={saving || lines.length === 0}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Créer la commande
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
