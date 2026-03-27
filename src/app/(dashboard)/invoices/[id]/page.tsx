"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { Invoice, InvoiceStatus } from "@/types";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Trash2,
  Printer,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function InvoiceDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/invoices/${params.id}`)
        .then((r) => r.json())
        .then((data) => {
          setInvoice(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  async function updateStatus(status: InvoiceStatus) {
    setUpdating(true);
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updated = await response.json();
        setInvoice(updated);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Voulez-vous vraiment supprimer cette facture ?")) return;
    await fetch(`/api/invoices/${params.id}`, { method: "DELETE" });
    toast({ title: "Supprimé", description: "Facture supprimée avec succès", variant: "success" as never });
    router.push("/invoices");
  }

  if (loading) {
    return (
      <div>
        <Header title="Détail de la facture" />
        <div className="p-6 flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div>
        <Header title="Facture introuvable" />
        <div className="p-6 text-center">
          <p className="text-gray-500">Cette facture n&apos;existe pas.</p>
          <Link href="/invoices">
            <Button variant="outline" className="mt-4">
              Retour aux factures
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`Facture ${invoice.number}`}
        subtitle={invoice.client?.name}
      />
      <div className="p-6 space-y-6">
        {/* Action bar */}
        <div className="flex items-center justify-between">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            {invoice.status === "DRAFT" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus("SENT")}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Marquer comme envoyée
              </Button>
            )}
            {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => updateStatus("PAID")}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Marquer comme payée
              </Button>
            )}
            {invoice.status !== "PAID" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={updating}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
        </div>

        {/* Invoice preview */}
        <Card className="print:shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">FACTURE</h2>
                <p className="text-lg font-mono text-blue-600 mt-1">
                  {invoice.number}
                </p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client & Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Facturé à
                </p>
                <p className="font-semibold text-gray-900">
                  {invoice.client?.name}
                </p>
                {invoice.client?.email && (
                  <p className="text-sm text-gray-500">{invoice.client.email}</p>
                )}
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-gray-500">Date d&apos;émission:</span>
                    <span className="font-medium">
                      {formatDate(invoice.issueDate)}
                    </span>
                  </div>
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-gray-500">Date d&apos;échéance:</span>
                    <span
                      className={`font-medium ${
                        invoice.status === "OVERDUE" ? "text-red-600" : ""
                      }`}
                    >
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>
                  {invoice.paidAt && (
                    <div className="flex justify-end gap-4 text-sm">
                      <span className="text-gray-500">Date de paiement:</span>
                      <span className="font-medium text-green-600">
                        {formatDate(invoice.paidAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Line items */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 font-medium text-gray-500">
                      Description
                    </th>
                    <th className="text-center pb-2 font-medium text-gray-500 w-20">
                      Qté
                    </th>
                    <th className="text-right pb-2 font-medium text-gray-500 w-32">
                      P.U. HT
                    </th>
                    <th className="text-right pb-2 font-medium text-gray-500 w-32">
                      Total HT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-gray-50">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(item.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total HT</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                {invoice.applyTVA && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      TVA (19,25%)
                    </span>
                    <span>
                      {formatCurrency(invoice.tvaAmount, invoice.currency)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total TTC</span>
                  <span className="text-blue-700">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(invoice.notes || invoice.terms) && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {invoice.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Conditions de paiement
                    </p>
                    <p className="text-sm text-gray-600">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
