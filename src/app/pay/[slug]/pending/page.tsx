"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Clock, Smartphone, ArrowLeft, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

function PendingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") || "XAF";
  const title = searchParams.get("title");
  const phone = searchParams.get("phone");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/10">
          <Clock className="w-12 h-12 text-yellow-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Paiement en attente</h1>
          {title && <p className="text-sm text-muted-foreground mt-1">{title}</p>}
          {amount && (
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-3">
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

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300 space-y-1 text-left">
          <p className="font-semibold">Votre paiement est en cours de traitement.</p>
          <p className="text-xs opacity-80">Si vous avez reçu une demande USSD, veuillez l&apos;approuver avec votre code PIN Mobile Money. Cette page se mettra à jour automatiquement.</p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={`/pay/${slug}`}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer le paiement
          </a>
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Conservez cette page. Le marchand sera notifié dès confirmation.
        </p>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
