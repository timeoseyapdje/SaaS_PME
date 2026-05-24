"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Supplier, ClientType } from "@/types";
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeLabels: Record<ClientType, string> = {
  PARTICULIER: "Particulier",
  ENTREPRISE: "Entreprise",
  ONG: "ONG",
  ADMINISTRATION: "Administration",
};

const typeBadgeColors: Record<ClientType, string> = {
  PARTICULIER: "bg-muted text-muted-foreground",
  ENTREPRISE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ONG: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  ADMINISTRATION: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

interface SupplierWithCount extends Supplier {
  _count?: { expenses: number };
}

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteSupplier, setConfirmDeleteSupplier] = useState<string | null>(null);
  const [editSupplier, setEditSupplier] = useState<SupplierWithCount | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formTaxId, setFormTaxId] = useState("");
  const [formType, setFormType] = useState<ClientType>("ENTREPRISE");
  const [formNotes, setFormNotes] = useState("");

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const r = await fetch(`/api/suppliers?${params}`);
      const data = await r.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchSuppliers, 300);
    return () => clearTimeout(timeout);
  }, [fetchSuppliers]);

  function openAddForm() {
    setEditSupplier(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormCity("");
    setFormTaxId("");
    setFormType("ENTREPRISE");
    setFormNotes("");
    setShowForm(true);
  }

  function openEditForm(supplier: SupplierWithCount) {
    setEditSupplier(supplier);
    setFormName(supplier.name);
    setFormEmail(supplier.email || "");
    setFormPhone(supplier.phone || "");
    setFormAddress(supplier.address || "");
    setFormCity(supplier.city || "");
    setFormTaxId(supplier.taxId || "");
    setFormType(supplier.type);
    setFormNotes(supplier.notes || "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        id: editSupplier?.id,
        name: formName,
        email: formEmail,
        phone: formPhone,
        address: formAddress,
        city: formCity,
        taxId: formTaxId,
        type: formType,
        notes: formNotes,
      };

      const response = await fetch("/api/suppliers", {
        method: editSupplier ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowForm(false);
        fetchSuppliers();
      } else {
        const err = await response.json();
        toast({ title: "Erreur", description: err.error || "Erreur", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setConfirmDeleteSupplier(null);
    await fetch(`/api/suppliers?id=${id}`, { method: "DELETE" });
    fetchSuppliers();
  }

  return (
    <div>
      <Header
        title="Fournisseurs"
        subtitle="Gérez vos relations fournisseurs"
      />
      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un fournisseur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau fournisseur
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted/50 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-base font-medium text-muted-foreground">
                  Aucun fournisseur trouvé
                </p>
                <Button
                  onClick={openAddForm}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Ajouter votre premier fournisseur
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>NIU</TableHead>
                    <TableHead className="text-center">Dépenses</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${typeBadgeColors[supplier.type]}`}
                        >
                          {typeLabels[supplier.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          {supplier.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {supplier.city || "—"}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {supplier.taxId || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">
                          {supplier._count?.expenses || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditForm(supplier)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600"
                            onClick={() => setConfirmDeleteSupplier(supplier.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Supplier form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editSupplier
                ? "Modifier le fournisseur"
                : "Nouveau fournisseur"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nom *</Label>
                <Input
                  placeholder="Nom du fournisseur"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formType}
                  onValueChange={(v) => setFormType(v as ClientType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>NIU</Label>
                <Input
                  placeholder="Numéro d'identification"
                  value={formTaxId}
                  onChange={(e) => setFormTaxId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="contact@fournisseur.cm"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  placeholder="+237 6xx xxx xxx"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  placeholder="Adresse"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input
                  placeholder="Douala"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Notes supplémentaires..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {confirmDeleteSupplier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteSupplier(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-foreground">Supprimer ce fournisseur ?</p>
            <p className="text-xs text-muted-foreground">Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteSupplier(null)}>Annuler</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(confirmDeleteSupplier)}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
