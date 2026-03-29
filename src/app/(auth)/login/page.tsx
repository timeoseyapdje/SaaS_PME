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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
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

        <Card className="shadow-2xl shadow-emerald-500/5 border-white/5 bg-zinc-950/60 backdrop-blur-2xl">
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
                  <Link href="#" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
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
                Demo: <span className="text-foreground">demo@nkapcontrol.cm</span> / <span className="text-foreground">demo123456</span>
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
