"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { Category } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    costPrice: "",
    currency: "XAF",
    categoryId: "",
    unit: "piece",
    trackStock: true,
    stock: "0",
    lowStockThreshold: "5",
  });

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) { setError("Nom et prix obligatoires"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          costPrice: form.costPrice ? Number(form.costPrice) : null,
          stock: Number(form.stock),
          lowStockThreshold: Number(form.lowStockThreshold),
          images: [],
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push("/products");
    } catch { setError("Erreur serveur"); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Header title="Nouveau produit / service" subtitle="Ajoutez un produit ou une prestation à votre catalogue" />

      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Consultation RH, Logo design, Sac en cuir..." required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                rows={3}
                placeholder="Décrivez votre produit ou service..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Référence (SKU)</Label>
                <Input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="PROD-001" />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <select
                  value={form.categoryId}
                  onChange={e => set("categoryId", e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="">Sans catégorie</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unité</Label>
              <select
                value={form.unit}
                onChange={e => {
                  const v = e.target.value;
                  set("unit", v);
                  const serviceUnits = ["heure", "jour", "semaine", "mois", "forfait", "seance", "projet", "consultation"];
                  if (serviceUnits.includes(v)) set("trackStock", false);
                }}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              >
                <optgroup label="Produits">
                  <option value="piece">Pièce</option>
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="g">Gramme (g)</option>
                  <option value="litre">Litre (L)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="m">Mètre (m)</option>
                  <option value="boite">Boîte</option>
                  <option value="sac">Sac</option>
                  <option value="carton">Carton</option>
                </optgroup>
                <optgroup label="Services & Prestations">
                  <option value="heure">Heure</option>
                  <option value="jour">Jour</option>
                  <option value="semaine">Semaine</option>
                  <option value="mois">Mois</option>
                  <option value="forfait">Forfait</option>
                  <option value="seance">Séance</option>
                  <option value="projet">Projet</option>
                  <option value="consultation">Consultation</option>
                </optgroup>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Tarification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix / Tarif (XAF) *</Label>
                <Input type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label>Coût de revient (XAF)</Label>
                <Input type="number" min="0" value={form.costPrice} onChange={e => set("costPrice", e.target.value)} placeholder="0" />
              </div>
            </div>
            {form.price && form.costPrice && Number(form.price) > 0 && Number(form.costPrice) > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Marge : {(((Number(form.price) - Number(form.costPrice)) / Number(form.price)) * 100).toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Gestion du stock</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Suivre le stock</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Décrémenter automatiquement lors des ventes</p>
              </div>
              <Switch checked={form.trackStock} onCheckedChange={(v: boolean) => set("trackStock", v)} />
            </div>
            {form.trackStock && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock initial</Label>
                  <Input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Seuil d&apos;alerte</Label>
                  <Input type="number" min="0" value={form.lowStockThreshold} onChange={e => set("lowStockThreshold", e.target.value)} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
