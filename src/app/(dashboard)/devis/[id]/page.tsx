"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Quote, QuoteStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trash2,
  Loader2,
  FileText,
  Calendar,
  User,
  FileDown,
  MessageCircle,
  Mail,
  PenLine,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { exportQuotePDF } from "@/lib/export";

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
  CONVERTED: "Converti en facture",
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  EXPIRED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CONVERTED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [signLink, setSignLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setQuote(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSendEmail() {
    setEmailSending(true);
    try {
      const res = await fetch("/api/email/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: id, recipientEmail: emailInput || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Email envoyé", description: data.message });
        setEmailInput(null);
        const updated = await fetch(`/api/quotes/${id}`).then((r) => r.json());
        setQuote(updated);
      } else {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } finally {
      setEmailSending(false);
    }
  }

  async function handleStatusChange(status: QuoteStatus) {
    setActionLoading(true);
    const res = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setQuote(updated);
      toast({ title: "Statut mis à jour" });
    } else {
      toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" });
    }
    setActionLoading(false);
  }

  async function handleConvert() {
    setActionLoading(true);
    const res = await fetch(`/api/quotes/${id}/convert`, { method: "POST" });
    const data = await res.json();
    if (res.ok && data.invoice) {
      toast({ title: "Converti", description: `Facture ${data.invoice.number} créée` });
      router.push(`/invoices/${data.invoice.id}`);
    } else {
      toast({ title: "Erreur", description: data.error || "Impossible de convertir", variant: "destructive" });
    }
    setActionLoading(false);
  }

  async function handleDelete() {
    setActionLoading(true);
    const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Devis supprimé" });
      router.push("/devis");
    } else {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
    setActionLoading(false);
  }

  async function handleSignRequest() {
    setSignLoading(true);
    try {
      const res = await fetch(`/api/quotes/${id}/sign-request`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSignLink(data.signingUrl);
        toast({ title: "Lien de signature généré", description: "Copiez et partagez ce lien avec votre client" });
      } else {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
      }
    } finally {
      setSignLoading(false);
    }
  }

  async function copySignLink() {
    if (!signLink) return;
    await navigator.clipboard.writeText(signLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="Devis" subtitle="" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="Devis introuvable" subtitle="" />
        <main className="flex-1 p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <FileText className="w-10 h-10" />
          <p>Ce devis n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
          <Link href="/devis">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux devis
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const client = quote.client as { name: string; email?: string; phone?: string; address?: string } | undefined;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title={quote.number} subtitle="Détail du devis" />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link href="/devis">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportQuotePDF({
                number: quote.number,
                issueDate: quote.issueDate,
                validUntil: quote.validUntil,
                status: quote.status,
                currency: quote.currency,
                subtotal: quote.subtotal,
                tvaAmount: quote.tvaAmount,
                total: quote.total,
                applyTVA: quote.applyTVA,
                notes: quote.notes,
                terms: quote.terms,
                client: client ?? undefined,
                items: quote.items,
                company: (quote as unknown as { company?: { name: string; email?: string | null; phone?: string | null; city?: string | null; taxId?: string | null } | null }).company ?? undefined,
              })}
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-300 hover:bg-green-50"
              onClick={() => {
                const message = encodeURIComponent(
                  `Bonjour ${client?.name || ""},\n\nVeuillez trouver ci-joint notre devis *${quote.number}* d'un montant de ${quote.total.toLocaleString("fr-FR")} ${quote.currency}, valable jusqu'au ${new Date(quote.validUntil).toLocaleDateString("fr-FR")}.\n\nCordialement`
                );
                const phone = client?.phone?.replace(/\D/g, "");
                const url = phone
                  ? `https://wa.me/${phone.startsWith("237") ? phone : `237${phone}`}?text=${message}`
                  : `https://wa.me/?text=${message}`;
                window.open(url, "_blank");
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            {emailInput === null ? (
              <Button size="sm" variant="outline" onClick={() => setEmailInput(client?.email || "")}>
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
            {(quote.status === "DRAFT" || quote.status === "SENT") && (
              <Button
                size="sm"
                variant="outline"
                className="text-violet-600 border-violet-300 hover:bg-violet-50"
                disabled={signLoading}
                onClick={handleSignRequest}
              >
                {signLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PenLine className="w-4 h-4 mr-2" />}
                Demander signature
              </Button>
            )}

            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[quote.status as QuoteStatus]}`}>
              {STATUS_LABELS[quote.status as QuoteStatus]}
            </span>

            {quote.status === "DRAFT" && (
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading}
                onClick={() => handleStatusChange("SENT")}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Marquer envoyé
              </Button>
            )}

            {quote.status === "SENT" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange("ACCEPTED")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accepté
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange("REJECTED")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refusé
                </Button>
              </>
            )}

            {(quote.status === "SENT" || quote.status === "ACCEPTED") && (
              <Button size="sm" disabled={actionLoading} onClick={handleConvert}>
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                Convertir en facture
              </Button>
            )}

            {quote.status !== "CONVERTED" && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Supprimer ?</span>
                  <Button size="sm" variant="destructive" disabled={actionLoading} onClick={handleDelete}>
                    Oui
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Non
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )
            )}
          </div>
        </div>

        {/* Signing link panel */}
        {signLink && (
          <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-400 mb-2">Lien de signature généré</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={signLink}
                className="flex-1 text-xs bg-white dark:bg-background border border-border rounded-lg px-3 py-2 font-mono text-muted-foreground focus:outline-none"
              />
              <Button size="sm" variant="outline" className="shrink-0" onClick={copySignLink}>
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => {
                  const msg = encodeURIComponent(`Bonjour ${client?.name || ""},\n\nMerci de signer notre devis *${quote.number}* en cliquant sur ce lien :\n${signLink}\n\nCordialement`);
                  const phone = client?.phone?.replace(/\D/g, "");
                  const url = phone
                    ? `https://wa.me/${phone.startsWith("237") ? phone : `237${phone}`}?text=${msg}`
                    : `https://wa.me/?text=${msg}`;
                  window.open(url, "_blank");
                }}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Ce lien permet à votre client d&apos;accepter ou refuser le devis directement depuis son appareil.</p>
          </div>
        )}

        {/* Signed indicator */}
        {(quote as unknown as { signedAt?: string | null }).signedAt && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Devis signé électroniquement</p>
              <p className="text-xs text-muted-foreground">
                Accepté le {new Date((quote as unknown as { signedAt: string }).signedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Client</p>
                <p className="font-semibold text-sm">{client?.name || "-"}</p>
                {client?.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date d&apos;émission</p>
                <p className="font-semibold text-sm">{new Date(quote.issueDate).toLocaleDateString("fr-FR")}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valide jusqu&apos;au</p>
                <p className="font-semibold text-sm">{new Date(quote.validUntil).toLocaleDateString("fr-FR")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lignes du devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-muted-foreground">Description</th>
                    <th className="py-2 text-right font-medium text-muted-foreground w-20">Qté</th>
                    <th className="py-2 text-right font-medium text-muted-foreground w-32">Prix unit.</th>
                    <th className="py-2 text-right font-medium text-muted-foreground w-32">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(quote.items || []).map((item, index) => (
                    <tr key={index}>
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice, quote.currency)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.total, quote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
              <div className="flex justify-between w-full text-sm">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span className="font-medium">{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>
              {quote.applyTVA && (
                <div className="flex justify-between w-full text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span className="font-medium">{formatCurrency(quote.tvaAmount, quote.currency)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between w-full">
                <span className="font-bold">Total TTC</span>
                <span className="font-bold text-lg text-blue-700">{formatCurrency(quote.total, quote.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Terms */}
        {(quote.notes || quote.terms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quote.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
                </CardContent>
              </Card>
            )}
            {quote.terms && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.terms}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Converted invoice link */}
        {quote.status === "CONVERTED" && quote.convertedInvoiceId && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Ce devis a été converti en facture</p>
              </div>
              <Link href={`/invoices/${quote.convertedInvoiceId}`}>
                <Button size="sm" variant="outline" className="text-purple-600 border-purple-300">
                  Voir la facture
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
