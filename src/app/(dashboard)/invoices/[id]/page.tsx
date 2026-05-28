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
import { Invoice, InvoicePayment, InvoiceStatus } from "@/types";
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
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { exportInvoicePDF } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  VIREMENT: "Virement",
  CHEQUE: "Chèque",
  MTN_MONEY: "MTN Money",
  ORANGE_MONEY: "Orange Money",
  CARTE_BANCAIRE: "Carte bancaire",
  NOTCHPAY: "getMIpay",
  GETMIPAY: "getMIpay",
};

const RECURRENCE_LABELS: Record<string, string> = {
  MONTHLY: "Mensuelle",
  QUARTERLY: "Trimestrielle",
  YEARLY: "Annuelle",
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " XAF";
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

  // Payment section state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ESPECES");
  const [paymentDate, setPaymentDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [confirmDeletePayment, setConfirmDeletePayment] = useState<string | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);

  // Recurring section state
  const [generatingNext, setGeneratingNext] = useState(false);

  // Save as template state
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Credit note state
  const [showCreditNoteForm, setShowCreditNoteForm] = useState(false);
  const [creditNoteAmount, setCreditNoteAmount] = useState("");
  const [creditNoteReason, setCreditNoteReason] = useState("");
  const [creditNoteSubmitting, setCreditNoteSubmitting] = useState(false);

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

  async function handleAddPayment() {
    const amount = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      toast({ title: "Montant invalide", description: "Le montant doit être supérieur à 0", variant: "destructive" });
      return;
    }

    setPaymentSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${params.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: paymentMethod,
          paidAt: paymentDate,
          reference: paymentReference || undefined,
          note: paymentNote || undefined,
        }),
      });

      if (res.ok) {
        toast({ title: "Paiement enregistré" });
        setShowPaymentForm(false);
        setPaymentAmount("");
        setPaymentMethod("ESPECES");
        setPaymentDate(new Date().toISOString().split("T")[0]);
        setPaymentReference("");
        setPaymentNote("");
        const updated = await fetch(`/api/invoices/${params.id}`).then((r) => r.json());
        setInvoice(updated);
      } else {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } finally {
      setPaymentSubmitting(false);
    }
  }

  async function handleDeletePayment(paymentId: string) {
    setDeletingPayment(true);
    try {
      const res = await fetch(
        `/api/invoices/${params.id}/payments?paymentId=${paymentId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast({ title: "Paiement supprimé" });
        setConfirmDeletePayment(null);
        const updated = await fetch(`/api/invoices/${params.id}`).then((r) => r.json());
        setInvoice(updated);
      } else {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } finally {
      setDeletingPayment(false);
    }
  }

  async function handleGenerateNextInvoice() {
    if (!invoice) return;
    setGeneratingNext(true);
    try {
      const dupRes = await fetch(`/api/invoices/${params.id}/duplicate`, { method: "POST" });
      if (!dupRes.ok) {
        const err = await dupRes.json();
        toast({ title: "Erreur", description: err.error, variant: "destructive" });
        return;
      }
      const { invoice: newInvoice } = await dupRes.json();

      const nextDueDate = invoice.nextDueDate
        ? new Date(invoice.nextDueDate)
        : (() => {
            const d = new Date();
            if (invoice.recurrenceInterval === "MONTHLY") d.setMonth(d.getMonth() + 1);
            else if (invoice.recurrenceInterval === "QUARTERLY") d.setMonth(d.getMonth() + 3);
            else if (invoice.recurrenceInterval === "YEARLY") d.setFullYear(d.getFullYear() + 1);
            else d.setDate(d.getDate() + 30);
            return d;
          })();

      const patchRes = await fetch(`/api/invoices/${newInvoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueDate: nextDueDate.toISOString().split("T")[0],
        }),
      });

      if (patchRes.ok) {
        toast({
          title: "Facture récurrente générée",
          description: `Brouillon ${newInvoice.number} créé`,
        });
        router.push(`/invoices/${newInvoice.id}`);
      } else {
        toast({ title: "Facture créée", description: `Brouillon ${newInvoice.number} — impossible de mettre à jour la date` });
        router.push(`/invoices/${newInvoice.id}`);
      }
    } finally {
      setGeneratingNext(false);
    }
  }

  async function handleCreateCreditNote() {
    if (!invoice) return;
    const amount = parseFloat(creditNoteAmount);
    if (!creditNoteAmount || isNaN(amount) || amount <= 0) {
      toast({ title: "Montant invalide", description: "Le montant doit être supérieur à 0", variant: "destructive" });
      return;
    }
    setCreditNoteSubmitting(true);
    try {
      const res = await fetch("/api/credit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          amount,
          reason: creditNoteReason || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Avoir créé", description: `Avoir ${data.number} créé avec succès` });
        setShowCreditNoteForm(false);
        setCreditNoteAmount("");
        setCreditNoteReason("");
      } else {
        toast({ title: "Erreur", description: data.error || "Erreur", variant: "destructive" });
      }
    } finally {
      setCreditNoteSubmitting(false);
    }
  }

  async function handleSaveAsTemplate() {
    if (!invoice) return;
    if (!templateName.trim()) {
      toast({ title: "Nom requis", description: "Veuillez saisir un nom pour le modèle", variant: "destructive" });
      return;
    }
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          type: "INVOICE",
          notes: invoice.notes || null,
          paymentTerms: invoice.terms || null,
          applyTVA: invoice.applyTVA,
          items: invoice.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });
      if (res.ok) {
        toast({ title: "Modèle sauvegardé", description: `"${templateName}" a été créé` });
        setShowSaveTemplate(false);
        setTemplateName("");
      } else {
        const err = await res.json();
        toast({ title: "Erreur", description: err.error || "Une erreur est survenue", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    } finally {
      setSavingTemplate(false);
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

  const payments: InvoicePayment[] = invoice.payments ?? [];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, invoice.total - totalPaid);
  const progressPercent = invoice.total > 0 ? Math.min(100, (totalPaid / invoice.total) * 100) : 0;
  const showPaymentsSection =
    invoice.status === "SENT" || invoice.status === "OVERDUE" || invoice.status === "PAID";

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
            {/* Credit note */}
            {(invoice.status === "PAID" || invoice.status === "CANCELLED") && (
              <div className="relative">
                {showCreditNoteForm ? (
                  <div className="flex items-center gap-1 border border-border rounded-lg px-3 py-1.5 bg-card shadow-sm">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="border border-border rounded-md px-2 py-1 text-sm w-28 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Montant XAF"
                      value={creditNoteAmount}
                      onChange={(e) => setCreditNoteAmount(e.target.value)}
                      autoFocus
                    />
                    <input
                      type="text"
                      className="border border-border rounded-md px-2 py-1 text-sm w-36 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Motif (optionnel)"
                      value={creditNoteReason}
                      onChange={(e) => setCreditNoteReason(e.target.value)}
                    />
                    <Button size="sm" disabled={creditNoteSubmitting} onClick={handleCreateCreditNote}>
                      {creditNoteSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Créer"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowCreditNoteForm(false); setCreditNoteAmount(""); setCreditNoteReason(""); }}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowCreditNoteForm(true); setCreditNoteAmount(String(invoice.total)); }}
                  >
                    <ReceiptText className="w-4 h-4 mr-2" />
                    Créer un avoir
                  </Button>
                )}
              </div>
            )}
            {/* Save as template */}
            <div className="relative">
              {showSaveTemplate ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    className="border border-border rounded-md px-2 py-1 text-sm w-44 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Nom du modèle"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveAsTemplate(); if (e.key === "Escape") { setShowSaveTemplate(false); setTemplateName(""); } }}
                    autoFocus
                  />
                  <Button size="sm" disabled={savingTemplate} onClick={handleSaveAsTemplate}>
                    {savingTemplate ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sauver"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowSaveTemplate(false); setTemplateName(""); }}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveTemplate(true)}
                >
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Modèle
                </Button>
              )}
            </div>
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
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <InvoiceStatusBadge status={invoice.status} />
                {invoice.isRecurring && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border border-violet-200 dark:border-violet-700">
                    <RefreshCw className="w-3 h-3" />
                    Récurrente
                  </span>
                )}
              </div>
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
                  {invoice.isRecurring && invoice.recurrenceInterval && (
                    <div className="flex justify-end gap-4 text-sm">
                      <span className="text-muted-foreground">Récurrence:</span>
                      <span className="font-medium text-violet-600">
                        {RECURRENCE_LABELS[invoice.recurrenceInterval] ?? invoice.recurrenceInterval}
                      </span>
                    </div>
                  )}
                  {invoice.isRecurring && invoice.nextDueDate && (
                    <div className="flex justify-end gap-4 text-sm">
                      <span className="text-muted-foreground">Prochaine échéance:</span>
                      <span className="font-medium">
                        {formatDate(invoice.nextDueDate)}
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

        {/* Recurring invoice section */}
        {invoice.isRecurring && (
          <Card className="border-violet-200 dark:border-violet-800">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <RefreshCw className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Facture récurrente</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.recurrenceInterval
                        ? RECURRENCE_LABELS[invoice.recurrenceInterval] ?? invoice.recurrenceInterval
                        : "Intervalle non défini"}
                      {invoice.nextDueDate && (
                        <> — Prochaine échéance : <span className="font-medium">{formatDate(invoice.nextDueDate)}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400"
                  onClick={handleGenerateNextInvoice}
                  disabled={generatingNext}
                >
                  {generatingNext ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Générer la prochaine facture
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments section */}
        {showPaymentsSection && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">Paiements reçus</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Acomptes et paiements partiels
                  </p>
                </div>
                {invoice.status !== "PAID" && !showPaymentForm && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPaymentForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un acompte
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Reçu :{" "}
                    <span className="font-semibold text-emerald-600">
                      {formatAmount(totalPaid)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Total : <span className="font-semibold">{formatAmount(invoice.total)}</span>
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: progressPercent >= 100 ? "#10b981" : "#3b82f6",
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    Solde restant :{" "}
                    <span className={remaining === 0 ? "text-emerald-600" : "text-rose-600"}>
                      {formatAmount(remaining)}
                    </span>
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {progressPercent.toFixed(0)}% réglé
                  </span>
                </div>
              </div>

              <Separator />

              {/* Payments list */}
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  Aucun paiement enregistré pour cette facture.
                </p>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1.5 h-8 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                              {formatAmount(payment.amount)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(payment.paidAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          {(payment.reference || payment.note) && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {payment.reference && <span>Réf: {payment.reference}</span>}
                              {payment.reference && payment.note && " — "}
                              {payment.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {confirmDeletePayment === payment.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Supprimer ?</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs"
                              disabled={deletingPayment}
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              {deletingPayment ? <Loader2 className="w-3 h-3 animate-spin" /> : "Oui"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => setConfirmDeletePayment(null)}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                            onClick={() => setConfirmDeletePayment(payment.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add payment form */}
              {showPaymentForm && (
                <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Nouveau paiement</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setShowPaymentForm(false)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="paymentAmount" className="text-xs">
                        Montant (XAF) *
                      </Label>
                      <Input
                        id="paymentAmount"
                        type="number"
                        min="1"
                        step="100"
                        placeholder={`Max: ${formatAmount(remaining)}`}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="paymentMethod" className="text-xs">
                        Méthode de paiement *
                      </Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="paymentDate" className="text-xs">
                        Date du paiement *
                      </Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="paymentReference" className="text-xs">
                        Référence (optionnel)
                      </Label>
                      <Input
                        id="paymentReference"
                        placeholder="N° de transaction, chèque..."
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="paymentNote" className="text-xs">
                        Note (optionnel)
                      </Label>
                      <Input
                        id="paymentNote"
                        placeholder="Informations complémentaires..."
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPaymentForm(false)}
                      disabled={paymentSubmitting}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleAddPayment}
                      disabled={paymentSubmitting}
                    >
                      {paymentSubmitting ? (
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1.5" />
                      )}
                      Enregistrer le paiement
                    </Button>
                  </div>
                </div>
              )}

              {invoice.status !== "PAID" && !showPaymentForm && payments.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPaymentForm(true)}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ajouter un autre paiement
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
