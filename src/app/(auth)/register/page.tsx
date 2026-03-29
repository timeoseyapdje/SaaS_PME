"use client";

import { useState } from "react";
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
import { TrendingUp, Loader2, AlertCircle, CheckCircle2, ChevronLeft, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Step 1: Company info
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [taxId, setTaxId] = useState("");
  const [city, setCity] = useState("Yaoundé");
  const [phone, setPhone] = useState("");

  // Step 2: User info
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName) {
      setError("Le nom de l'entreprise est obligatoire");
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          legalName,
          registrationNo,
          taxId,
          city,
          phone,
          userName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px]" />
        </div>
        <div className="w-full max-w-md text-center relative z-10 animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-6 shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Compte créé !</h2>
          <p className="text-muted-foreground text-lg">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations V2 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[30%] -left-[10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-5 shadow-xl shadow-emerald-500/20 border border-border/50 overflow-hidden p-1.5">
            <img src="/logo.jpeg" alt="Nkap Control Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nkap Control</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Créer votre compte entreprise</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8 gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm transition-all duration-300 ${step >= 1 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"}`}>
            1
          </div>
          <div className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= 2 ? "bg-emerald-600" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm transition-all duration-300 ${step >= 2 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"}`}>
            2
          </div>
        </div>

        <Card className="shadow-2xl shadow-emerald-500/5 border-white/5 bg-zinc-950/60 backdrop-blur-2xl">
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="space-y-1.5 pb-6">
                <CardTitle className="text-xl font-bold tracking-tight">Informations de l&apos;entreprise</CardTitle>
                <CardDescription className="text-sm">Étape 1 sur 2</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNextStep} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="font-semibold text-foreground/80">Nom commercial *</Label>
                    <Input
                      id="companyName"
                      placeholder="Ex: TechSarl Cameroun"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalName" className="font-semibold text-foreground/80">Raison sociale</Label>
                    <Input
                      id="legalName"
                      placeholder="Ex: TechSarl SARL au capital de..."
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNo" className="font-semibold text-foreground/80">N° RCCM</Label>
                      <Input
                        id="registrationNo"
                        placeholder="RC/YAO/..."
                        value={registrationNo}
                        onChange={(e) => setRegistrationNo(e.target.value)}
                        className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId" className="font-semibold text-foreground/80">NIU</Label>
                      <Input
                        id="taxId"
                        placeholder="M0123..."
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-semibold text-foreground/80">Ville</Label>
                      <Input
                        id="city"
                        placeholder="Yaoundé"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-semibold text-foreground/80">Téléphone</Label>
                      <Input
                        id="phone"
                        placeholder="+237 6xx xxx xxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-2 text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                    Continuer
                  </Button>
                </form>
              </CardContent>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="space-y-1.5 pb-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setStep(1)}
                    className="h-8 w-8 rounded-full hover:bg-muted/80 shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight">Compte administrateur</CardTitle>
                    <CardDescription className="text-sm">Étape 2 sur 2</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="font-semibold text-foreground/80">Votre nom complet *</Label>
                    <Input
                      id="userName"
                      placeholder="Jean Dupont"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold text-foreground/80">Adresse email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@entreprise.cm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold text-foreground/80">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-semibold text-foreground/80">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 mt-2 text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      "Créer mon compte"
                    )}
                  </Button>
                </form>
              </CardContent>
            </div>
          )}
          <CardFooter className="flex flex-col gap-3 pt-2 pb-8">
            <p className="text-[15px] text-muted-foreground text-center w-full">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                Se connecter
              </Link>
            </p>
            <p className="text-[11px] text-muted-foreground/60 text-center">
              En créant un compte, vous acceptez nos{" "}
              <Link href="/terms" className="text-emerald-500/70 hover:underline">CGU</Link>
              {" "}et notre{" "}
              <Link href="/privacy" className="text-emerald-500/70 hover:underline">Politique de confidentialité</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
