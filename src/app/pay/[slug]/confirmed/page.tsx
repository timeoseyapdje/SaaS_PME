"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Smartphone } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") || "XAF";
  const title = searchParams.get("title");
  const phone = searchParams.get("phone");

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6 text-center">
        {/* Checkmark */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paiement confirmé !</h1>
          {title && <p className="text-sm text-muted-foreground mt-1">{title}</p>}
          {amount && (
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
              {formatCurrency(parseFloat(amount), currency)}
            </p>
          )}
          {phone && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
              <Smartphone className="w-4 h-4" />
              <span>{phone}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Votre paiement a été traité avec succès par NotchPay.
        </p>

        {/* Open in browser — for PWA / WebView */}
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Voir dans le navigateur
        </a>

        <p className="text-xs text-muted-foreground">
          Conservez cette page comme preuve de paiement.
        </p>
      </div>
    </div>
  );
}

export default function PaymentConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmedContent />
    </Suspense>
  );
}
