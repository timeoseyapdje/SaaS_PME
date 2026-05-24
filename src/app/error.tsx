"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">Une erreur est survenue</h1>
          <p className="text-sm text-muted-foreground">
            {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
