"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setLoading(true);
    try {
      // Vérifier le statut email avant tentative de connexion
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const checkData = await checkRes.json();

      if (checkData.status === "email_not_verified") {
        setNeedsVerification(true);
        setError("Veuillez vérifier votre adresse email avant de vous connecter.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        // Rediriger les admins vers le dashboard admin
        const destination = checkData.role === "ADMIN" ? "/admin" : "/dashboard";
        router.push(destination);
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    setSendingCode(true);
    setError("");
    try {
      const res = await fetch("/api/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setCodeSent(true);
      } else {
        setError("Erreur lors de l'envoi du code");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerifyCode() {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/email/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      if (res.ok) {
        setNeedsVerification(false);
        setCodeSent(false);
        setVerificationCode("");
        // Re-tenter la connexion automatiquement
        handleSubmit(new Event("submit") as unknown as React.FormEvent);
      } else {
        setError("Code invalide ou expiré");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations V2 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-5 shadow-xl shadow-emerald-500/20 border border-border/50 overflow-hidden p-1.5">
            <img src="/logo.jpeg" alt="Nkap Control Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nkap Control</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Gestion financière pour PME camerounaises</p>
        </div>

        <Card className="shadow-2xl shadow-emerald-500/5 border-border bg-card/80 backdrop-blur-2xl">
          <CardHeader className="space-y-1.5 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Connexion</CardTitle>
            <CardDescription className="text-[15px]">
              Entrez vos identifiants pour accéder à votre espace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="font-semibold text-foreground/80">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@entreprise.cm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-background border-border/60 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-semibold text-foreground/80">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-background border-border/60 focus-visible:ring-emerald-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {needsVerification && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <p className="text-sm text-amber-400 font-medium">
                  Votre email n&apos;est pas encore vérifié.
                </p>
                {!codeSent ? (
                  <Button
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    variant="outline"
                    className="w-full h-10 text-sm border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    {sendingCode ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer un code de vérification"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Un code a été envoyé à {email}</p>
                    <Input
                      placeholder="Code à 6 chiffres"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="h-10 bg-background border-border/60 text-center text-lg tracking-widest"
                    />
                    <Button
                      onClick={handleVerifyCode}
                      disabled={verifying || verificationCode.length !== 6}
                      className="w-full h-10 text-sm bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        "Vérifier"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2 pb-8">
            <p className="text-[15px] text-muted-foreground text-center">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                Créer un compte
              </Link>
            </p>
            <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-center mx-auto mt-2">
              <p className="text-xs text-muted-foreground font-medium">
                Demo: <span className="text-foreground">demo@nkapcontrol.com</span> / <span className="text-foreground">demo123456</span>
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground/60 text-center">
              <Link href="/terms" className="text-emerald-500/70 hover:underline">CGU</Link>
              {" · "}
              <Link href="/privacy" className="text-emerald-500/70 hover:underline">Confidentialité</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
