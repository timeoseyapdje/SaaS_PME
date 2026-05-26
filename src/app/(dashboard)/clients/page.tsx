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
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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

interface CsvRow {
  [key: string]: string;
}

interface ImportResult {
  imported: number;
  errors: string[];
}

function parseCSV(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: CsvRow = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
}

function downloadTemplate() {
  const headers = "Nom,Email,Telephone,Adresse,Ville,Type,Notes";
  const example = "Acme Sarl,contact@acme.cm,+237600000000,Rue 123,Yaoundé,ENTREPRISE,Client régulier";
  const blob = new Blob([headers + "\n" + example], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele_clients.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<ClientWithCount | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteClient, setConfirmDeleteClient] = useState<string | null>(null);

  const [showImport, setShowImport] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

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
      else { const err = await response.json(); toast({ title: "Erreur", description: err.error || "Erreur", variant: "destructive" }); }
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    setConfirmDeleteClient(null);
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    fetchClients();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setCsvRows(rows);
      setImportResult(null);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (csvRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: csvRows }),
      });
      const data: ImportResult = await res.json();
      setImportResult(data);
      if (data.imported > 0) {
        fetchClients();
        toast({ title: `${data.imported} client(s) importé(s)` });
      }
    } finally {
      setImporting(false);
    }
  }

  function closeImport() {
    setShowImport(false);
    setCsvRows([]);
    setImportResult(null);
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
          <Button variant="outline" onClick={() => { setShowImport(true); setCsvRows([]); setImportResult(null); }}>
            <Upload className="w-4 h-4 mr-2" />
            Importer CSV
          </Button>
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
                              onClick={() => setConfirmDeleteClient(client.id)}
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

      {confirmDeleteClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteClient(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-foreground">Supprimer ce client ?</p>
            <p className="text-xs text-muted-foreground">Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteClient(null)}>Annuler</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(confirmDeleteClient)}>Supprimer</Button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Dialog */}
      <Dialog open={showImport} onOpenChange={(open) => { if (!open) closeImport(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importer des clients depuis un CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger le modèle CSV
              </Button>
              <span className="text-xs text-muted-foreground">Colonnes : Nom, Email, Telephone, Adresse, Ville, Type, Notes</span>
            </div>
            <div>
              <Label className="mb-2 block">Sélectionner un fichier CSV</Label>
              <input
                type="file"
                accept=".csv"
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
                onChange={handleFileChange}
              />
            </div>

            {csvRows.length > 0 && !importResult && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{csvRows.length} ligne(s) détectée(s) — Aperçu (5 premières)</p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        {Object.keys(csvRows[0]).map((h) => (
                          <TableHead key={h} className="text-xs font-semibold">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvRows.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          {Object.values(row).map((v, j) => (
                            <TableCell key={j} className="text-xs text-muted-foreground truncate max-w-[120px]">{v || "—"}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {importResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {importResult.imported} client(s) importé(s) avec succès
                </div>
                {importResult.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      {importResult.errors.length} erreur(s)
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
                      {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeImport}>Fermer</Button>
              {csvRows.length > 0 && !importResult && (
                <Button onClick={handleImport} disabled={importing}>
                  {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Importer {csvRows.length} client(s)
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
