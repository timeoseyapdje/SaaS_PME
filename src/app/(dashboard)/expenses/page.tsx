"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, TrendingDown, TrendingUp, Trash2 } from "lucide-react";

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
            className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background"
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
            className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description *</label>
        <input
          className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background"
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
            className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mode de paiement</label>
          <select
            className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background"
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
    toast({ title: "Supprimé", description: "Dépense supprimée", variant: "success" as never });
  }

  async function handleDeleteRevenue(id: string) {
    if (!confirm("Supprimer cette recette ?")) return;
    await fetch(`/api/revenues?id=${id}`, { method: "DELETE" });
    fetchRevenues();
    toast({ title: "Supprimé", description: "Recette supprimée", variant: "success" as never });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total dépenses</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total recettes directes</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totalRevenues)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Solde net</p>
              <p
                className={`text-xl font-bold ${
                  totalRevenues - totalExpenses >= 0
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(totalRevenues - totalExpenses)}
              </p>
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
                <Button onClick={() => setShowExpenseForm(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
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
                <Button onClick={() => setShowRevenueForm(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loadingRevenues ? (
                  <div className="space-y-2 p-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-100 animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : revenues.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
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
                          <TableCell className="text-sm text-gray-500">
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
                          <TableCell className="text-sm text-gray-500">
                            {PAYMENT_METHOD_LABELS[rev.paymentMethod] ||
                              rev.paymentMethod}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold text-green-600">
                            +{formatCurrency(rev.amount, rev.currency)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600"
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
