"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Trash2,
  Eye,
} from "lucide-react";
import { Quote, QuoteStatus } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
  CONVERTED: "Converti",
};

const STATUS_VARIANTS: Record<QuoteStatus, "secondary" | "default" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  SENT: "default",
  ACCEPTED: "default",
  REJECTED: "destructive",
  EXPIRED: "outline",
  CONVERTED: "default",
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  DRAFT: "text-muted-foreground",
  SENT: "text-blue-600 dark:text-blue-400",
  ACCEPTED: "text-emerald-600 dark:text-emerald-400",
  REJECTED: "text-red-600 dark:text-red-400",
  EXPIRED: "text-orange-600 dark:text-orange-400",
  CONVERTED: "text-purple-600 dark:text-purple-400",
};

export default function DevisPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/quotes?${params}`);
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchQuotes, 300);
    return () => clearTimeout(timeout);
  }, [fetchQuotes]);

  async function handleStatusChange(id: string, status: QuoteStatus) {
    const res = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchQuotes();
      toast({ title: "Statut mis à jour" });
    } else {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setConfirmDelete(null);
      fetchQuotes();
      toast({ title: "Devis supprimé" });
    } else {
      toast({ title: "Erreur", description: "Impossible de supprimer le devis", variant: "destructive" });
    }
  }

  async function handleConvert(id: string) {
    const res = await fetch(`/api/quotes/${id}/convert`, { method: "POST" });
    const data = await res.json();
    if (res.ok && data.invoice) {
      toast({ title: "Devis converti", description: `Facture ${data.invoice.number} créée` });
      router.push(`/invoices/${data.invoice.id}`);
    } else {
      toast({ title: "Erreur", description: data.error || "Impossible de convertir", variant: "destructive" });
    }
  }

  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === "DRAFT").length,
    sent: quotes.filter((q) => q.status === "SENT").length,
    accepted: quotes.filter((q) => q.status === "ACCEPTED").length,
    totalAmount: quotes.reduce((sum, q) => sum + q.total, 0),
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Devis" subtitle="Gérez vos devis et propositions commerciales" />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total devis</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Brouillons</p>
              <p className="text-2xl font-bold mt-1 text-muted-foreground">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Envoyés</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{stats.sent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Acceptés</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.accepted}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters + New button */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un devis..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="DRAFT">Brouillons</SelectItem>
                <SelectItem value="SENT">Envoyés</SelectItem>
                <SelectItem value="ACCEPTED">Acceptés</SelectItem>
                <SelectItem value="REJECTED">Refusés</SelectItem>
                <SelectItem value="EXPIRED">Expirés</SelectItem>
                <SelectItem value="CONVERTED">Convertis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/devis/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devis
            </Button>
          </Link>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Chargement...
              </div>
            ) : quotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                <FileText className="w-8 h-8" />
                <p className="text-sm">Aucun devis trouvé</p>
                <Link href="/devis/new">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Créer un devis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Numéro</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valide jusqu'au</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Montant TTC</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <Link href={`/devis/${quote.id}`} className="hover:text-primary transition-colors">
                            {quote.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {(quote.client as { name: string } | undefined)?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(quote.total, quote.currency)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-muted ${STATUS_COLORS[quote.status as QuoteStatus]}`}>
                            {STATUS_LABELS[quote.status as QuoteStatus]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/devis/${quote.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {quote.status === "DRAFT" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                title="Marquer comme envoyé"
                                onClick={() => handleStatusChange(quote.id, "SENT")}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {(quote.status === "SENT" || quote.status === "ACCEPTED") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-500 hover:text-emerald-700"
                                title="Convertir en facture"
                                onClick={() => handleConvert(quote.id)}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            )}
                            {quote.status !== "CONVERTED" && (
                              confirmDelete === quote.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleDelete(quote.id)}
                                  >
                                    Oui
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setConfirmDelete(null)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => setConfirmDelete(quote.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
