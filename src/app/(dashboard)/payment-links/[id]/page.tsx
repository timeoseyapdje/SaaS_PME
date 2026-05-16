"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  ArrowDownLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  grossAmount?: number;
  feeAmount?: number;
  paymentMethod: string;
  phoneNumber?: string;
  payerName?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  transactionRef?: string;
  paidAt?: string;
  createdAt: string;
  payout?: { status: string; payoutRef?: string } | null;
}

interface PaymentLinkDetail {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  slug: string;
  status: string;
  currentUses: number;
  maxUses?: number;
}

const METHOD_LABELS: Record<string, string> = {
  MTN_MONEY: "MTN Mobile Money",
  ORANGE_MONEY: "Orange Money",
  ESPECES: "Espèces",
  VIREMENT: "Virement",
  CHEQUE: "Chèque",
  CARTE_BANCAIRE: "Carte bancaire",
};

function MethodIcon({ method }: { method: string }) {
  const cls = "w-4 h-4";
  if (method === "MTN_MONEY" || method === "ORANGE_MONEY") return <Smartphone className={cls} />;
  if (method === "VIREMENT") return <Building2 className={cls} />;
  if (method === "CARTE_BANCAIRE") return <CreditCard className={cls} />;
  return <Banknote className={cls} />;
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const map = {
    PENDING:   { label: "En attente", icon: <Clock className="w-3 h-3" />,        cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    COMPLETED: { label: "Payé",       icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    FAILED:    { label: "Échoué",     icon: <XCircle className="w-3 h-3" />,      cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    REFUNDED:  { label: "Remboursé",  icon: <ArrowDownLeft className="w-3 h-3" />,cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${map.cls}`}>
      {map.icon} {map.label}
    </span>
  );
}

export default function PaymentLinkTransactionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [link, setLink] = useState<PaymentLinkDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment-links/${id}/transactions`);
      if (!res.ok) { router.push("/payment-links"); return; }
      const data = await res.json();
      setLink(data.link);
      setTransactions(data.transactions);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetch_(); }, [fetch_]);

  function copyLink() {
    if (!link) return;
    const url = `${window.location.origin}/pay/${link.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const completed = transactions.filter((t) => t.status === "COMPLETED");
  const totalCollected = completed.reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!link) return null;

  return (
    <div className="flex flex-col gap-5">
      <Header
        title={link.title}
        subtitle={`${link.currentUses} paiement${link.currentUses > 1 ? "s" : ""} · ${formatCurrency(link.amount, link.currency)}`}
      />

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/payment-links">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={copyLink}>
          {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? "Copié !" : "Copier le lien"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Montant demandé", value: formatCurrency(link.amount, link.currency), color: "text-foreground" },
          { label: "Total collecté", value: formatCurrency(totalCollected, link.currency), color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Paiements reçus", value: String(completed.length), color: "text-foreground" },
          { label: "En attente", value: String(transactions.filter((t) => t.status === "PENDING").length), color: "text-yellow-600 dark:text-yellow-400" },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions table */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun paiement reçu pour l&apos;instant</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                      <MethodIcon method={tx.paymentMethod} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.payerName || "Payeur anonyme"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}
                        {tx.phoneNumber && ` · ${tx.phoneNumber}`}
                        {" · "}{new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <StatusBadge status={tx.status} />
                    {tx.payout && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        tx.payout.status === "COMPLETED" ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" :
                        tx.payout.status === "PROCESSING" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        tx.payout.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        Reversement : {tx.payout.status === "COMPLETED" ? "effectué" : tx.payout.status === "PROCESSING" ? "en cours" : tx.payout.status === "FAILED" ? "échoué" : "initié"}
                      </span>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(tx.amount, link.currency)}</p>
                      {tx.grossAmount && tx.grossAmount !== tx.amount && (
                        <p className="text-[10px] text-muted-foreground">Client a payé {formatCurrency(tx.grossAmount, link.currency)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
