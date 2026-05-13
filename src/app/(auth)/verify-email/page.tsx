"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const didAutoSkip = useRef(false);

  // If Resend is not configured, the API returns emailSent:false — auto-verify and continue
  useEffect(() => {
    if (!email || didAutoSkip.current) return;
    // Check if we should skip verification (no email service)
    fetch("/api/email/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then(r => r.json()).then(d => {
      if (d.emailSent === false) {
        // No email service — auto-verify and sign in
        didAutoSkip.current = true;
        autoSignIn();
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function autoSignIn() {
    const stored = sessionStorage.getItem("pending_verify");
    if (!stored) { router.push("/login"); return; }
    const { email: e, password } = JSON.parse(stored);
    sessionStorage.removeItem("pending_verify");
    // Mark email as verified without code (no email service fallback)
    await fetch("/api/email/verify", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: e, code: "SKIP", skipCode: true }),
    }).catch(() => {});
    const result = await signIn("credentials", { email: e, password, redirect: false });
    if (result?.ok) {
      router.push("/onboarding");
    } else {
      router.push("/login");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setError("Entrez les 6 chiffres du code."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/email/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Code invalide ou expiré."); return; }

      // Auto sign-in using stored credentials
      const stored = sessionStorage.getItem("pending_verify");
      if (stored) {
        const { email: e, password } = JSON.parse(stored);
        sessionStorage.removeItem("pending_verify");
        const result = await signIn("credentials", { email: e, password, redirect: false });
        if (result?.ok) {
          router.push("/onboarding");
          return;
        }
      }
      // Fallback if credentials not stored (e.g. page was refreshed)
      router.push("/login");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setResent(false);
    try {
      await fetch("/api/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 text-center">

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Vérifiez votre email</h1>
          <p className="text-sm text-muted-foreground">
            Un code à 6 chiffres a été envoyé à
          </p>
          <p className="text-sm font-semibold text-foreground">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4 text-left">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            className="text-center text-3xl tracking-[0.6em] font-bold h-14"
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-center">{error}</p>
          )}
          <Button type="submit" className="w-full h-12 text-base" disabled={loading || code.length !== 6}>
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Confirmer et continuer
          </Button>
        </form>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Vous n&apos;avez pas reçu le code ?</p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 mx-auto"
          >
            {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {resent ? "Code renvoyé !" : "Renvoyer le code"}
          </button>
        </div>
      </div>
    </div>
  );
}
