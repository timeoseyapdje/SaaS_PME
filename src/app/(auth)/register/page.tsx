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
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ArrowLeft,
  Building2,
  UserPlus,
  Search,
  MapPin,
  Users,
  Clock,
} from "lucide-react";

type Mode = "create_company" | "join_company";

interface SearchResult {
  id: string;
  name: string;
  city: string | null;
  _count: { users: number };
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<Mode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  // Step 1: User info
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 3a: Company info (create)
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [taxId, setTaxId] = useState("");
  const [city, setCity] = useState("Yaoundé");
  const [phone, setPhone] = useState("");

  // Step 3b: Join company
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<SearchResult | null>(null);
  const [joinMessage, setJoinMessage] = useState("");

  function handleStep1(e: React.FormEvent) {
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
    setStep(2);
  }

  function handleChooseMode(m: Mode) {
    setMode(m);
    setError("");
    setStep(3);
  }

  async function handleSearchCompanies() {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/companies/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body =
        mode === "create_company"
          ? {
              mode: "create_company",
              companyName,
              legalName,
              registrationNo,
              taxId,
              city,
              phone,
              userName,
              email,
              password,
            }
          : {
              mode: "join_company",
              companyId: selectedCompany?.id,
              message: joinMessage,
              userName,
              email,
              password,
            };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      if (data.pending) {
        setPending(true);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/onboarding"), 2000);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (pending) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px]" />
        </div>
        <div className="w-full max-w-md text-center relative z-10 animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-full mb-6 shadow-xl shadow-amber-500/30">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Demande envoyée !</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Votre demande d&apos;adhésion a été envoyée. Vous serez notifié dès qu&apos;un responsable l&apos;aura traitée.
          </p>
          <Link href="/login">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Aller à la connexion
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px]" />
        </div>
        <div className="w-full max-w-md text-center relative z-10 animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-6 shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Compte créé !</h2>
          <p className="text-muted-foreground text-lg">Découvrez la plateforme en quelques étapes...</p>
        </div>
      </div>
    );
  }

  const totalSteps = 3;
  const currentStepLabel =
    step === 1
      ? "Votre compte"
      : step === 2
      ? "Mode d'inscription"
      : mode === "create_company"
      ? "Votre entreprise"
      : "Rejoindre une entreprise";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
          <p className="text-muted-foreground mt-2 text-[15px]">{currentStepLabel}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8 gap-3">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm transition-all duration-300 ${
                  step >= s ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {s}
              </div>
              {i < 2 && (
                <div
                  className={`h-1 w-8 rounded-full transition-all duration-500 ${
                    step > s ? "bg-emerald-600" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-2xl shadow-emerald-500/5 border-border bg-card/80 backdrop-blur-2xl">
          {/* Step 1: Account info */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="space-y-1.5 pb-6">
                <CardTitle className="text-xl font-bold tracking-tight">Créer votre compte</CardTitle>
                <CardDescription className="text-sm">Étape 1 sur {totalSteps}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStep1} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="font-semibold text-foreground/80">Nom complet *</Label>
                    <Input id="userName" placeholder="Jean Dupont" value={userName} onChange={(e) => setUserName(e.target.value)} required className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold text-foreground/80">Email *</Label>
                    <Input id="email" type="email" placeholder="vous@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold text-foreground/80">Mot de passe *</Label>
                    <Input id="password" type="password" placeholder="Minimum 6 caractères" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-semibold text-foreground/80">Confirmer *</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                  </div>
                  <Button type="submit" className="w-full h-12 mt-2 text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                    Continuer
                  </Button>
                </form>
              </CardContent>
            </div>
          )}

          {/* Step 2: Choose mode */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="space-y-1.5 pb-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="h-8 w-8 rounded-full hover:bg-muted/80 shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight">Comment souhaitez-vous continuer ?</CardTitle>
                    <CardDescription className="text-sm">Étape 2 sur {totalSteps}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => handleChooseMode("create_company")}
                  className="w-full p-5 rounded-xl border border-border bg-background hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                      <Building2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Créer une entreprise</h3>
                      <p className="text-xs text-muted-foreground">
                        Enregistrez votre entreprise et invitez votre équipe à vous rejoindre.
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleChooseMode("join_company")}
                  className="w-full p-5 rounded-xl border border-border bg-background hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <UserPlus className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Rejoindre une entreprise</h3>
                      <p className="text-xs text-muted-foreground">
                        Recherchez et demandez à rejoindre une entreprise déjà enregistrée.
                      </p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </div>
          )}

          {/* Step 3a: Create company */}
          {step === 3 && mode === "create_company" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="space-y-1.5 pb-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setStep(2)} className="h-8 w-8 rounded-full hover:bg-muted/80 shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight">Votre entreprise</CardTitle>
                    <CardDescription className="text-sm">Étape 3 sur {totalSteps}</CardDescription>
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
                    <Label htmlFor="companyName" className="font-semibold text-foreground/80">Nom commercial *</Label>
                    <Input id="companyName" placeholder="Ex: TechSarl Cameroun" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalName" className="font-semibold text-foreground/80">Raison sociale</Label>
                    <Input id="legalName" placeholder="Ex: TechSarl SARL" value={legalName} onChange={(e) => setLegalName(e.target.value)} className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNo" className="font-semibold text-foreground/80">N° RCCM</Label>
                      <Input id="registrationNo" placeholder="RC/YAO/..." value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId" className="font-semibold text-foreground/80">NIU</Label>
                      <Input id="taxId" placeholder="M0123..." value={taxId} onChange={(e) => setTaxId(e.target.value)} className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-semibold text-foreground/80">Ville</Label>
                      <Input id="city" placeholder="Yaoundé" value={city} onChange={(e) => setCity(e.target.value)} className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-semibold text-foreground/80">Téléphone</Label>
                      <Input id="phone" placeholder="+237 6xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 mt-2 text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20" disabled={loading}>
                    {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création en cours...</>) : "Créer mon entreprise"}
                  </Button>
                </form>
              </CardContent>
            </div>
          )}

          {/* Step 3b: Join company */}
          {step === 3 && mode === "join_company" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="space-y-1.5 pb-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setStep(2)} className="h-8 w-8 rounded-full hover:bg-muted/80 shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight">Rejoindre une entreprise</CardTitle>
                    <CardDescription className="text-sm">Étape 3 sur {totalSteps}</CardDescription>
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

                  {!selectedCompany ? (
                    <>
                      <div className="space-y-2">
                        <Label className="font-semibold text-foreground/80">Rechercher une entreprise</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nom de l'entreprise..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchCompanies())}
                            className="h-11 bg-background border-border/60 focus-visible:ring-emerald-500"
                          />
                          <Button
                            type="button"
                            onClick={handleSearchCompanies}
                            disabled={searching || searchQuery.length < 2}
                            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                          >
                            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {searchResults.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedCompany(c)}
                              className="w-full p-3 rounded-lg border border-border bg-background hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                                  {c.city && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3" />{c.city}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  {c._count.users}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucune entreprise trouvée</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{selectedCompany.name}</p>
                            {selectedCompany.city && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />{selectedCompany.city}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCompany(null)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Changer
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold text-foreground/80">Message (optionnel)</Label>
                        <textarea
                          placeholder="Présentez-vous brièvement..."
                          value={joinMessage}
                          onChange={(e) => setJoinMessage(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 mt-2 text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                        disabled={loading}
                      >
                        {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi en cours...</>) : "Envoyer ma demande"}
                      </Button>
                    </>
                  )}
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
