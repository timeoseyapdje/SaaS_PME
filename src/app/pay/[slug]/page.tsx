"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Smartphone, Building2, ArrowLeft, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";

interface PaymentLinkData {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  slug: string;
  status: string;
  currentUses: number;
  maxUses?: number;
  grossAmount?: number;
  feeAmount?: number;
  getMiPayEnabled?: boolean;
  company: { name: string; phone?: string; email?: string; logo?: string; city?: string };
  client?: { name: string; email?: string };
}

const PAYMENT_METHODS: { value: string; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "MTN_MONEY",    label: "MTN Mobile Money", icon: <img src="/mtn-money.svg"    alt="MTN"    className="w-8 h-8 object-contain" />, color: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10" },
  { value: "ORANGE_MONEY", label: "Orange Money",     icon: <img src="/orange-money.svg" alt="Orange" className="w-8 h-8 object-contain" />, color: "border-orange-400 bg-orange-50 dark:bg-orange-900/10" },
];

export default function PublicPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}

function PaymentPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const urlStatus = searchParams.get("status");
  const [data, setData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(urlStatus === "success");
  const [directCharge, setDirectCharge] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLink = useCallback(async () => {
    try {
      const res = await fetch(`/api/pay/${slug}`);
      if (!res.ok) { const d = await res.json(); setError(d.error || "Lien invalide"); return; }
      setData(await res.json());
    } catch { setError("Impossible de charger ce lien de paiement."); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { fetchLink(); }, [fetchLink]);

  useEffect(() => {
    if (!directCharge || !transactionId) return;
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 100) { clearInterval(pollRef.current!); return; }
      try {
        const res = await fetch(`/api/pay/${slug}/status?txId=${transactionId}`);
        if (!res.ok) return;
        const d = await res.json();
        if (d.status === "COMPLETED") {
          clearInterval(pollRef.current!);
          const params = new URLSearchParams({
            amount: String(d.amount ?? ""),
            currency: d.currency ?? "XAF",
            title: d.title ?? "",
            phone: phone || "",
          });
          router.push(`/pay/${slug}/confirmed?${params.toString()}`);
        } else if (d.status === "FAILED") {
          clearInterval(pollRef.current!);
          setError("Le paiement a échoué. Veuillez réessayer.");
          setSuccess(false);
          setDirectCharge(false);
          setTransactionId(null);
        }
      } catch { /* ignore network errors during polling */ }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [directCharge, transactionId, slug, phone, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!method) { setError("Choisissez une methode de paiement"); return; }
    if (["MTN_MONEY", "ORANGE_MONEY"].includes(method) && !phone) { setError("Numero de telephone requis"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`/api/pay/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method, phoneNumber: phone || null, payerName: name || null }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error); return; }
      if (d.checkoutUrl) {
        window.location.href = d.checkoutUrl;
      } else if (d.directCharge) {
        setTransactionId(d.transactionId ?? null);
        setDirectCharge(true);
        setSuccess(true);
      } else {
        setSuccess(true);
      }
    } catch { setError("Erreur. Veuillez reessayer."); }
    finally { setSubmitting(false); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (error && !data) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Lien invalide</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
          className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          {urlStatus === "success" ? "Paiement confirmé !" : directCharge ? "Vérifiez votre téléphone !" : "Demande envoyée !"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {urlStatus === "success" ? (
            <>Votre paiement de <strong>{data ? formatCurrency(data.amount, data.currency) : ""}</strong> a été effectué avec succès.</>
          ) : directCharge ? (
            <>Une demande de paiement de <strong>{data ? formatCurrency(data.grossAmount ?? data.amount, data.currency) : ""}</strong> a été envoyée sur votre téléphone. Approuvez avec votre code PIN Mobile Money.</>
          ) : (
            <>Votre demande de paiement de <strong>{data ? formatCurrency(data.amount, data.currency) : ""}</strong> a été enregistrée.</>
          )}
        </p>
        {directCharge && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            En attente de votre confirmation…
          </div>
        )}
        {data?.company.phone && (
          <a href={`tel:${data.company.phone}`} className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <Smartphone className="w-4 h-4" /> {data.company.phone}
          </a>
        )}
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground font-medium mt-2 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Company header */}
        <div className="text-center space-y-2">
          {data?.company.logo ? (
            <img src={data.company.logo} alt={data.company.name} className="w-16 h-16 rounded-2xl mx-auto object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
          <p className="text-sm font-semibold text-foreground">{data?.company.name}</p>
          {data?.company.city && <p className="text-xs text-muted-foreground">{data.company.city}, Cameroun</p>}
        </div>

        {/* Amount card */}
        <div className="bg-emerald-500 rounded-2xl p-6 text-center text-white shadow-lg">
          <p className="text-sm opacity-80 mb-1">{data?.title}</p>
          <p className="text-4xl font-bold">{formatCurrency(data!.amount, data!.currency)}</p>
          {data?.description && <p className="text-sm opacity-70 mt-2">{data.description}</p>}
          {data?.client && <p className="text-sm opacity-80 mt-1">Pour : {data.client.name}</p>}
          {["MTN_MONEY", "ORANGE_MONEY"].includes(method) && data?.getMiPayEnabled && data.feeAmount ? (
            <div className="mt-3 pt-3 border-t border-white/30 space-y-1 text-sm">
              <div className="flex justify-between opacity-80">
                <span>Montant</span><span>{formatCurrency(data.amount, data.currency)}</span>
              </div>
              <div className="flex justify-between opacity-80">
                <span>Frais de traitement</span><span>+{formatCurrency(data.feeAmount, data.currency)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total débité</span><span>{formatCurrency(data.grossAmount!, data.currency)}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Payment form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Votre nom (optionnel)</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont" />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Méthode de paiement *</Label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    method === m.value
                      ? "border-emerald-500 " + m.color
                      : "border-border hover:border-emerald-300"
                  }`}
                >
                  <span className="block mb-1">{m.icon}</span>
                  <span className="text-xs font-medium text-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {["MTN_MONEY", "ORANGE_MONEY"].includes(method) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Numéro de téléphone Mobile Money *</Label>
              <Input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="6XX XXX XXX"
                required
              />
              <p className="text-xs text-muted-foreground">Une demande de paiement sera envoyée sur ce numéro. Approuvez avec votre code PIN Mobile Money.</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>}

          <Button type="submit" disabled={submitting || !method} className="w-full h-12 text-base">
            {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            Confirmer le paiement · {formatCurrency(
              ["MTN_MONEY", "ORANGE_MONEY"].includes(method) && data?.getMiPayEnabled && data.grossAmount
                ? data.grossAmount
                : data!.amount,
              data!.currency
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Sécurisé par Nkap Control · {data?.company.name}
        </p>
      </div>
    </div>
  );
}
