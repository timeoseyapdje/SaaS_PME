"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";
import { CAMEROON_TAX } from "@/lib/tax";
import { Client } from "@/types";
import { Plus, Trash2, Loader2, Save, Send, BookOpen, LayoutTemplate, ChevronDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductPickerDialog } from "@/components/ui/product-picker-dialog";

interface TemplateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string | null;
}

interface Template {
  id: string;
  name: string;
  notes?: string | null;
  paymentTerms?: string | null;
  applyTVA: boolean;
  items: TemplateItem[];
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function QuoteForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  // Template picker state
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [clientId, setClientId] = useState("");
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [currency, setCurrency] = useState("XAF");
  const [applyTVA, setApplyTVA] = useState(true);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setLoadingClients(false);
      })
      .catch(() => setLoadingClients(false));
  }, []);

  async function openTemplatePicker() {
    setShowTemplatePicker(true);
    if (templates.length > 0) return;
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/templates?type=QUOTE");
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoadingTemplates(false);
    }
  }

  function applyTemplate(template: Template) {
    setItems(
      template.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );
    if (template.notes) setNotes(template.notes);
    if (template.paymentTerms) setTerms(template.paymentTerms);
    setApplyTVA(template.applyTVA);
    setShowTemplatePicker(false);
    toast({ title: "Modèle chargé", description: `"${template.name}" a été appliqué` });
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tva = applyTVA ? subtotal * CAMEROON_TAX.TVA_RATE : 0;
  const total = subtotal + tva;

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: field === "description" ? value : Number(value) };
    setItems(updated);
  }

  async function handleSubmit(status: "DRAFT" | "SENT") {
    if (!clientId) {
      toast({ title: "Client requis", description: "Veuillez sélectionner un client", variant: "destructive" });
      return;
    }
    if (items.some((item) => !item.description)) {
      toast({ title: "Description manquante", description: "Veuillez remplir la description de chaque ligne", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, validUntil, currency, applyTVA, notes, terms, items, status }),
      });

      if (response.ok) {
        const quote = await response.json();
        router.push(`/devis/${quote.id}`);
      } else {
        const err = await response.json();
        toast({ title: "Erreur", description: err.error || "Erreur lors de la création", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Template picker */}
      <div className="flex items-center justify-end relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openTemplatePicker}
          className="flex items-center gap-2"
        >
          <LayoutTemplate className="w-4 h-4" />
          Charger un modèle
          <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
        </Button>
        {showTemplatePicker && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowTemplatePicker(false)} />
            <div className="absolute right-0 top-9 z-40 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold">Modèles de devis</span>
                <button onClick={() => setShowTemplatePicker(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <LayoutTemplate className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    Aucun modèle de devis
                  </div>
                ) : (
                  templates.map((template) => {
                    const sub = template.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0"
                      >
                        <p className="text-sm font-medium text-foreground">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.items.length} ligne{template.items.length > 1 ? "s" : ""} —{" "}
                          {formatCurrency(sub, "XAF")}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder={loadingClients ? "Chargement..." : "Sélectionner un client"} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valide jusqu'au *</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Devise</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XAF">FCFA (XAF)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="USD">Dollar US (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Lignes du devis</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une ligne
          </Button>
        </CardHeader>
        <ProductPickerDialog
          open={pickerIndex !== null}
          onClose={() => setPickerIndex(null)}
          onSelect={(product) => {
            if (pickerIndex !== null) {
              updateItem(pickerIndex, "description", product.description);
              updateItem(pickerIndex, "unitPrice", product.unitPrice);
            }
          }}
        />
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantité</div>
              <div className="col-span-3">Prix unitaire</div>
              <div className="col-span-2 text-right">Total HT</div>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    placeholder="Description du service / produit"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-1 text-right text-sm font-medium">
                  {formatCurrency(item.quantity * item.unitPrice, currency)}
                </div>
                <div className="col-span-1 flex justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    title="Choisir du catalogue"
                    onClick={() => setPickerIndex(index)}
                    type="button"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
            <div className="flex justify-between w-full text-sm">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="applyTVA"
                  checked={applyTVA}
                  onCheckedChange={(checked) => setApplyTVA(checked as boolean)}
                />
                <Label htmlFor="applyTVA" className="text-sm cursor-pointer">
                  TVA ({(CAMEROON_TAX.TVA_RATE * 100).toFixed(2)}%)
                </Label>
              </div>
              <span className="text-sm font-medium">{formatCurrency(tva, currency)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between w-full">
              <span className="font-bold">Total TTC</span>
              <span className="font-bold text-lg text-blue-700">{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Informations supplémentaires pour le client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Conditions</Label>
            <Textarea
              placeholder="Ex: Valable 30 jours, paiement à la commande..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={loading}>
          Annuler
        </Button>
        <Button variant="outline" onClick={() => handleSubmit("DRAFT")} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Enregistrer brouillon
        </Button>
        <Button onClick={() => handleSubmit("SENT")} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Créer et envoyer
        </Button>
      </div>
    </div>
  );
}
