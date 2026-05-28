"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Clock, Smartphone, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

function PendingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const txId     = searchParams.get("txId");
  const amount   = searchParams.get("amount");
  const currency = searchParams.get("currency") || "XAF";
  const title    = searchParams.get("title");
  const phone    = searchParams.get("phone");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>(`txId: ${txId ?? "ABSENT"}\nslug: ${slug}\nEn attente de la première réponse API…`);

  useEffect(() => {
    if (!txId) {
      setDebugInfo("ERREUR: txId absent de l'URL");
      return;
    }

    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;
      // Stop after ~5 min (100 × 3 s). Page stays visible — user can retry manually.
      if (attempts > 100) { clearInterval(pollRef.current!); return; }

      try {
        const res = await fetch(`/api/pay/${slug}/status?txId=${txId}`);
        const text = await res.text();
        let d: Record<string, unknown> = {};
        try { d = JSON.parse(text); } catch { d = { raw: text }; }

        setDebugInfo(`attempt: ${attempts}\nhttpStatus: ${res.status}\n\n${JSON.stringify(d, null, 2)}`);

        if (d.status === "COMPLETED") {
          clearInterval(pollRef.current!);
          const p = new URLSearchParams({
            amount:   String(d.amount   ?? amount   ?? ""),
            currency: String(d.currency ?? currency),
            title:    String(d.title    ?? title    ?? ""),
            phone:    phone      ?? "",
          });
          router.push(`/pay/${slug}/confirmed?${p.toString()}`);
        } else if (d.status === "FAILED") {
          clearInterval(pollRef.current!);
          const p = new URLSearchParams({
            amount:   String(d.amount   ?? amount   ?? ""),
            currency: String(d.currency ?? currency),
            title:    String(d.title    ?? title    ?? ""),
            reason:   "cancelled",
          });
          router.push(`/pay/${slug}/failed?${p.toString()}`);
        }
      } catch (err) { setDebugInfo(`attempt: ${attempts}\nERREUR réseau: ${String(err)}`); }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [txId, slug, amount, currency, title, phone, router]);

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
          <p className="text-xs opacity-80">Si vous avez reçu une demande USSD, veuillez l&apos;approuver avec votre code PIN Mobile Money. Cette page se met à jour automatiquement.</p>
        </div>

        {txId && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Vérification en cours…
          </div>
        )}

        <details className="text-left">
          <summary className="text-xs text-muted-foreground cursor-pointer select-none">Debug</summary>
          <pre className="mt-2 text-xs bg-muted rounded-lg p-3 overflow-auto whitespace-pre-wrap break-all">
            {debugInfo}
          </pre>
          {txId && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={async () => {
                  const cb = JSON.parse(debugInfo.split("\n\n")[1] || "{}");
                  const url = cb?.debug?.expectedCallbackUrl;
                  if (!url) return;
                  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "success" }) });
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium"
              >
                ✓ Simuler succès
              </button>
              <button
                onClick={async () => {
                  const cb = JSON.parse(debugInfo.split("\n\n")[1] || "{}");
                  const url = cb?.debug?.expectedCallbackUrl;
                  if (!url) return;
                  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "failed" }) });
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium"
              >
                ✗ Simuler échec
              </button>
            </div>
          )}
        </details>

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
