"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { Expense } from "@/types";
import { Trash2, RefreshCw, TrendingDown } from "lucide-react";

const categoryLabels: Record<string, string> = {
  SALAIRES: "Salaires",
  LOYER: "Loyer",
  FOURNITURES: "Fournitures",
  TRANSPORT: "Transport",
  COMMUNICATION: "Communication",
  MARKETING: "Marketing",
  TAXES: "Taxes",
  ASSURANCE: "Assurance",
  MAINTENANCE: "Maintenance",
  FORMATION: "Formation",
  SOUS_TRAITANCE: "Sous-traitance",
  AUTRES: "Autres",
};

const paymentMethodLabels: Record<string, string> = {
  VIREMENT: "Virement",
  ESPECES: "Espèces",
  CHEQUE: "Chèque",
  MTN_MONEY: "MTN Money",
  ORANGE_MONEY: "Orange Money",
  CARTE_BANCAIRE: "Carte",
};

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function ExpenseTable({
  expenses,
  onDelete,
  loading,
}: ExpenseTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <TrendingDown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-base font-medium text-gray-500">
          Aucune dépense enregistrée
        </p>
        <p className="text-sm mt-1">
          Cliquez sur &quot;Ajouter&quot; pour enregistrer une dépense
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Paiement</TableHead>
          <TableHead className="text-right">Montant</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="text-sm text-gray-500">
              {formatDate(expense.date)}
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center gap-2">
                {expense.description}
                {expense.isRecurring && (
                  <span title="Récurrent"><RefreshCw className="w-3 h-3 text-blue-400" /></span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[expense.category] || expense.category}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {expense.supplier?.name || "—"}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {paymentMethodLabels[expense.paymentMethod] ||
                expense.paymentMethod}
            </TableCell>
            <TableCell className="text-right text-sm font-semibold text-red-600">
              -{formatCurrency(expense.amount, expense.currency)}
            </TableCell>
            <TableCell>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-600"
                  onClick={() => onDelete(expense.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
