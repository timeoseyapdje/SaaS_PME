"use client";

import { useEffect, useState } from "react";
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
  FileDown,
  MessageCircle,
  Bell,
  BellOff,
  XCircle,
  Mail,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { exportInvoicePDF } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

function buildWhatsAppUrl(invoice: Invoice): string {
  const client = invoice.client;
  const message = encodeURIComponent(
    `Bonjour ${client?.name || ""},\n\nVoici votre facture *${invoice.number}* d'un montant de ${formatCurrency(invoice.total, invoice.currency)}, échéance le ${new Date(invoice.dueDate).toLocaleDateString("fr-FR")}.\n\nMerci de votre confiance.`
  );
  const phone = client?.phone?.replace(/\D/g, "");
  if (phone) {
    const formatted = phone.startsWith("237") ? phone : `237${phone}`;
    return `https://wa.me/${formatted}?text=${message}`;
  }
  return `https://wa.me/?text=${message}`;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);

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
        toast({ title: "Statut mis à jour" });
      } else {
        toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleSendReminder() {
    setUpdating(true);
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderSent: true }),
      });
      if (response.ok) {
        const updated = await response.json();
        setInvoice(updated);
        toast({ title: "Rappel enregistré", description: "Le rappel a été marqué comme envoyé" });
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleSendEmail() {
    setEmailSending(true);
    try {
      const res = await fetch("/api/email/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: params.id, recipientEmail: emailInput || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Email envoyé", description: data.message });
        setEmailInput(null);
        const updated = await fetch(`/api/invoices/${params.id}`).then((r) => r.json());
        setInvoice(updated);
      } else {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } finally {
      setEmailSending(false);
    }
  }

  async function handleDuplicate() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/invoices/${params.id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Facture dupliquée", description: `Brouillon ${data.invoice.number} créé` });
        router.push(`/invoices/${data.invoice.id}`);
      } else {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/invoices/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Facture supprimée" });
        router.push("/invoices");
      } else {
        toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
      }
    } finally {
      setUpdating(false);
      setConfirmDelete(false);
    }
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
          <p className="text-muted-foreground">Cette facture n&apos;existe pas.</p>
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
      <Header title={`Facture ${invoice.number}`} subtitle={invoice.client?.name} />
      <div className="flex flex-col gap-5">
        {/* Action bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportInvoicePDF({
                number: invoice.number,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                status: invoice.status,
                currency: invoice.currency,
                subtotal: invoice.subtotal,
                tvaAmount: invoice.tvaAmount,
                total: invoice.total,
                applyTVA: invoice.applyTVA,
                notes: invoice.notes,
                terms: invoice.terms,
                client: invoice.client,
                items: invoice.items,
                company: (invoice as unknown as { company?: { name: string; email?: string | null; phone?: string | null; city?: string | null; taxId?: string | null } | null }).company,
              })}
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-300 hover:bg-green-50"
              onClick={() => window.open(buildWhatsAppUrl(invoice), "_blank")}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            {emailInput === null ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmailInput(invoice.client?.email || "")}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="email"
                  className="border border-border rounded-md px-2 py-1 text-sm w-44 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="email@client.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  autoFocus
                />
                <Button size="sm" disabled={emailSending} onClick={handleSendEmail}>
                  {emailSending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Envoyer"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEmailInput(null)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" disabled={updating} onClick={handleDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Dupliquer
            </Button>
            {invoice.status === "DRAFT" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus("SENT")} disabled={updating}>
                {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Marquer envoyée
              </Button>
            )}
            {invoice.status === "OVERDUE" && (
              <Button
                size="sm"
                variant="outline"
                className={invoice.reminderSent ? "text-muted-foreground" : "text-orange-600 border-orange-300 hover:bg-orange-50"}
                onClick={handleSendReminder}
                disabled={updating || invoice.reminderSent}
                title={invoice.reminderSent ? "Rappel déjà envoyé" : "Marquer le rappel comme envoyé"}
              >
                {invoice.reminderSent ? <BellOff className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                {invoice.reminderSent ? "Rappel envoyé" : "Envoyer rappel"}
              </Button>
            )}
            {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => updateStatus("PAID")}
                disabled={updating}
              >
                {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Marquer payée
              </Button>
            )}
            {invoice.status !== "PAID" && (
              confirmDelete ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Supprimer ?</span>
                  <Button size="sm" variant="destructive" disabled={updating} onClick={handleDelete}>
                    Oui
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)} disabled={updating}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )
            )}
          </div>
        </div>

        {/* Invoice preview */}
        <Card className="print:shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">FACTURE</h2>
                <p className="text-lg font-mono text-blue-600 dark:text-blue-400 mt-1">
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Facturé à
                </p>
                <p className="font-semibold text-foreground">{invoice.client?.name}</p>
                {invoice.client?.email && (
                  <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                )}
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-muted-foreground">Date d&apos;émission:</span>
                    <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-muted-foreground">Date d&apos;échéance:</span>
                    <span className={`font-medium ${invoice.status === "OVERDUE" ? "text-rose-600" : ""}`}>
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>
                  {invoice.paidAt && (
                    <div className="flex justify-end gap-4 text-sm">
                      <span className="text-muted-foreground">Date de paiement:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatDate(invoice.paidAt)}
                      </span>
                    </div>
                  )}
                  {invoice.reminderSent && invoice.reminderDate && (
                    <div className="flex justify-end gap-4 text-sm">
                      <span className="text-muted-foreground">Rappel envoyé:</span>
                      <span className="font-medium text-orange-600">
                        {formatDate(invoice.reminderDate)}
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
                    <th className="text-left pb-2 font-medium text-muted-foreground">Description</th>
                    <th className="text-center pb-2 font-medium text-muted-foreground w-20">Qté</th>
                    <th className="text-right pb-2 font-medium text-muted-foreground w-32">P.U. HT</th>
                    <th className="text-right pb-2 font-medium text-muted-foreground w-32">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-border/50">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.total, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                {invoice.applyTVA && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TVA (19,25%)</span>
                    <span>{formatCurrency(invoice.tvaAmount, invoice.currency)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total TTC</span>
                  <span className="text-blue-600 dark:text-blue-400">
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
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Conditions de paiement</p>
                    <p className="text-sm text-muted-foreground">{invoice.terms}</p>
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
