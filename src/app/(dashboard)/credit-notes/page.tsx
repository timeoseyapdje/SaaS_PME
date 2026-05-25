"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Loader2,
  ReceiptText,
  CheckCircle2,
  Clock,
  Trash2,
  XCircle,
} from "lucide-react";

interface CreditNote {
  id: string;
  number: string;
  amount: number;
  reason: string | null;
  status: string;
  issuedAt: string;
  createdAt: string;
  client: { id: string; name: string } | null;
  invoice: { id: string; number: string } | null;
}

interface Client {
  id: string;
  name: string;
}

interface Invoice {
  id: string;
  number: string;
  total: number;
}

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " XAF";

export default function CreditNotesPage() {
  const { toast } = useToast();
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [formClientId, setFormClientId] = useState("");
  const [formInvoiceId, setFormInvoiceId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formReason, setFormReason] = useState("");

  const fetchCreditNotes = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/credit-notes");
      const data = await r.json();
      setCreditNotes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreditNotes();
    fetch("/api/clients").then((r) => r.json()).then((d) => setClients(Array.isArray(d) ? d : []));
    fetch("/api/invoices").then((r) => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : (d.invoices ?? []);
      setInvoices(list);
    });
  }, [fetchCreditNotes]);

  function openForm() {
    setFormClientId("");
    setFormInvoiceId("");
    setFormAmount("");
    setFormReason("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/credit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formClientId || undefined,
          invoiceId: formInvoiceId || undefined,
          amount: formAmount,
          reason: formReason || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Avoir créé", description: `Avoir ${data.number} créé avec succès` });
        setShowForm(false);
        fetchCreditNotes();
      } else {
        toast({ title: "Erreur", description: data.error || "Erreur", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApply(id: string) {
    const res = await fetch(`/api/credit-notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPLIED" }),
    });
    if (res.ok) {
      toast({ title: "Avoir appliqué" });
      fetchCreditNotes();
    }
  }

  async function handleDelete(id: string) {
    setConfirmDelete(null);
    const res = await fetch(`/api/credit-notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Avoir supprimé" });
      fetchCreditNotes();
    } else {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  }

  const totalAmount = creditNotes.reduce((s, n) => s + n.amount, 0);
  const applied = creditNotes.filter((n) => n.status === "APPLIED").length;
  const issued = creditNotes.filter((n) => n.status === "ISSUED").length;

  return (
    <div className="flex flex-col gap-6">
      <Header title="Avoirs" subtitle="Gérez vos notes de crédit et avoirs clients" />

      <div className="px-4 sm:px-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <ReceiptText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{creditNotes.length}</p>
                <p className="text-xs text-muted-foreground">Total avoirs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{applied}</p>
                <p className="text-xs text-muted-foreground">Appliqués</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{fmt(totalAmount)}</p>
                <p className="text-xs text-muted-foreground">Montant total · {issued} émis</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex justify-end">
          <Button onClick={openForm}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel avoir
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : creditNotes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ReceiptText className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">Aucun avoir</p>
                <p className="text-sm text-muted-foreground mb-4">Créez votre premier avoir pour un client.</p>
                <Button onClick={openForm} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel avoir
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Numéro</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Client</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Facture liée</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Motif</TableHead>
                    <TableHead className="text-right text-muted-foreground text-xs font-medium uppercase tracking-wide">Montant</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Statut</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Date</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditNotes.map((note) => (
                    <TableRow key={note.id} className="border-border hover:bg-muted/40 transition-colors group">
                      <TableCell>
                        <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {note.number}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {note.client?.name || "—"}
                      </TableCell>
                      <TableCell>
                        {note.invoice ? (
                          <span className="font-mono text-xs text-muted-foreground">{note.invoice.number}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                        {note.reason || "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {fmt(note.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            note.status === "APPLIED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs"
                          }
                        >
                          {note.status === "APPLIED" ? "Appliqué" : "Émis"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(note.issuedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {note.status === "ISSUED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              onClick={() => handleApply(note.id)}
                            >
                              Appliquer
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setConfirmDelete(note.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Create form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel avoir</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={formClientId} onValueChange={setFormClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Facture liée (optionnel)</Label>
              <Select value={formInvoiceId} onValueChange={(v) => {
                setFormInvoiceId(v);
                const inv = invoices.find((i) => i.id === v);
                if (inv) setFormAmount(String(inv.total));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucune facture liée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>{inv.number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Montant (XAF) *</Label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Motif</Label>
              <Input
                placeholder="Retour produit, erreur de facturation..."
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Créer l&apos;avoir
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-foreground">Supprimer cet avoir ?</p>
            <p className="text-xs text-muted-foreground">Cette action est irréversible.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
                <XCircle className="w-4 h-4 mr-1" />
                Annuler
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(confirmDelete)}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
