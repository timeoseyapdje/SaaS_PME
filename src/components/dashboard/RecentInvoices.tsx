"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { InvoiceStatus } from "@/types";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentInvoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  dueDate: string;
  total: number;
  currency: string;
  client?: { name: string } | null;
}

interface RecentInvoicesProps {
  invoices: RecentInvoice[];
  loading?: boolean;
}

export function RecentInvoices({ invoices, loading }: RecentInvoicesProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Factures récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Factures récentes
        </CardTitle>
        <Link
          href="/invoices"
          className="text-sm text-blue-600 hover:underline"
        >
          Voir tout
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Aucune facture pour le moment</p>
            <Link href="/invoices/new">
              <Button variant="outline" size="sm" className="mt-2">
                Créer une facture
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-xs">
                    {invoice.number}
                  </TableCell>
                  <TableCell className="text-sm">
                    {invoice.client?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge
                      status={invoice.status as InvoiceStatus}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
