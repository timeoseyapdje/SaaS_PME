"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, Trash2, Loader2, Save, Send } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Form state
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [currency, setCurrency] = useState("XAF");
  const [applyTVA, setApplyTVA] = useState(true);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setLoadingClients(false);
      })
      .catch(() => setLoadingClients(false));
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
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
    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? value : Number(value),
    };
    setItems(updated);
  }

  async function handleSubmit(status: "DRAFT" | "SENT") {
    if (!clientId) {
      toast({ title: "Attention", description: "Veuillez sélectionner un client", variant: "destructive" });
      return;
    }
    if (items.some((item) => !item.description)) {
      toast({ title: "Attention", description: "Veuillez remplir la description de chaque ligne", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          dueDate,
          currency,
          applyTVA,
          notes,
          terms,
          items,
          status,
        }),
      });

      if (response.ok) {
        const invoice = await response.json();
        toast({ title: "Succès", description: "Facture créée avec succès", variant: "success" as never });
        router.push(`/invoices/${invoice.id}`);
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
      {/* Header info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingClients ? "Chargement..." : "Sélectionner un client"
                  }
                />
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
            <Label htmlFor="dueDate">Date d&apos;échéance *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
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

      {/* Line items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Lignes de facturation</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une ligne
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantité</div>
              <div className="col-span-3">Prix unitaire</div>
              <div className="col-span-2 text-right">Total HT</div>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-5">
                  <Input
                    placeholder="Description du service / produit"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(index, "unitPrice", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="col-span-1 text-right text-sm font-medium">
                  {formatCurrency(item.quantity * item.unitPrice, currency)}
                </div>
                <div className="col-span-1 flex justify-end">
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

          {/* Totals */}
          <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
            <div className="flex justify-between w-full text-sm">
              <span className="text-gray-500">Sous-total HT</span>
              <span className="font-medium">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="applyTVA"
                  checked={applyTVA}
                  onCheckedChange={(checked) =>
                    setApplyTVA(checked as boolean)
                  }
                />
                <Label htmlFor="applyTVA" className="text-sm cursor-pointer">
                  TVA ({(CAMEROON_TAX.TVA_RATE * 100).toFixed(2)}%)
                </Label>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(tva, currency)}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between w-full">
              <span className="font-bold">Total TTC</span>
              <span className="font-bold text-lg text-blue-700">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Informations supplémentaires pour le client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terms">Conditions de paiement</Label>
            <Textarea
              id="terms"
              placeholder="Ex: Paiement à 30 jours, virement bancaire..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit("DRAFT")}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Enregistrer brouillon
        </Button>
        <Button onClick={() => handleSubmit("SENT")} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Créer et envoyer
        </Button>
      </div>
    </div>
  );
}
