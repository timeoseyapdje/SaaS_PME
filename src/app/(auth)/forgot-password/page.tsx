"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, Mail, KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "email" | "code" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      if (data.emailSent === false && data.resetToken) {
        // Resend not configured — skip code step
        setResetToken(data.resetToken);
        setStep("password");
      } else {
        setStep("code");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResetToken(data.resetToken);
      setStep("password");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    if (newPassword.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("done");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié</h1>
          <p className="text-sm text-muted-foreground">
            {step === "email" && "Entrez votre email pour recevoir un code de réinitialisation."}
            {step === "code" && "Entrez le code à 6 chiffres envoyé à votre email."}
            {step === "password" && "Choisissez votre nouveau mot de passe."}
            {step === "done" && "Votre mot de passe a été réinitialisé."}
          </p>
        </div>

        {/* Step: email */}
        {step === "email" && (
          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-2">
              <Label>Adresse email</Label>
              <Input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Envoyer le code
            </Button>
          </form>
        )}

        {/* Step: code */}
        {step === "code" && (
          <form onSubmit={handleCode} className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
              <Mail className="w-4 h-4 shrink-0" />
              Code envoyé à <strong>{email}</strong>
            </div>
            <div className="space-y-2">
              <Label>Code de vérification</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                className="text-center text-2xl tracking-[0.5em] font-bold"
              />
              <p className="text-xs text-muted-foreground">Ce code expire dans 15 minutes.</p>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Vérifier le code
            </Button>
            <button type="button" onClick={() => setStep("email")} className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Changer d&apos;email
            </button>
          </form>
        )}

        {/* Step: new password */}
        {step === "password" && (
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoFocus
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmer le mot de passe</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Lock className="w-4 h-4 mr-2" />
              Réinitialiser le mot de passe
            </Button>
          </form>
        )}

        {/* Step: done */}
        {step === "done" && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Mot de passe mis à jour. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Se connecter
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
