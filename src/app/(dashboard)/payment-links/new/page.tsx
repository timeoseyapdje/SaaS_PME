"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, Link2 } from "lucide-react";
import { Client } from "@/types";

export default function NewPaymentLinkPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "XAF",
    clientId: "",
    expiresAt: "",
    maxUses: "",
  });

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
  }, []);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.amount) { setError("Titre et montant obligatoires"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
          clientId: form.clientId || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push("/payment-links");
    } catch { setError("Erreur serveur"); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <Header title="Nouveau lien de paiement" subtitle="Créez un lien à partager avec votre client" />
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Link2 className="w-4 h-4" />Détails du lien</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Facture prestation mars" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Description visible par le client" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant (XAF) *</Label>
                <Input type="number" min="1" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <select value={form.clientId} onChange={e => set("clientId", e.target.value)} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
                  <option value="">Aucun</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Options</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiration</Label>
                <Input type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max. utilisations</Label>
                <Input type="number" min="1" value={form.maxUses} onChange={e => set("maxUses", e.target.value)} placeholder="Illimité" />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>}
        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Créer le lien
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
