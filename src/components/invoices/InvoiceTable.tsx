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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { Invoice, InvoiceStatus } from "@/types";
import Link from "next/link";
import { Eye, MoreHorizontal, CheckCircle, Send, Trash2, FileText } from "lucide-react";

interface InvoiceTableProps {
  invoices: Invoice[];
  onStatusChange?: (id: string, status: InvoiceStatus) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function InvoiceTable({
  invoices,
  onStatusChange,
  onDelete,
  loading,
}: InvoiceTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-base font-medium text-gray-500">
          Aucune facture trouvée
        </p>
        <p className="text-sm mt-1">
          Commencez par créer votre première facture
        </p>
        <Link href="/invoices/new">
          <Button className="mt-4" size="sm">
            Créer une facture
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Numéro</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Date d&apos;émission</TableHead>
          <TableHead>Échéance</TableHead>
          <TableHead className="text-right">Montant TTC</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium text-sm">
              <Link
                href={`/invoices/${invoice.id}`}
                className="hover:text-blue-600 hover:underline"
              >
                {invoice.number}
              </Link>
            </TableCell>
            <TableCell className="text-sm">
              {invoice.client?.name || "—"}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {formatDate(invoice.issueDate)}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {formatDate(invoice.dueDate)}
            </TableCell>
            <TableCell className="text-right text-sm font-semibold">
              {formatCurrency(invoice.total, invoice.currency)}
            </TableCell>
            <TableCell>
              <InvoiceStatusBadge status={invoice.status} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      Voir détails
                    </Link>
                  </DropdownMenuItem>
                  {invoice.status === "DRAFT" && onStatusChange && (
                    <DropdownMenuItem
                      onClick={() => onStatusChange(invoice.id, "SENT")}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Marquer comme envoyée
                    </DropdownMenuItem>
                  )}
                  {(invoice.status === "SENT" ||
                    invoice.status === "OVERDUE") &&
                    onStatusChange && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange(invoice.id, "PAID")}
                        className="flex items-center gap-2 cursor-pointer text-green-600"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marquer comme payée
                      </DropdownMenuItem>
                    )}
                  {invoice.status !== "PAID" && onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(invoice.id)}
                        className="flex items-center gap-2 cursor-pointer text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
