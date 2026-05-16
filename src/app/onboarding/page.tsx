"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  X,
  BarChart3,
  FileText,
  Users,
  Landmark,
  Package,
  ShoppingCart,
  Link2,
  CheckCircle2,
  ChevronRight,
  Smartphone,
} from "lucide-react";

/* ─── Données des étapes ─── */
const steps = [
  {
    number: "01",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "Créez votre compte & configurez votre entreprise",
    description: "Renseignez le nom, le logo, le RCCM et le NIU de votre entreprise. Tout est prêt en 2 minutes.",
    actions: [
      "Renseignez le nom commercial et la raison sociale",
      "Ajoutez votre numéro RCCM et NIU pour la conformité fiscale",
      "Choisissez votre devise (FCFA par défaut)",
      "Votre tableau de bord est immédiatement opérationnel",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded bg-white/10" />
          <div className="h-2 w-28 bg-muted-foreground/20 rounded" />
        </div>
        <div className="flex gap-2 flex-1">
          <div className="flex flex-col gap-1.5 w-24 flex-shrink-0">
            <div className="h-6 bg-emerald-500/20 border border-emerald-500/30 rounded" />
            <div className="h-6 bg-muted rounded w-4/5" />
            <div className="h-6 bg-muted rounded" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-card border border-border rounded-lg p-2 flex items-center gap-2">
              <div className="h-2 w-16 bg-muted-foreground/30 rounded" />
              <div className="ml-auto h-5 w-14 bg-emerald-600/40 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["RCCM", "NIU", "Ville", "Tél"].map((l) => (
                <div key={l} className="h-9 bg-card border border-border rounded-lg p-2">
                  <div className="h-1.5 w-8 bg-muted-foreground/30 rounded mb-1.5" />
                  <div className="h-2 w-12 bg-muted-foreground/20 rounded" />
                </div>
              ))}
            </div>
            <div className="h-7 bg-emerald-600/30 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <div className="h-2 w-16 bg-emerald-400/60 rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    title: "Ajoutez vos clients & fournisseurs",
    description: "Chaque client a sa fiche avec l'historique complet des factures, commandes et transactions.",
    actions: [
      "Renseignez nom, email, téléphone et adresse",
      "Choisissez le type : Particulier ou Entreprise",
      "Consultez l'historique complet de chaque contact",
      "Lancez une facture ou une commande depuis la fiche client",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="flex items-center justify-between mb-1">
          <div className="h-2.5 w-16 bg-white/70 rounded font-bold" />
          <div className="h-6 w-20 bg-emerald-600/40 border border-emerald-500/30 rounded-lg" />
        </div>
        <div className="flex gap-2 mb-1">
          {["Tous", "Entreprise", "Particulier"].map((t, i) => (
            <div key={t} className={`h-5 px-2 rounded-full text-[8px] flex items-center ${i === 0 ? "bg-emerald-600/40 border border-emerald-500/30" : "bg-muted border border-border"}`}>
              <div className="h-1 w-5 bg-muted-foreground/30 rounded" />
            </div>
          ))}
        </div>
        {[
          { color: "bg-blue-500/60", w: "w-20" },
          { color: "bg-emerald-500/60", w: "w-16" },
          { color: "bg-amber-500/60", w: "w-24" },
          { color: "bg-purple-500/60", w: "w-14" },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-2 h-8 bg-card/70 border border-border rounded-lg px-2">
            <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-1.5 w-16 bg-muted-foreground/30 rounded mb-1" />
              <div className="h-1 w-10 bg-muted-foreground/20 rounded" />
            </div>
            <div className={`h-4 ${row.w} ${row.color} rounded-full`} />
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    icon: Package,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    title: "Gérez votre catalogue & vos stocks",
    description: "Créez vos produits, définissez les prix et suivez les stocks en temps réel avec alertes automatiques.",
    actions: [
      "Créez des produits avec SKU, prix et coût",
      "Organisez par catégories hiérarchiques",
      "Définissez un seuil d'alerte stock bas",
      "L'inventaire se met à jour automatiquement à chaque commande",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="flex items-center justify-between mb-1">
          <div className="h-2.5 w-20 bg-white/70 rounded" />
          <div className="h-6 w-20 bg-amber-600/40 border border-amber-500/30 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {[
            { name: "Produit A", stock: 45, color: "bg-emerald-500/60" },
            { name: "Produit B", stock: 3, color: "bg-rose-500/60" },
            { name: "Produit C", stock: 12, color: "bg-amber-500/60" },
            { name: "Produit D", stock: 28, color: "bg-emerald-500/60" },
          ].map((p, i) => (
            <div key={i} className="bg-card/70 border border-border rounded-xl p-2 flex flex-col gap-1">
              <div className="h-8 bg-muted rounded-lg mb-1" />
              <div className="h-1.5 w-14 bg-muted-foreground/30 rounded" />
              <div className="flex items-center justify-between mt-1">
                <div className="h-2 w-10 bg-muted-foreground/20 rounded" />
                <div className={`h-3.5 w-9 ${p.color} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "04",
    icon: ShoppingCart,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Créez & suivez vos commandes",
    description: "Sélectionnez client + produits, la TVA se calcule automatiquement. Déduisez le stock en un clic.",
    actions: [
      "Sélectionnez le client et ajoutez les produits",
      "TVA 19,25% calculée automatiquement",
      "Passez à « Confirmé » pour déduire le stock",
      "Convertissez en facture en un seul clic",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2.5 w-20 bg-white/70 rounded" />
          <div className="ml-auto flex gap-1">
            {["Pending", "Confirmed", "Delivered"].map((s, i) => (
              <div key={s} className={`h-4 px-1.5 rounded-full text-[7px] ${i === 1 ? "bg-emerald-600/50 border border-emerald-500/40" : "bg-muted border border-border"}`}>
                <div className="h-1 w-5 bg-muted-foreground/30 rounded mt-1.5" />
              </div>
            ))}
          </div>
        </div>
        {[
          { status: "bg-emerald-500/60", label: "Livré" },
          { status: "bg-amber-500/60", label: "En cours" },
          { status: "bg-blue-500/60", label: "Confirmé" },
          { status: "bg-muted-foreground/40", label: "Brouillon" },
        ].map((o, i) => (
          <div key={i} className="flex items-center gap-2 h-8 bg-card/70 border border-border rounded-lg px-2">
            <div className="h-1.5 w-12 bg-muted-foreground/30 rounded" />
            <div className="flex-1 h-1.5 bg-muted-foreground/20/50 rounded" />
            <div className={`h-4 w-12 ${o.status} rounded-full`} />
          </div>
        ))}
        <div className="mt-auto h-6 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center px-2 gap-1">
          <div className="h-1.5 w-24 bg-purple-400/40 rounded" />
          <ArrowRight className="w-2.5 h-2.5 text-purple-400 ml-auto" />
        </div>
      </div>
    ),
  },
  {
    number: "05",
    icon: FileText,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    title: "Créez & envoyez vos factures",
    description: "Numérotation automatique, TVA OHADA intégrée, export PDF professionnel, envoi direct par email.",
    actions: [
      "Numérotation auto : FAC-2026-00001",
      "Lignes produits/services avec TVA 19,25%",
      "Export PDF avec logo entreprise",
      "Statuts : Brouillon → Envoyée → Payée → En retard",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="h-2.5 w-24 bg-white/70 rounded mb-1" />
            <div className="h-1.5 w-16 bg-muted-foreground/30 rounded" />
          </div>
          <div className="h-5 w-14 bg-rose-500/30 border border-rose-500/30 rounded-full" />
        </div>
        <div className="flex-1 bg-card/60 border border-border rounded-xl p-2 flex flex-col gap-1.5">
          <div className="flex justify-between text-[8px] text-muted-foreground pb-1 border-b border-border">
            <span>Description</span><span>Qté</span><span>Total</span>
          </div>
          {["Service conseil", "Formation", "Maintenance"].map((item, i) => (
            <div key={i} className="flex items-center gap-1 h-5">
              <div className="flex-1 h-1.5 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 w-4 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 w-10 bg-muted-foreground/30 rounded" />
            </div>
          ))}
          <div className="mt-auto pt-1.5 border-t border-border space-y-1">
            <div className="flex justify-between">
              <div className="h-1.5 w-10 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 w-12 bg-muted-foreground/30 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-1.5 w-8 bg-muted-foreground/20 rounded" />
              <div className="h-1.5 w-10 bg-amber-500/50 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-2 w-10 bg-muted-foreground/30 rounded" />
              <div className="h-2 w-14 bg-emerald-500/60 rounded" />
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 h-6 bg-muted border border-border rounded-lg" />
          <div className="flex-1 h-6 bg-rose-600/30 border border-rose-500/30 rounded-lg" />
        </div>
      </div>
    ),
  },
  {
    number: "06",
    icon: Link2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "Générez des liens de paiement Mobile Money",
    description: "Créez un lien de paiement et partagez-le par WhatsApp. Votre client paie via MTN ou Orange Money.",
    actions: [
      "Définissez le montant et une date d'expiration",
      "Copiez et partagez le lien par WhatsApp, SMS ou email",
      "Le client paie via MTN Money ou Orange Money",
      "Vous êtes notifié dès que le paiement est confirmé",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="h-2.5 w-20 bg-white/70 rounded mb-1" />
        <div className="flex-1 bg-card/60 border border-border rounded-xl p-2.5 flex flex-col gap-2">
          <div className="space-y-1.5">
            <div className="h-1.5 w-10 bg-muted-foreground/30 rounded" />
            <div className="h-6 bg-muted border border-border rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-12 bg-muted-foreground/30 rounded" />
            <div className="h-6 bg-muted border border-border rounded-lg" />
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 h-10 bg-amber-500/15 border border-amber-500/30 rounded-lg flex flex-col items-center justify-center gap-1">
              <div className="w-4 h-4 rounded-full bg-amber-500/40" />
              <div className="h-1 w-8 bg-amber-400/40 rounded" />
            </div>
            <div className="flex-1 h-10 bg-orange-500/15 border border-orange-500/30 rounded-lg flex flex-col items-center justify-center gap-1">
              <div className="w-4 h-4 rounded-full bg-orange-500/40" />
              <div className="h-1 w-8 bg-orange-400/40 rounded" />
            </div>
          </div>
          <div className="mt-auto h-6 bg-cyan-600/30 border border-cyan-500/30 rounded-lg flex items-center justify-center gap-1">
            <Link2 className="w-2.5 h-2.5 text-cyan-400" />
            <div className="h-1.5 w-14 bg-cyan-400/50 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "07",
    icon: Landmark,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Suivez votre trésorerie multi-comptes",
    description: "Banque, Caisse, MTN Money, Orange Money — un seul tableau de bord pour tous vos flux.",
    actions: [
      "Ajoutez vos comptes : Banque, Caisse, Mobile Money",
      "Enregistrez chaque entrée et sortie",
      "Consultez les soldes en temps réel",
      "Visualisez l'évolution de votre trésorerie",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="h-2.5 w-16 bg-white/70 rounded mb-1" />
        <div className="grid grid-cols-2 gap-1.5 flex-shrink-0">
          {[
            { name: "Banque", color: "bg-blue-500/60" },
            { name: "Caisse", color: "bg-emerald-500/60" },
            { name: "MTN", color: "bg-amber-500/60" },
            { name: "Orange", color: "bg-orange-500/60" },
          ].map((a) => (
            <div key={a.name} className="h-10 bg-card/70 border border-border rounded-xl p-1.5 flex flex-col gap-1">
              <div className={`h-1.5 w-8 ${a.color} rounded`} />
              <div className="h-2 w-12 bg-muted-foreground/30 rounded" />
            </div>
          ))}
        </div>
        <div className="flex-1 bg-card/60 border border-border rounded-xl p-2 flex flex-col">
          <div className="h-1.5 w-16 bg-muted-foreground/30 rounded mb-2" />
          <div className="flex-1 flex items-end gap-1">
            {[40, 60, 35, 75, 55, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center justify-end h-full">
                <div className="w-full bg-teal-500/40 rounded-t" style={{ height: `${h}%` }} />
                <div className="w-full bg-rose-500/20 rounded-t" style={{ height: `${h * 0.4}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "08",
    icon: Smartphone,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Configurez votre compte de reversement automatique",
    description: "Dès qu'un client paie via MTN ou Orange Money, l'argent est reversé automatiquement sur votre compte mobile money.",
    actions: [
      "Allez dans Trésorerie → Ajouter un compte",
      "Choisissez MTN Mobile Money ou Orange Money",
      "Entrez votre numéro de téléphone qui recevra les virements",
      "Cochez « Compte principal » — les reversements arriveront automatiquement",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="h-2.5 w-20 bg-white/70 rounded mb-1" />
        <div className="bg-card/60 border border-teal-500/30 rounded-xl p-2.5 flex flex-col gap-2">
          <div className="space-y-1.5">
            <div className="h-1.5 w-14 bg-muted-foreground/30 rounded" />
            <div className="h-6 bg-muted border border-border rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-12 bg-muted-foreground/30 rounded" />
            <div className="flex gap-1.5">
              <div className="flex-1 h-8 bg-amber-500/15 border border-amber-500/40 rounded-lg flex items-center justify-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="h-1 w-8 bg-amber-400/50 rounded" />
              </div>
              <div className="flex-1 h-8 bg-orange-500/15 border border-orange-500/40 rounded-lg flex items-center justify-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500/60" />
                <div className="h-1 w-8 bg-orange-400/50 rounded" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-20 bg-muted-foreground/30 rounded" />
            <div className="h-6 bg-muted border border-border rounded-lg flex items-center px-2 gap-1">
              <Smartphone className="w-2.5 h-2.5 text-muted-foreground/50" />
              <div className="h-1.5 w-16 bg-muted-foreground/20 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-3.5 h-3.5 rounded border-2 border-teal-500/60 bg-teal-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-sm bg-teal-500" />
            </div>
            <div className="h-1.5 w-20 bg-teal-400/40 rounded" />
          </div>
          <div className="mt-auto h-6 bg-teal-600/30 border border-teal-500/30 rounded-lg flex items-center justify-center">
            <div className="h-1.5 w-16 bg-teal-400/50 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          <div className="h-1.5 w-32 bg-teal-400/30 rounded" />
        </div>
      </div>
    ),
  },
  {
    number: "09",
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "Analysez vos performances en temps réel",
    description: "Votre tableau de bord centralise tout : CA, dépenses, résultat net, alertes et tendances.",
    actions: [
      "KPIs actualisés automatiquement",
      "Graphique revenus vs dépenses sur 6 mois",
      "Alertes factures en retard et stock faible",
      "Export rapports TVA et IS pour votre comptable",
    ],
    screen: (
      <div className="w-full h-full bg-background flex flex-col p-3 gap-2">
        <div className="h-2.5 w-24 bg-white/70 rounded mb-1" />
        <div className="flex gap-1.5 flex-shrink-0">
          {[
            { color: "bg-emerald-500/50", border: "border-emerald-500/25" },
            { color: "bg-rose-500/50", border: "border-rose-500/25" },
            { color: "bg-amber-500/50", border: "border-amber-500/25" },
            { color: "bg-blue-500/50", border: "border-blue-500/25" },
          ].map((k, i) => (
            <div key={i} className={`flex-1 h-12 bg-card/70 border ${k.border} rounded-xl p-1.5`}>
              <div className="h-1.5 w-8 bg-muted-foreground/30 rounded mb-1.5" />
              <div className={`h-2.5 w-10 ${k.color} rounded`} />
            </div>
          ))}
        </div>
        <div className="flex-1 bg-card/60 border border-border rounded-xl p-2 flex flex-col">
          <div className="h-1.5 w-20 bg-muted-foreground/30 rounded mb-2" />
          <div className="flex-1 flex items-end gap-1 px-0.5">
            {[30, 50, 40, 70, 55, 80, 65].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center justify-end h-full">
                <div className="w-full bg-emerald-500/50 rounded-t" style={{ height: `${h}%` }} />
                <div className="w-full bg-rose-500/25 rounded-t" style={{ height: `${h * 0.45}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

/* ─── Composant device frame ─── */
function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      {/* Glow */}
      <div className="absolute -inset-2 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-2xl blur-xl opacity-60" />
      {/* Browser chrome */}
      <div className="relative rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="h-7 bg-card border-b border-border flex items-center px-2.5 gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-500/70" />
          <div className="w-2 h-2 rounded-full bg-amber-500/70" />
          <div className="w-2 h-2 rounded-full bg-green-500/70" />
          <div className="h-3.5 flex-1 mx-2 bg-muted border border-border rounded flex items-center justify-center">
            <span className="text-[7px] text-muted-foreground">nkapcontrol.com</span>
          </div>
        </div>
        {/* Screen content */}
        <div className="aspect-[4/3]">{children}</div>
      </div>
    </div>
  );
}

/* ─── Page principale ─── */
export default function OnboardingPage() {
  return (
    <div className="min-h-[100svh] bg-background text-foreground" style={{ overflowX: "hidden" }}>
      {/* ─── Barre de skip en haut ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-white overflow-hidden p-0.5">
              <img src="/logo.jpeg" alt="Nkap Control" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm text-foreground hidden sm:block">Nkap Control</span>
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground text-center hidden sm:block">
            Suivez le guide ou connectez-vous directement à votre tableau de bord
          </p>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted-foreground/20 active:bg-muted-foreground/30 text-foreground border border-border/50 transition-colors touch-manipulation flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Passer le guide
          </Link>
        </div>
      </div>

      {/* ─── Hero ─── */}
      <section className="pt-28 pb-12 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-foreground text-xs font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Guide de démarrage — 9 étapes
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            Bienvenue sur{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Nkap Control
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Suivez ces 9 étapes pour maîtriser la plateforme et tirer le meilleur de votre outil de gestion.
          </p>
        </motion.div>
      </section>

      {/* ─── Étapes ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-6 sm:space-y-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={`rounded-2xl border ${step.border} bg-card/60 overflow-hidden`}
          >
            <div className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-0`}>
              {/* ── Texte ── */}
              <div className="flex-1 p-5 sm:p-7 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <span className={`text-xs font-bold tracking-widest uppercase ${step.color}`}>
                    Étape {step.number}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.actions.map((action, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                      <ChevronRight className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${step.color}`} />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Screen ── */}
              <div className={`lg:w-72 xl:w-80 ${step.bg} flex items-center justify-center p-5 sm:p-6 border-t border-border/40 lg:border-t-0 ${i % 2 === 0 ? "lg:border-l" : "lg:border-r"} ${step.border}`}>
                <ScreenFrame>{step.screen}</ScreenFrame>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ─── CTA final ─── */}
      <section className="px-4 sm:px-6 pb-20 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-8 sm:p-12 text-center border border-white/10 shadow-2xl"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-sm font-medium mb-5">
              <CheckCircle2 className="w-4 h-4" />
              Guide terminé — vous êtes prêt !
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Lancez-vous maintenant
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mb-7 max-w-md mx-auto">
              Connectez-vous pour accéder à votre tableau de bord et commencer à facturer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 font-semibold bg-white text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 rounded-full shadow-lg touch-manipulation">
                <Link href="/dashboard">
                  Aller au tableau de bord
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto h-12 px-8 font-semibold rounded-full text-white hover:bg-white/20 active:bg-white/30 border border-white/30 touch-manipulation">
                <Link href="/">Retour à l&apos;accueil</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white overflow-hidden p-0.5">
              <img src="/logo.jpeg" alt="" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-bold text-foreground">Nkap Control</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Nkap Control</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/#features" className="hover:text-foreground transition-colors">Fonctionnalités</Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">Tarifs</Link>
            <Link href="/help" className="hover:text-foreground transition-colors">Aide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
