"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Client, ClientType } from "@/types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  Loader2,
  ShoppingCart,
  FileText,
  Link2,
  MoreHorizontal,
  TrendingUp,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const typeLabels: Record<ClientType, string> = {
  PARTICULIER: "Particulier",
  ENTREPRISE: "Entreprise",
  ONG: "ONG",
  ADMINISTRATION: "Administration",
};

const typeBadgeColors: Record<ClientType, string> = {
  PARTICULIER: "bg-muted text-muted-foreground border border-border",
  ENTREPRISE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  ONG: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  ADMINISTRATION: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
};

interface ClientWithCount extends Client {
  _count?: { invoices: number; orders?: number };
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<ClientWithCount | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formTaxId, setFormTaxId] = useState("");
  const [formType, setFormType] = useState<ClientType>("ENTREPRISE");
  const [formNotes, setFormNotes] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const r = await fetch(`/api/clients?${params}`);
      const data = await r.json();
      setClients(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchClients, 300);
    return () => clearTimeout(timeout);
  }, [fetchClients]);

  function openAddForm() {
    setEditClient(null);
    setFormName(""); setFormEmail(""); setFormPhone("");
    setFormAddress(""); setFormCity(""); setFormTaxId("");
    setFormType("ENTREPRISE"); setFormNotes("");
    setShowForm(true);
  }

  function openEditForm(client: ClientWithCount) {
    setEditClient(client);
    setFormName(client.name); setFormEmail(client.email || "");
    setFormPhone(client.phone || ""); setFormAddress(client.address || "");
    setFormCity(client.city || ""); setFormTaxId(client.taxId || "");
    setFormType(client.type); setFormNotes(client.notes || "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        id: editClient?.id, name: formName, email: formEmail,
        phone: formPhone, address: formAddress, city: formCity,
        taxId: formTaxId, type: formType, notes: formNotes,
      };
      const response = await fetch("/api/clients", {
        method: editClient ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) { setShowForm(false); fetchClients(); }
      else { const err = await response.json(); alert(err.error || "Erreur"); }
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce client ?")) return;
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    fetchClients();
  }

  // KPI stats
  const totalClients = clients.length;
  const entreprises = clients.filter(c => c.type === "ENTREPRISE").length;
  const totalInvoices = clients.reduce((s, c) => s + (c._count?.invoices || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <Header title="Clients" subtitle="Gérez votre portefeuille clients" />

      <div className="px-4 sm:px-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalClients}</p>
                <p className="text-xs text-muted-foreground">Clients au total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{entreprises}</p>
                <p className="text-xs text-muted-foreground">Entreprises</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalInvoices}</p>
                <p className="text-xs text-muted-foreground">Factures émises</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">Aucun client trouvé</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {search ? "Essayez un autre terme de recherche." : "Ajoutez votre premier client pour commencer."}
                </p>
                {!search && (
                  <Button onClick={openAddForm} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un client
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Nom</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Type</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Contact</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Ville</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">NIU</TableHead>
                    <TableHead className="text-center text-muted-foreground text-xs font-medium uppercase tracking-wide">Factures</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="border-border hover:bg-muted/40 transition-colors group">
                      <TableCell>
                        <p className="font-medium text-foreground">{client.name}</p>
                        {client.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{client.notes}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs border-0 font-medium ${typeBadgeColors[client.type]}`}
                        >
                          {typeLabels[client.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate max-w-[160px]">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {client.city || "—"}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {client.taxId || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold text-foreground">
                          {client._count?.invoices || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openEditForm(client)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => router.push(`/invoices/new?clientId=${client.id}`)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Nouvelle facture
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/orders/new?clientId=${client.id}`)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Nouvelle commande
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/payment-links/new?clientId=${client.id}`)}
                            >
                              <Link2 className="w-4 h-4 mr-2" />
                              Lien de paiement
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(client.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editClient ? "Modifier le client" : "Nouveau client"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nom *</Label>
                <Input
                  placeholder="Nom de l'entreprise ou du particulier"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as ClientType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>NIU</Label>
                <Input
                  placeholder="Numéro d'identification unique"
                  value={formTaxId}
                  onChange={(e) => setFormTaxId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="contact@client.cm"
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
                  placeholder="Yaoundé"
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
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
