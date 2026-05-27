"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

function FailedContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") || "XAF";
  const title = searchParams.get("title");
  const reason = searchParams.get("reason");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Paiement refusé</h1>
          {title && <p className="text-sm text-muted-foreground mt-1">{title}</p>}
          {amount && (
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-3">
              {formatCurrency(parseFloat(amount), currency)}
            </p>
          )}
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-800 dark:text-red-300 space-y-1 text-left">
          <p className="font-semibold">
            {reason === "cancelled" ? "Paiement annulé." : "Le paiement n’a pas pu être traité."}
          </p>
          <p className="text-xs opacity-80">
            {reason === "cancelled"
              ? "Vous avez annulé la demande USSD. Vous pouvez réessayer à tout moment."
              : "Vérifiez votre solde Mobile Money ou réessayez avec un autre numéro."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={`/pay/${slug}`}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors"
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
          Aucun montant n&apos;a été débité.
        </p>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}
