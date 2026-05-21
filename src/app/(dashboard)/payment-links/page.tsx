"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Plus, Link2, Copy, Check, ExternalLink, ToggleLeft,
  Trash2, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Smartphone, Building2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  amount: number;
  paymentMethod: string;
  phoneNumber?: string;
  payerName?: string;
  status: string;
  createdAt: string;
  paidAt?: string;
}

interface PaymentLink {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  slug: string;
  status: string;
  currentUses: number;
  maxUses?: number;
  createdAt: string;
  transactions: Transaction[];
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  EXPIRED: "bg-muted text-muted-foreground",
  DISABLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
const STATUS_LABEL: Record<string, string> = { ACTIVE: "Actif", EXPIRED: "Expiré", DISABLED: "Désactivé" };

const TX_METHOD_LABEL: Record<string, string> = {
  MTN_MONEY: "MTN Mobile Money",
  ORANGE_MONEY: "Orange Money",
  VIREMENT: "Virement bancaire",
  ESPECES: "Espèces",
};

const TX_STATUS_CONFIG: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  PENDING:   { label: "En attente", className: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20", Icon: Clock },
  COMPLETED: { label: "Confirmé",   className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", Icon: CheckCircle2 },
  FAILED:    { label: "Échoué",     className: "text-red-600 bg-red-50 dark:bg-red-900/20", Icon: XCircle },
};

export default function PaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payment-links")
      .then(r => r.json())
      .then(setLinks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getUrl(slug: string) {
    return `${window.location.origin}/pay/${slug}`;
  }

  async function copyLink(slug: string) {
    await navigator.clipboard.writeText(getUrl(slug));
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  async function toggleStatus(link: PaymentLink) {
    const newStatus = link.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      const res = await fetch(`/api/payment-links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: link.title, status: newStatus }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Erreur lors du changement de statut");
        return;
      }
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, status: newStatus } : l));
    } catch {
      alert("Erreur réseau");
    }
  }

  async function deleteLink(link: PaymentLink) {
    if (!confirm(`Supprimer le lien "${link.title}" ? Cette action est irréversible.`)) return;
    setDeleting(link.id);
    try {
      const res = await fetch(`/api/payment-links/${link.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Erreur lors de la suppression");
        return;
      }
      setLinks(prev => prev.filter(l => l.id !== link.id));
    } catch {
      alert("Erreur réseau");
    } finally {
      setDeleting(null);
    }
  }

  async function confirmTransaction(linkId: string, txId: string, newStatus: "COMPLETED" | "FAILED") {
    setConfirming(txId);
    const res = await fetch(`/api/payment-links/${linkId}/transactions/${txId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLinks(prev => prev.map(l =>
        l.id === linkId
          ? { ...l, transactions: l.transactions.map(t => t.id === txId ? { ...t, ...updated } : t) }
          : l
      ));
    }
    setConfirming(null);
  }

  function pendingCount(link: PaymentLink) {
    return link.transactions.filter(t => t.status === "PENDING").length;
  }

  return (
    <div className="flex flex-col gap-6">
      <Header title="Liens de paiement" subtitle="Partagez des liens de paiement avec vos clients" />

      <div className="flex justify-end">
        <Button onClick={() => router.push("/payment-links/new")}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau lien
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="Aucun lien de paiement"
          description="Créez des liens de paiement à partager via WhatsApp, SMS ou email pour collecter vos paiements."
          actionLabel="Créer un lien"
          onAction={() => router.push("/payment-links/new")}
        />
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="divide-y divide-border">
            {links.map(link => {
              const pending = pendingCount(link);
              const isExpanded = expanded === link.id;
              return (
                <div key={link.id}>
                  {/* Link header row */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{link.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[link.status]}`}>
                            {STATUS_LABEL[link.status]}
                          </span>
                          {pending > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                              {pending} en attente
                            </span>
                          )}
                        </div>
                        {link.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{link.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Créé le {format(new Date(link.createdAt), "d MMM yyyy", { locale: fr })}</span>
                          <span>·</span>
                          <span>
                            {link.currentUses} utilisation{link.currentUses > 1 ? "s" : ""}
                            {link.maxUses ? ` / ${link.maxUses}` : ""}
                          </span>
                        </div>
                      </div>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {formatCurrency(link.amount, link.currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="flex-1 text-xs bg-muted px-3 py-1.5 rounded-lg text-muted-foreground truncate">
                        /pay/{link.slug}
                      </code>
                      <Button size="sm" variant="outline" onClick={() => copyLink(link.slug)} className="shrink-0">
                        {copied === link.slug
                          ? <Check className="w-3 h-3 mr-1 text-emerald-500" />
                          : <Copy className="w-3 h-3 mr-1" />}
                        {copied === link.slug ? "Copié !" : "Copier"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`/pay/${link.slug}`, "_blank")} className="shrink-0">
                        <ExternalLink className="w-3 h-3 mr-1" /> Voir
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleStatus(link)} className="shrink-0 text-muted-foreground">
                        <ToggleLeft className="w-3 h-3 mr-1" />
                        {link.status === "ACTIVE" ? "Désactiver" : "Activer"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteLink(link)}
                        disabled={deleting === link.id}
                        className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                      </Button>
                      {link.transactions.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpanded(isExpanded ? null : link.id)}
                          className="shrink-0 text-muted-foreground"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                          {link.transactions.length} transaction{link.transactions.length > 1 ? "s" : ""}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Transactions panel */}
                  {isExpanded && link.transactions.length > 0 && (
                    <div className="bg-muted/30 border-t border-border divide-y divide-border/50">
                      {link.transactions
                        .slice()
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(tx => {
                          const cfg = TX_STATUS_CONFIG[tx.status] ?? TX_STATUS_CONFIG.PENDING;
                          const Icon = cfg.Icon;
                          return (
                            <div key={tx.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                              <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${cfg.className}`}>
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm">
                                  {tx.payerName
                                    ? <span className="font-medium text-foreground">{tx.payerName}</span>
                                    : <span className="text-muted-foreground italic">Client anonyme</span>}
                                  <span className="text-muted-foreground">·</span>
                                  <span className="text-muted-foreground text-xs">{TX_METHOD_LABEL[tx.paymentMethod] ?? tx.paymentMethod}</span>
                                  {tx.phoneNumber && (
                                    <>
                                      <span className="text-muted-foreground">·</span>
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Smartphone className="w-3 h-3" /> {tx.phoneNumber}
                                      </span>
                                    </>
                                  )}
                                  {tx.paymentMethod === "VIREMENT" && (
                                    <>
                                      <span className="text-muted-foreground">·</span>
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Building2 className="w-3 h-3" /> Virement à confirmer manuellement
                                      </span>
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {format(new Date(tx.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}
                                  {tx.paidAt && ` · Confirmé le ${format(new Date(tx.paidAt), "d MMM yyyy à HH:mm", { locale: fr })}`}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(tx.amount, link.currency)}
                              </p>
                              {tx.status === "PENDING" && (
                                <div className="flex gap-1.5 shrink-0">
                                  <Button
                                    size="sm"
                                    disabled={confirming === tx.id}
                                    onClick={() => confirmTransaction(link.id, tx.id, "COMPLETED")}
                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={confirming === tx.id}
                                    onClick={() => confirmTransaction(link.id, tx.id, "FAILED")}
                                    className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" /> Rejeter
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
