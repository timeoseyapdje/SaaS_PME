"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2, Smartphone, Building2 } from "lucide-react";
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
  company: { name: string; phone?: string; email?: string; logo?: string; city?: string };
  client?: { name: string; email?: string };
  notchpayEnabled?: boolean;
}

function MtnLogo() {
  return (
    <div style={{ background: "#FFCC00", borderRadius: 6, padding: "2px 10px", display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 72, height: 36 }}>
      <span style={{ color: "#000", fontWeight: 900, fontSize: 14, lineHeight: 1.1, fontFamily: "Arial Black, Arial, sans-serif" }}>MTN</span>
      <span style={{ color: "#000", fontWeight: 600, fontSize: 8, lineHeight: 1.2, fontFamily: "Arial, sans-serif" }}>Mobile Money</span>
    </div>
  );
}

function OrangeLogo() {
  return (
    <div style={{ background: "#FF6600", borderRadius: 6, padding: "2px 10px", display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 72, height: 36 }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.1, fontFamily: "Arial, sans-serif" }}>Orange</span>
      <span style={{ color: "#fff", fontWeight: 600, fontSize: 9, lineHeight: 1.2, fontFamily: "Arial, sans-serif" }}>Money</span>
    </div>
  );
}

function VisaLogo() {
  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 5, width: 52, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#1A1F71", fontWeight: 900, fontSize: 16, fontStyle: "italic", fontFamily: "Arial, sans-serif", letterSpacing: 1 }}>VISA</span>
    </div>
  );
}

function MastercardLogo() {
  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 5, width: 52, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 44 28" width="44" height="28" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="14" r="11" fill="#EB001B"/>
        <circle cx="28" cy="14" r="11" fill="#F79E1B"/>
        <path d="M22 5.2a11 11 0 0 1 0 17.6A11 11 0 0 1 22 5.2z" fill="#FF5F00"/>
      </svg>
    </div>
  );
}

const PAYMENT_METHODS = [
  { value: "MTN_MONEY",    label: "MTN Mobile Money", color: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10" },
  { value: "ORANGE_MONEY", label: "Orange Money",     color: "border-orange-400 bg-orange-50 dark:bg-orange-900/10" },
  { value: "ESPECES",      label: "Espèces / Cash",   color: "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10" },
  { value: "VIREMENT",     label: "Virement bancaire",color: "border-blue-400 bg-blue-50 dark:bg-blue-900/10" },
];

export default function PublicPaymentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchLink = useCallback(async () => {
    try {
      const res = await fetch(`/api/pay/${slug}`);
      if (!res.ok) { const d = await res.json(); setError(d.error || "Lien invalide"); return; }
      setData(await res.json());
    } catch { setError("Impossible de charger ce lien de paiement."); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { fetchLink(); }, [fetchLink]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!method) { setError("Choisissez une méthode de paiement"); return; }
    if (["MTN_MONEY", "ORANGE_MONEY"].includes(method) && !phone) { setError("Numéro de téléphone requis"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`/api/pay/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method, phoneNumber: phone || null, payerName: name || null, payerEmail: email || null }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error); return; }
      if (d.checkoutUrl) {
        window.location.href = d.checkoutUrl;
      } else {
        setSuccess(true);
      }
    } catch { setError("Erreur. Veuillez réessayer."); }
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
          <span className="text-2xl">⛔</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">Lien invalide</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Demande envoyée !</h1>
        <p className="text-sm text-muted-foreground">
          Votre demande de paiement de <strong>{formatCurrency(data!.amount, data!.currency)}</strong> a été enregistrée.
          {data?.company.name} vous contactera pour confirmer le paiement.
        </p>
        {data?.company.phone && (
          <a href={`tel:${data.company.phone}`} className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <Smartphone className="w-4 h-4" /> {data.company.phone}
          </a>
        )}
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
        </div>

        {/* Payment form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Votre nom (optionnel)</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont" />
          </div>

          {data?.notchpayEnabled && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email (requis pour le paiement en ligne)</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
            </div>
          )}

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
                  <div className="mb-1 flex items-center gap-1">
                    {m.value === "MTN_MONEY"    && <MtnLogo />}
                    {m.value === "ORANGE_MONEY" && <OrangeLogo />}
                    {m.value === "VIREMENT"     && <><VisaLogo /><MastercardLogo /></>}
                    {m.value === "ESPECES"      && <span className="text-xl">💵</span>}
                  </div>
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
              <p className="text-xs text-muted-foreground">Le marchand initiera le paiement sur ce numéro.</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>}

          <Button type="submit" disabled={submitting || !method} className="w-full h-12 text-base">
            {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            Confirmer le paiement · {formatCurrency(data!.amount, data!.currency)}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Sécurisé par Nkap Control · {data?.company.name}
        </p>
      </div>
    </div>
  );
}
