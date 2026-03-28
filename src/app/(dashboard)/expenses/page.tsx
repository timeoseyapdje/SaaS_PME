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
import { Plus, TrendingDown, TrendingUp, Trash2, Download } from "lucide-react";
import { exportToExcel, exportToCSV, formatExpensesForExport, formatRevenuesForExport } from "@/lib/export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

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
            className="flex h-10 w-full rounded-md border border-border/60 bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
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
            className="flex h-10 w-full rounded-md border border-border/60 bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description *</label>
        <input
          className="flex h-10 w-full rounded-md border border-border/60 bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
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
            className="flex h-10 w-full rounded-md border border-border/60 bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mode de paiement</label>
          <select
            className="flex h-10 w-full rounded-md border border-border/60 bg-zinc-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingRevenues, setLoadingRevenues] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);

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
    <div>
      <Header
        title="Dépenses & Recettes"
        subtitle="Gérez vos flux financiers hors facturation"
      />
      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total dépenses</p>
                <p className="text-xl font-bold text-rose-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total recettes directes</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(totalRevenues)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-zinc-400">Solde net</p>
              <p
                className={`text-xl font-bold ${
                  totalRevenues - totalExpenses >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {formatCurrency(totalRevenues - totalExpenses)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, delay: 0.1 }}
        >
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
                          className="h-12 bg-zinc-800/50 animate-pulse rounded"
                        />
                      ))}
                    </div>
                  ) : revenues.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
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
                            <TableCell className="text-sm text-zinc-400">
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
                            <TableCell className="text-sm text-zinc-400">
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
        </motion.div>
      </div>

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
