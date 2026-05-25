"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { Expense } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, TrendingDown, TrendingUp, Trash2, Download, Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { exportToExcel, exportToCSV, formatExpensesForExport, formatRevenuesForExport } from "@/lib/export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Revenue {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  isRecurring: boolean;
}

const REVENUE_CATEGORIES: Record<string, string> = {
  VENTES_PRODUITS: "Ventes produits",
  PRESTATIONS_SERVICES: "Prestations services",
  INTERETS: "Intérêts",
  SUBVENTIONS: "Subventions",
  AUTRES: "Autres",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  VIREMENT: "Virement",
  ESPECES: "Espèces",
  CHEQUE: "Chèque",
  MTN_MONEY: "MTN Money",
  ORANGE_MONEY: "Orange Money",
  CARTE_BANCAIRE: "Carte",
};

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

function downloadExpenseTemplate() {
  const headers = "Description,Montant,Date,Categorie,ModePaiement,Notes";
  const example = "Loyer bureau,150000,2026-01-01,LOYER,VIREMENT,";
  const blob = new Blob([headers + "\n" + example], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele_depenses.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function RevenueForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("PRESTATIONS_SERVICES");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("VIREMENT");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/revenues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description, amount, date, paymentMethod }),
      });
      if (response.ok) onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Catégorie *</label>
          <select
            className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {Object.entries(REVENUE_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Date *</label>
          <input
            type="date"
            className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description *</label>
        <input
          className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
          placeholder="Description de la recette"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Montant (FCFA) *</label>
          <input
            type="number"
            min="0"
            className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mode de paiement</label>
          <select
            className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingRevenues, setLoadingRevenues] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);

  const [showImport, setShowImport] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const r = await fetch("/api/expenses");
      const data = await r.json();
      setExpenses(Array.isArray(data) ? data : []);
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  const fetchRevenues = useCallback(async () => {
    setLoadingRevenues(true);
    try {
      const r = await fetch("/api/revenues");
      const data = await r.json();
      setRevenues(Array.isArray(data) ? data : []);
    } finally {
      setLoadingRevenues(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchRevenues();
  }, [fetchExpenses, fetchRevenues]);

  async function handleDeleteExpense(id: string) {
    if (!confirm("Supprimer cette dépense ?")) return;
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    fetchExpenses();
  }

  async function handleDeleteRevenue(id: string) {
    if (!confirm("Supprimer cette recette ?")) return;
    await fetch(`/api/revenues?id=${id}`, { method: "DELETE" });
    fetchRevenues();
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenues = revenues.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <Header
        title="Dépenses & Recettes"
        subtitle="Gérez vos flux financiers hors facturation"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="h-[88px] border-border bg-card shadow-sm">
          <CardContent className="p-3.5 h-full flex flex-col justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">DÉPENSES</p>
            <p className="text-[22px] font-bold text-rose-500 leading-none">{formatCurrency(totalExpenses)}</p>
            <p className="text-[10px] text-muted-foreground">{expenses.length} enregistrement{expenses.length > 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        <Card className="h-[88px] border-border bg-card shadow-sm">
          <CardContent className="p-3.5 h-full flex flex-col justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">RECETTES DIRECTES</p>
            <p className="text-[22px] font-bold text-emerald-500 leading-none">{formatCurrency(totalRevenues)}</p>
            <p className="text-[10px] text-muted-foreground">{revenues.length} enregistrement{revenues.length > 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        <Card className="h-[88px] border-border bg-card shadow-sm">
          <CardContent className="p-3.5 h-full flex flex-col justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">SOLDE NET</p>
            <p className={`text-[22px] font-bold leading-none ${totalRevenues - totalExpenses >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {formatCurrency(totalRevenues - totalExpenses)}
            </p>
            <p className="text-[10px] text-muted-foreground">{totalRevenues - totalExpenses >= 0 ? "Positif" : "Déficitaire"}</p>
          </CardContent>
        </Card>
      </div>

        <Tabs defaultValue="expenses">
            <TabsList>
              <TabsTrigger value="expenses">
                Dépenses ({expenses.length})
              </TabsTrigger>
              <TabsTrigger value="revenues">
                Recettes ({revenues.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Liste des dépenses</CardTitle>
                  <div className="flex items-center gap-2">
                    {expenses.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Exporter
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => exportToExcel(formatExpensesForExport(expenses), "Depenses", "Dépenses")}>
                            Excel (.xlsx)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportToCSV(formatExpensesForExport(expenses), "Depenses")}>
                            CSV
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <Button onClick={() => setShowExpenseForm(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ExpenseTable
                    expenses={expenses}
                    onDelete={handleDeleteExpense}
                    loading={loadingExpenses}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenues">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    Liste des recettes directes
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {revenues.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Exporter
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => exportToExcel(formatRevenuesForExport(revenues), "Recettes", "Recettes")}>
                            Excel (.xlsx)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportToCSV(formatRevenuesForExport(revenues), "Recettes")}>
                            CSV
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <Button onClick={() => setShowRevenueForm(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingRevenues ? (
                    <div className="space-y-2 p-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-12 bg-muted/50 animate-pulse rounded-lg"
                        />
                      ))}
                    </div>
                  ) : revenues.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm">Aucune recette enregistrée</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Paiement</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenues.map((rev) => (
                          <TableRow key={rev.id}>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(rev.date)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {rev.description}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {REVENUE_CATEGORIES[rev.category] || rev.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {PAYMENT_METHOD_LABELS[rev.paymentMethod] ||
                                rev.paymentMethod}
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold text-emerald-500">
                              +{formatCurrency(rev.amount, rev.currency)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-400 hover:text-rose-500"
                                onClick={() => handleDeleteRevenue(rev.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

      {/* Expense form dialog */}
      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle dépense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            onSuccess={() => {
              setShowExpenseForm(false);
              fetchExpenses();
            }}
            onCancel={() => setShowExpenseForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Revenue form dialog */}
      <Dialog open={showRevenueForm} onOpenChange={setShowRevenueForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle recette</DialogTitle>
          </DialogHeader>
          <RevenueForm
            onSuccess={() => {
              setShowRevenueForm(false);
              fetchRevenues();
            }}
            onCancel={() => setShowRevenueForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
