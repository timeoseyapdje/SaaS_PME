"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { CAMEROON_TAX } from "@/lib/tax";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  FileText,
  ChevronDown,
  Edit2,
  X,
  LayoutTemplate,
  Package,
} from "lucide-react";

interface TemplateItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  notes?: string | null;
  paymentTerms?: string | null;
  applyTVA: boolean;
  items: TemplateItem[];
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  name: "",
  type: "INVOICE" as "INVOICE" | "QUOTE",
  notes: "",
  paymentTerms: "",
  applyTVA: true,
  items: [{ description: "", quantity: 1, unitPrice: 0, unit: "" }] as TemplateItem[],
};

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"INVOICE" | "QUOTE">("INVOICE");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les modèles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm, type: activeTab, items: [{ description: "", quantity: 1, unitPrice: 0, unit: "" }] });
    setShowForm(true);
  }

  function openEditForm(template: Template) {
    setEditingId(template.id);
    setForm({
      name: template.name,
      type: (template.type as "INVOICE" | "QUOTE"),
      notes: template.notes || "",
      paymentTerms: template.paymentTerms || "",
      applyTVA: template.applyTVA,
      items: template.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit || "",
      })),
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, unit: "" }],
    }));
  }

  function removeItem(index: number) {
    if (form.items.length === 1) return;
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  function updateItem(index: number, field: keyof TemplateItem, value: string | number) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        [field]: field === "description" || field === "unit" ? value : Number(value),
      };
      return { ...prev, items };
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast({ title: "Nom requis", description: "Veuillez saisir un nom pour le modèle", variant: "destructive" });
      return;
    }
    if (form.items.some((item) => !item.description.trim())) {
      toast({ title: "Description manquante", description: "Veuillez remplir la description de chaque ligne", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        type: form.type,
        notes: form.notes || null,
        paymentTerms: form.paymentTerms || null,
        applyTVA: form.applyTVA,
        items: form.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit || null,
        })),
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/templates/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        toast({ title: editingId ? "Modèle mis à jour" : "Modèle créé", description: `"${form.name}" a été sauvegardé` });
        closeForm();
        fetchTemplates();
      } else {
        const err = await res.json();
        toast({ title: "Erreur", description: err.error || "Une erreur est survenue", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Modèle supprimé" });
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast({ title: "Erreur", description: "Impossible de supprimer ce modèle", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  const filtered = templates.filter((t) => t.type === activeTab);

  const subtotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tva = form.applyTVA ? subtotal * CAMEROON_TAX.TVA_RATE : 0;
  const total = subtotal + tva;

  return (
    <div>
      <Header title="Modèles" subtitle="Réutilisez vos structures de factures et devis" />
      <div className="p-4 md:p-6 space-y-6">

        {/* Tabs + New button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("INVOICE")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "INVOICE"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Factures ({templates.filter((t) => t.type === "INVOICE").length})
            </button>
            <button
              onClick={() => setActiveTab("QUOTE")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "QUOTE"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-3.5 h-3.5 inline mr-1.5" />
              Devis ({templates.filter((t) => t.type === "QUOTE").length})
            </button>
          </div>
          <Button onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau modèle
          </Button>
        </div>

        {/* Inline form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-primary/30 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-primary" />
                    {editingId ? "Modifier le modèle" : "Nouveau modèle"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={closeForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Name + Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom du modèle *</Label>
                      <Input
                        placeholder="Ex: Prestation mensuelle standard"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg w-fit">
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, type: "INVOICE" }))}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            form.type === "INVOICE"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Facture
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, type: "QUOTE" }))}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            form.type === "QUOTE"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Devis
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Lignes</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Ajouter
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2">Qté</div>
                        <div className="col-span-2">Prix HT</div>
                        <div className="col-span-2">Unité</div>
                        <div className="col-span-1"></div>
                      </div>
                      {form.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <Input
                              placeholder="Description"
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
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="0"
                              step="100"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              placeholder="pcs, h..."
                              value={item.unit || ""}
                              onChange={(e) => updateItem(index, "unit", e.target.value)}
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removeItem(index)}
                              disabled={form.items.length === 1}
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 max-w-xs ml-auto pt-2">
                      <div className="flex justify-between w-full text-sm">
                        <span className="text-muted-foreground">Sous-total HT</span>
                        <span className="font-medium">{formatCurrency(subtotal, "XAF")}</span>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="applyTVA-form"
                            checked={form.applyTVA}
                            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, applyTVA: checked as boolean }))}
                          />
                          <Label htmlFor="applyTVA-form" className="text-sm cursor-pointer">
                            TVA ({(CAMEROON_TAX.TVA_RATE * 100).toFixed(2)}%)
                          </Label>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(tva, "XAF")}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between w-full">
                        <span className="font-bold text-sm">Total estimé</span>
                        <span className="font-bold text-blue-700">{formatCurrency(total, "XAF")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Notes (optionnel)</Label>
                      <Textarea
                        placeholder="Notes par défaut pour ce modèle..."
                        value={form.notes}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Conditions de paiement (optionnel)</Label>
                      <Textarea
                        placeholder="Ex: Paiement à 30 jours..."
                        value={form.paymentTerms}
                        onChange={(e) => setForm((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={closeForm} disabled={saving}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {editingId ? "Mettre à jour" : "Enregistrer le modèle"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates list */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-muted-foreground"
          >
            <LayoutTemplate className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun modèle de {activeTab === "INVOICE" ? "facture" : "devis"}</p>
            <p className="text-sm mt-1">Créez votre premier modèle pour gagner du temps</p>
            <Button className="mt-4" onClick={openCreateForm}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un modèle
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((template, index) => {
                const templateSubtotal = template.items.reduce(
                  (sum, item) => sum + item.quantity * item.unitPrice,
                  0
                );
                const templateTVA = template.applyTVA ? templateSubtotal * CAMEROON_TAX.TVA_RATE : 0;
                const templateTotal = templateSubtotal + templateTVA;

                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">{template.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(template.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              template.type === "INVOICE"
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400"
                            }
                          >
                            {template.type === "INVOICE" ? "Facture" : "Devis"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-3">
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ChevronDown className="w-3 h-3" />
                            {template.items.length} ligne{template.items.length > 1 ? "s" : ""}
                          </span>
                          {template.applyTVA && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">TVA incluse</span>
                          )}
                        </div>

                        {/* Items preview */}
                        <div className="space-y-1">
                          {template.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-muted-foreground">
                              <span className="truncate flex-1 mr-2">{item.description || "—"}</span>
                              <span className="shrink-0 font-medium text-foreground">
                                {formatCurrency(item.quantity * item.unitPrice, "XAF")}
                              </span>
                            </div>
                          ))}
                          {template.items.length > 3 && (
                            <p className="text-xs text-muted-foreground italic">
                              + {template.items.length - 3} ligne{template.items.length - 3 > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground font-medium">Total estimé</span>
                          <span className="font-bold text-sm text-blue-700 dark:text-blue-400">
                            {formatCurrency(templateTotal, "XAF")}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-auto pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditForm(template)}
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                            Modifier
                          </Button>
                          {confirmDeleteId === template.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Supprimer ?</span>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={deletingId === template.id}
                                onClick={() => handleDelete(template.id)}
                              >
                                {deletingId === template.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Oui"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setConfirmDeleteId(template.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
