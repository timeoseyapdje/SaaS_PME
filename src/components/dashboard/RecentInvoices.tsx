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
import { Eye, ArrowRight, FileText } from "lucide-react";
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
      <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Factures récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted/60 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
        <CardTitle className="text-[15px] font-semibold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          Factures récentes
        </CardTitle>
        <Link
          href="/invoices"
        >
          <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold gap-1 group">
            Voir tout
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-[15px] font-medium text-foreground mb-1">Aucune facture</p>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">Vous n'avez pas encore créé de factures. Créez-en une pour commencer.</p>
            <Link href="/invoices/new">
              <Button size="sm" className="rounded-full shadow-md shadow-emerald-500/20 px-6">
                Créer une facture
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-medium text-muted-foreground text-[13px]">Numéro</TableHead>
                <TableHead className="font-medium text-muted-foreground text-[13px]">Client</TableHead>
                <TableHead className="font-medium text-muted-foreground text-[13px]">Échéance</TableHead>
                <TableHead className="text-right font-medium text-muted-foreground text-[13px]">Montant</TableHead>
                <TableHead className="font-medium text-muted-foreground text-[13px]">Statut</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-border/30 hover:bg-muted/30 transition-colors group cursor-pointer">
                  <TableCell className="font-medium text-sm text-muted-foreground">
                    {invoice.number}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {invoice.client?.name || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell className="text-right text-[15px] font-semibold text-foreground tracking-tight">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="scale-90 origin-left">
                      <InvoiceStatusBadge
                        status={invoice.status as InvoiceStatus}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100">
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
