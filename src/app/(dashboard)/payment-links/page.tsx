"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Link2, Copy, Check, ExternalLink, ToggleLeft } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { PaymentLink } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  EXPIRED: "bg-muted text-muted-foreground",
  DISABLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
const STATUS_LABEL: Record<string, string> = { ACTIVE: "Actif", EXPIRED: "Expiré", DISABLED: "Désactivé" };

export default function PaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payment-links").then(r => r.json()).then(setLinks).catch(() => {}).finally(() => setLoading(false));
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
    await fetch(`/api/payment-links/${link.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: link.title, status: newStatus }),
    });
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, status: newStatus } : l));
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
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}</div>
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
            {links.map(link => (
              <div key={link.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{link.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[link.status]}`}>
                        {STATUS_LABEL[link.status]}
                      </span>
                    </div>
                    {link.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{link.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Créé le {format(new Date(link.createdAt), "d MMM yyyy", { locale: fr })}</span>
                      <span>·</span>
                      <span>{link.currentUses} utilisation{link.currentUses > 1 ? "s" : ""}{link.maxUses ? ` / ${link.maxUses}` : ""}</span>
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
                    {copied === link.slug ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied === link.slug ? "Copié !" : "Copier"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`/pay/${link.slug}`, "_blank")} className="shrink-0">
                    <ExternalLink className="w-3 h-3 mr-1" /> Voir
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleStatus(link)} className="shrink-0 text-muted-foreground">
                    <ToggleLeft className="w-3 h-3 mr-1" />
                    {link.status === "ACTIVE" ? "Désactiver" : "Activer"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
