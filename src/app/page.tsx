"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Layers,
  CheckCircle2,
  FileText,
  Landmark,
  Users,
  Star,
  Check,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const features = [
  {
    title: "Tableau de bord intelligent",
    description: "Visualisez vos KPIs, revenus, depenses et tresorerie en temps reel avec des graphiques clairs.",
    icon: BarChart3,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Facturation conforme",
    description: "Creez des factures avec calcul automatique de la TVA (19,25%) et generation de numeros conformes.",
    icon: FileText,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Tresorerie multi-comptes",
    description: "Gerez vos comptes bancaires, MTN Money, Orange Money et caisse depuis une seule interface.",
    icon: Landmark,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Facturation rapide",
    description: "Creez, envoyez et suivez le paiement de vos factures en quelques clics.",
    icon: Zap,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Gestion clients et fournisseurs",
    description: "Centralisez tous vos contacts, suivez les factures par client et l'historique des transactions.",
    icon: Users,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Rapports fiscaux OHADA",
    description: "Compte de resultat, bilan simplifie, calcul TVA et IS conformes a la legislation camerounaise.",
    icon: ShieldCheck,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "FCFA/mois",
    description: "Pour demarrer et tester la plateforme",
    features: [
      "1 utilisateur",
      "20 factures/mois",
      "Tableau de bord basique",
      "Gestion clients",
      "Export PDF",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: "3 000",
    period: "FCFA/mois",
    description: "Pour les PME en croissance",
    features: [
      "5 utilisateurs",
      "Factures illimitees",
      "Tableau de bord avance",
      "Gestion tresorerie multi-comptes",
      "Rapports fiscaux (TVA, IS)",
      "Nkap AI (10 messages/jour)",
      "Support prioritaire",
      "Export Excel et PDF",
    ],
    cta: "Choisir Pro",
    popular: true,
  },
  {
    name: "Max",
    price: "10 000",
    period: "FCFA/mois",
    description: "Pour les PME ambitieuses",
    features: [
      "Utilisateurs illimites",
      "Tout du plan Pro",
      "Nkap AI illimite",
      "Personnalisation avancee (logo, couleurs, modeles)",
      "API personnalisee",
      "Formation equipe dediee",
      "Support telephonique 24/7",
      "Rapports personnalises",
    ],
    cta: "Choisir Max",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Jean-Pierre Mbarga",
    role: "Gerant, TechSarl Yaounde",
    text: "Depuis que j'utilise Nkap Control, je gagne 2 heures par jour sur ma comptabilite. Le calcul automatique de la TVA est un vrai plus.",
    rating: 5,
  },
  {
    name: "Celine Fotso",
    role: "Directrice, Fotso Trading Douala",
    text: "Enfin un logiciel qui comprend le contexte camerounais ! Les paiements Mobile Money integres et les rapports OHADA sont exactement ce qu'il nous fallait.",
    rating: 5,
  },
  {
    name: "Paul Nganou",
    role: "Expert-comptable, Cabinet Nganou",
    text: "Je recommande Nkap Control a tous mes clients PME. Les rapports fiscaux sont conformes et me facilitent le travail en fin d'exercice.",
    rating: 5,
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100svh] bg-zinc-950 selection:bg-emerald-500/30 relative" style={{ overflowX: "hidden" }}>
      {/* Background — absolute (pas fixed) pour éviter les bugs iOS GPU */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-20 [-webkit-mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
        {/* Réduit de blur-[120px] à blur-3xl pour iOS GPU */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/8 blur-3xl rounded-full" />
      </div>

      {/* Floating Navbar */}
      <header className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[94%] sm:w-[95%] max-w-7xl z-50 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-amber-500/5 opacity-50 rounded-2xl pointer-events-none" />
        <div className="relative px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 bg-white overflow-hidden p-0.5">
              <img src="/logo.jpeg" alt="Nkap Control Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">Nkap Control</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="#features" className="hover:text-white transition-colors">Fonctionnalites</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="#testimonials" className="hover:text-white transition-colors">References</Link>
            <Link href="/help" className="hover:text-white transition-colors">Aide</Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Se connecter
            </Link>
            <Button asChild className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-5 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all text-sm">
              <Link href="/register">Commencer</Link>
            </Button>
          </div>

          {/* Mobile: login + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login" className="text-xs font-medium text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-full border border-zinc-700 hover:border-zinc-500">
              Connexion
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white active:bg-zinc-700 transition-colors touch-manipulation"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/60 px-4 py-4 space-y-1">
            {[
              { href: "/", label: "Accueil" },
              { href: "#features", label: "Fonctionnalites" },
              { href: "#pricing", label: "Tarifs" },
              { href: "#testimonials", label: "References" },
              { href: "/help", label: "Aide" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-zinc-800/40">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-semibold">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Commencer gratuitement</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-24 sm:pt-32 pb-16 pb-safe">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 sm:pt-16 pb-16 sm:pb-24">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium mb-8 shadow-xl">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              Conçu pour les PME camerounaises
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-5 sm:mb-6 leading-tight">
              La gestion financière{" "}
              <span className="text-gradient animate-shimmer">
                réinventée pour les PME.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl leading-relaxed">
              Facturez, suivez votre tresorerie, gerez vos clients et produisez vos rapports fiscaux conformes OHADA. Le tout en FCFA, avec MTN Money et Orange Money integres.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 text-sm sm:text-base font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full shadow-xl shadow-emerald-500/20 group touch-manipulation">
                <Link href="/register">
                  Demarrer gratuitement
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 text-sm sm:text-base font-semibold rounded-full border-zinc-600 bg-zinc-900/80 text-white hover:bg-zinc-800 active:bg-zinc-700 touch-manipulation">
                <Link href="/onboarding">Voir le tutoriel</Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Plan gratuit disponible</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Paiement Mobile Money</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Conforme OHADA</div>
            </motion.div>
          </motion.div>

          {/* ─── Device mockup — adaptatif ─── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 sm:mt-20 relative mx-auto flex justify-center"
          >
            {/* ══ MOBILE — Smartphone frame (< 640px) ══ */}
            <div className="block sm:hidden relative group">
              <div className="absolute -inset-3 bg-gradient-to-b from-emerald-500 to-amber-500 rounded-[48px] blur-2xl opacity-20 group-hover:opacity-35 transition duration-1000" />
              {/* Phone body */}
              <div className="relative w-[220px] h-[440px] rounded-[40px] border-[5px] border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col">
                {/* Status bar */}
                <div className="h-9 bg-zinc-900 flex items-center justify-between px-5 pt-1 flex-shrink-0">
                  <span className="text-[9px] font-semibold text-zinc-400">9:41</span>
                  {/* Dynamic island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full" />
                  <div className="flex gap-1 items-center">
                    <div className="w-2.5 h-1.5 rounded-sm bg-zinc-400" />
                    <div className="w-1 h-1 rounded-full bg-zinc-400" />
                  </div>
                </div>
                {/* Screen */}
                <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
                  {/* App header */}
                  <div className="h-8 bg-zinc-900 border-b border-zinc-800/60 flex items-center px-3 gap-2 flex-shrink-0">
                    <div className="w-4 h-4 rounded bg-emerald-500/30" />
                    <div className="h-2 w-20 bg-zinc-700 rounded" />
                  </div>
                  {/* KPI cards stacked */}
                  <div className="p-2.5 flex flex-col gap-2 flex-shrink-0">
                    <div className="flex gap-2">
                      <div className="flex-1 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                        <div className="h-1.5 w-8 bg-emerald-500/40 rounded mb-1.5" />
                        <div className="h-3 w-12 bg-emerald-500/50 rounded mb-1" />
                        <div className="h-1.5 w-6 bg-emerald-500/20 rounded" />
                      </div>
                      <div className="flex-1 h-14 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                        <div className="h-1.5 w-8 bg-rose-500/40 rounded mb-1.5" />
                        <div className="h-3 w-12 bg-rose-500/50 rounded mb-1" />
                        <div className="h-1.5 w-6 bg-rose-500/20 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-14 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                        <div className="h-1.5 w-8 bg-amber-500/40 rounded mb-1.5" />
                        <div className="h-3 w-12 bg-amber-500/50 rounded mb-1" />
                        <div className="h-1.5 w-6 bg-amber-500/20 rounded" />
                      </div>
                      <div className="flex-1 h-14 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                        <div className="h-1.5 w-8 bg-blue-500/40 rounded mb-1.5" />
                        <div className="h-3 w-12 bg-blue-500/50 rounded mb-1" />
                        <div className="h-1.5 w-6 bg-blue-500/20 rounded" />
                      </div>
                    </div>
                  </div>
                  {/* Chart */}
                  <div className="mx-2.5 flex-1 bg-zinc-900/80 border border-zinc-700/40 rounded-xl p-2.5 flex flex-col min-h-0">
                    <div className="h-2 w-16 bg-zinc-700/60 rounded mb-2 flex-shrink-0" />
                    <div className="flex-1 flex items-end gap-1 px-1">
                      {[30, 50, 40, 70, 55, 80, 65].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-0.5 items-center justify-end h-full">
                          <div className="w-full bg-emerald-500/50 rounded-t-[2px]" style={{ height: `${h}%` }} />
                          <div className="w-full bg-rose-500/30 rounded-t-[2px]" style={{ height: `${h * 0.45}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Invoice list */}
                  <div className="mx-2.5 mt-2 mb-2.5 flex flex-col gap-1.5">
                    {[
                      { w: "w-16", color: "bg-emerald-500/60" },
                      { w: "w-12", color: "bg-amber-500/60" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-2 h-6 bg-zinc-900/60 border border-zinc-800/40 rounded-lg px-2">
                        <div className={`h-1.5 flex-1 bg-zinc-700/50 rounded`} />
                        <div className={`h-3 ${row.w} ${row.color} rounded-full`} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Home indicator */}
                <div className="h-6 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <div className="w-24 h-1 bg-zinc-600 rounded-full" />
                </div>
              </div>
            </div>

            {/* ══ TABLET — iPad frame (640px – 1023px) ══ */}
            <div className="hidden sm:block lg:hidden relative group">
              <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-[36px] blur-2xl opacity-20 group-hover:opacity-35 transition duration-1000" />
              {/* Tablet body — landscape */}
              <div className="relative w-[580px] h-[420px] rounded-[28px] border-[6px] border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col">
                {/* Top bar: camera */}
                <div className="h-6 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-zinc-600 border border-zinc-500" />
                </div>
                {/* Screen */}
                <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
                  {/* App header */}
                  <div className="h-9 bg-zinc-900 border-b border-zinc-800/60 flex items-center justify-between px-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-emerald-500/30 border border-emerald-500/40" />
                      <div className="h-2 w-28 bg-zinc-700 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-zinc-800 rounded-md" />
                      <div className="h-5 w-5 rounded-md bg-emerald-600/40" />
                    </div>
                  </div>
                  {/* Body: sidebar + main */}
                  <div className="flex-1 flex overflow-hidden p-3 gap-3">
                    {/* Sidebar */}
                    <div className="w-36 flex flex-col gap-1.5 flex-shrink-0">
                      <div className="h-7 bg-emerald-500/20 border border-emerald-500/30 rounded-lg w-full" />
                      <div className="h-7 bg-zinc-800/70 rounded-lg w-5/6" />
                      <div className="h-7 bg-zinc-800/70 rounded-lg w-full" />
                      <div className="h-7 bg-zinc-800/70 rounded-lg w-4/5" />
                      <div className="h-px bg-zinc-800/50 my-1" />
                      <div className="h-7 bg-zinc-800/50 rounded-lg w-3/4" />
                      <div className="h-7 bg-zinc-800/50 rounded-lg w-full" />
                      <div className="h-7 bg-zinc-800/50 rounded-lg w-4/6" />
                    </div>
                    {/* Main content */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                      {/* KPI row */}
                      <div className="flex gap-2.5">
                        {[
                          { bg: "bg-emerald-500/10", border: "border-emerald-500/25", bar: "bg-emerald-500" },
                          { bg: "bg-rose-500/10", border: "border-rose-500/25", bar: "bg-rose-500" },
                          { bg: "bg-amber-500/10", border: "border-amber-500/25", bar: "bg-amber-500" },
                          { bg: "bg-blue-500/10", border: "border-blue-500/25", bar: "bg-blue-500" },
                        ].map((k, i) => (
                          <div key={i} className={`flex-1 h-16 ${k.bg} border ${k.border} rounded-xl p-2.5`}>
                            <div className="h-1.5 w-10 bg-zinc-700/60 rounded mb-2" />
                            <div className={`h-3.5 w-14 ${k.bar}/40 rounded mb-1`} />
                            <div className="h-1.5 w-8 bg-zinc-700/40 rounded" />
                          </div>
                        ))}
                      </div>
                      {/* Chart + list row */}
                      <div className="flex-1 flex gap-2.5 min-h-0">
                        {/* Chart */}
                        <div className="flex-1 bg-zinc-900/80 border border-zinc-700/40 rounded-xl p-3 flex flex-col">
                          <div className="h-2 w-24 bg-zinc-700/60 rounded mb-3" />
                          <div className="flex-1 flex items-end gap-1.5 px-1">
                            {[30, 50, 40, 70, 55, 80, 65].map((h, i) => (
                              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center justify-end h-full">
                                <div className="w-full bg-emerald-500/50 rounded-t" style={{ height: `${h}%` }} />
                                <div className="w-full bg-rose-500/30 rounded-t" style={{ height: `${h * 0.5}%` }} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Invoice list */}
                        <div className="w-44 flex-shrink-0 bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-2.5 flex flex-col gap-1.5">
                          <div className="h-2 w-20 bg-zinc-700/60 rounded mb-1" />
                          {[
                            "bg-emerald-500/60",
                            "bg-amber-500/60",
                            "bg-zinc-600/60",
                            "bg-rose-500/60",
                          ].map((color, i) => (
                            <div key={i} className="flex items-center gap-1.5 h-7 bg-zinc-800/50 rounded-lg px-2">
                              <div className="h-1.5 flex-1 bg-zinc-700/50 rounded" />
                              <div className={`h-3.5 w-10 ${color} rounded-full`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Bottom bar */}
                <div className="h-5 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <div className="w-20 h-1 bg-zinc-700 rounded-full" />
                </div>
              </div>
            </div>

            {/* ══ DESKTOP — Browser frame (≥ 1024px) ══ */}
            <div className="hidden lg:block relative group max-w-5xl w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl p-3 xl:p-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
                <div className="rounded-xl overflow-hidden border border-zinc-700/60 bg-zinc-950 shadow-inner aspect-[21/9] flex flex-col">
                  {/* Browser chrome */}
                  <div className="h-10 border-b border-zinc-700/60 flex items-center px-4 gap-3 bg-zinc-900 flex-shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="h-5 w-56 bg-zinc-800 border border-zinc-700/50 rounded-md mx-auto flex items-center justify-center">
                      <span className="text-[9px] text-zinc-500">nkapcontrol.cm/dashboard</span>
                    </div>
                    <div className="flex gap-1.5 ml-auto">
                      <div className="w-4 h-4 rounded bg-zinc-800" />
                      <div className="w-4 h-4 rounded bg-zinc-800" />
                    </div>
                  </div>
                  {/* App layout */}
                  <div className="flex-1 flex overflow-hidden p-3 gap-3">
                    {/* Sidebar */}
                    <div className="w-44 flex flex-col gap-1.5 flex-shrink-0">
                      <div className="h-7 bg-emerald-500/20 border border-emerald-500/30 rounded-lg" />
                      <div className="h-7 bg-zinc-800/70 rounded-lg w-3/4" />
                      <div className="h-7 bg-zinc-800/70 rounded-lg w-5/6" />
                      <div className="h-7 bg-zinc-800/70 rounded-lg w-4/5" />
                      <div className="h-px bg-zinc-800 my-1" />
                      <div className="h-7 bg-zinc-800/50 rounded-lg w-3/5" />
                      <div className="h-7 bg-zinc-800/50 rounded-lg w-4/6" />
                      <div className="h-7 bg-zinc-800/50 rounded-lg w-full" />
                    </div>
                    {/* Main */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                      {/* KPI row */}
                      <div className="flex gap-3">
                        {[
                          { bg: "bg-emerald-500/10", border: "border-emerald-500/30", val: "bg-emerald-500" },
                          { bg: "bg-rose-500/10", border: "border-rose-500/30", val: "bg-rose-500" },
                          { bg: "bg-amber-500/10", border: "border-amber-500/30", val: "bg-amber-500" },
                          { bg: "bg-blue-500/10", border: "border-blue-500/30", val: "bg-blue-500" },
                        ].map((k, i) => (
                          <div key={i} className={`flex-1 ${k.bg} border ${k.border} rounded-xl p-3`}>
                            <div className="h-2 w-12 bg-zinc-700/60 rounded mb-2" />
                            <div className={`h-4 w-16 ${k.val}/40 rounded mb-1`} />
                            <div className="h-1.5 w-10 bg-zinc-700/40 rounded" />
                          </div>
                        ))}
                      </div>
                      {/* Chart + list */}
                      <div className="flex-1 flex gap-3 min-h-0">
                        <div className="flex-1 bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-3 flex flex-col">
                          <div className="h-2.5 w-28 bg-zinc-700/60 rounded mb-3" />
                          <div className="flex-1 flex items-end gap-2 px-1">
                            {[30, 50, 40, 70, 55, 80, 65].map((h, i) => (
                              <div key={i} className="flex-1 flex flex-col gap-0.5 items-center justify-end h-full">
                                <div className="w-full bg-emerald-500/50 rounded-t" style={{ height: `${h}%` }} />
                                <div className="w-full bg-rose-500/30 rounded-t" style={{ height: `${h * 0.5}%` }} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="w-52 flex-shrink-0 bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-3 flex flex-col gap-2">
                          <div className="h-2.5 w-24 bg-zinc-700/60 rounded mb-0.5" />
                          {[
                            "bg-emerald-500/60",
                            "bg-amber-500/60",
                            "bg-zinc-500/50",
                            "bg-rose-500/60",
                            "bg-emerald-500/40",
                          ].map((color, i) => (
                            <div key={i} className="flex items-center gap-2 h-7 bg-zinc-800/50 rounded-lg px-2.5">
                              <div className="h-1.5 flex-1 bg-zinc-700/50 rounded" />
                              <div className={`h-4 w-12 ${color} rounded-full`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">Tout ce dont votre PME a besoin</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Des outils puissants, adaptes au contexte camerounais et a la norme OHADA.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 transition-colors shadow-sm"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feature.bg}`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">Des tarifs simples et transparents</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Choisissez le plan adapte a la taille de votre entreprise. Payez par Mobile Money ou virement bancaire.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col ${plan.popular
                  ? "border-emerald-500 bg-emerald-500/5 shadow-xl shadow-emerald-500/10"
                  : "border-border/50 bg-card/30"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Le plus populaire
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-2 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full h-12 rounded-xl font-semibold ${plan.popular
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Des entrepreneurs camerounais qui ont transforme leur gestion financiere.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-amber-700 p-8 sm:p-16 text-center border border-white/10 shadow-2xl shadow-emerald-500/20">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Pret a propulser votre PME ?</h2>
              <p className="text-emerald-100 text-sm sm:text-lg mb-7 sm:mb-10">
                Rejoignez des centaines d&apos;entreprises camerounaises qui font confiance a Nkap Control pour leur gestion quotidienne.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base font-semibold bg-white text-emerald-600 hover:bg-emerald-50 rounded-full shadow-lg">
                  <Link href="/register">Creer un compte gratuit</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold rounded-full border-white/50 text-white bg-white/10 hover:bg-white/20">
                  <Link href="/onboarding">Voir le tutoriel</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/40 bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-white overflow-hidden p-0.5">
                  <img src="/logo.jpeg" alt="Nkap Control Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold tracking-tight text-foreground">Nkap Control</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La solution de gestion financiere concue pour les PME camerounaises et africaines.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Fonctionnalites</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Tarifs</Link></li>
                <li><Link href="/onboarding" className="hover:text-foreground transition-colors">Tutoriel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground transition-colors">Centre d&apos;aide</Link></li>
                <li><a href="mailto:contact@nkapcontrol.cm" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Conditions generales</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Confidentialite</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Nkap Control. Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
