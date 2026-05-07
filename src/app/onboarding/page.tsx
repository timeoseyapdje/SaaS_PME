"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Users,
  Landmark,
  Package,
  ShoppingCart,
  Link2,
  CheckCircle2,
  ChevronRight,
  Zap,
  Shield,
  Brain,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const steps = [
  {
    number: "01",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "Créez votre compte & configurez votre entreprise",
    description:
      "Inscrivez-vous gratuitement, renseignez les informations de votre entreprise (nom, logo, adresse, numéro de contribuable) et choisissez votre devise (FCFA par défaut).",
    steps: [
      "Rendez-vous sur nkapcontrol.cm et cliquez sur « Commencer gratuitement »",
      "Renseignez votre email et choisissez un mot de passe sécurisé",
      "Dans Paramètres → Entreprise, complétez votre profil (logo, adresse, RCCM)",
      "Votre tableau de bord est prêt !",
    ],
  },
  {
    number: "02",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    title: "Ajoutez vos clients & fournisseurs",
    description:
      "Centralisez tous vos contacts professionnels. Chaque client a sa fiche avec l'historique des factures et transactions.",
    steps: [
      "Allez dans Clients → Nouveau client",
      "Renseignez le nom, l'email, le téléphone et l'adresse",
      "Choisissez le type : Particulier ou Entreprise",
      "Retrouvez l'historique complet de chaque client en un clic",
    ],
  },
  {
    number: "03",
    icon: Package,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    title: "Gérez votre catalogue produits",
    description:
      "Créez vos produits et services, organisez-les par catégories, et suivez vos stocks en temps réel avec des alertes automatiques.",
    steps: [
      "Dans Produits → Catalogue, cliquez sur « Nouveau produit »",
      "Renseignez le nom, le prix, le coût et le stock initial",
      "Définissez un seuil d'alerte stock bas",
      "Organisez vos produits par catégories pour retrouver facilement",
    ],
  },
  {
    number: "04",
    icon: ShoppingCart,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Traitez vos commandes",
    description:
      "Créez des commandes pour vos clients, suivez leur avancement (En attente → Confirmé → Livré) et déduisez automatiquement les stocks.",
    steps: [
      "Dans Ventes → Commandes, cliquez sur « Nouvelle commande »",
      "Sélectionnez le client et ajoutez les produits",
      "La TVA (19,25%) est calculée automatiquement",
      "Passez au statut « Confirmé » pour déduire le stock",
      "Convertissez en facture en un clic depuis la commande",
    ],
  },
  {
    number: "05",
    icon: FileText,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    title: "Créez & envoyez vos factures",
    description:
      "Générez des factures conformes avec numérotation automatique, calcul TVA OHADA intégré et export PDF professionnel.",
    steps: [
      "Dans Factures, cliquez sur « Nouvelle facture »",
      "Sélectionnez le client et ajoutez vos lignes (produits ou services)",
      "La TVA camerounaise (19,25%) est calculée automatiquement",
      "Exportez en PDF ou envoyez directement par email",
      "Suivez les statuts : Brouillon, Envoyée, Payée, En retard",
    ],
  },
  {
    number: "06",
    icon: Link2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "Créez des liens de paiement",
    description:
      "Générez un lien de paiement unique pour chaque facture ou commande. Partagez-le et recevez votre paiement Mobile Money en quelques secondes.",
    steps: [
      "Dans Ventes → Liens de paiement, cliquez sur « Nouveau lien »",
      "Définissez le montant, le titre et une date d'expiration (optionnel)",
      "Copiez le lien et envoyez-le à votre client par WhatsApp, SMS ou email",
      "Le client paie via MTN Money ou Orange Money depuis sa page de paiement",
      "Vous êtes notifié dès que le paiement est confirmé",
    ],
  },
  {
    number: "07",
    icon: Landmark,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    title: "Suivez votre trésorerie",
    description:
      "Gérez vos comptes bancaires, Mobile Money et caisse depuis une interface unifiée. Enregistrez toutes les transactions en temps réel.",
    steps: [
      "Dans Trésorerie, ajoutez vos comptes (Banque, MTN Money, Orange Money, Caisse)",
      "Enregistrez chaque entrée et sortie d'argent",
      "Consultez le solde en temps réel de chaque compte",
      "Visualisez l'évolution de votre trésorerie sur le graphique",
    ],
  },
  {
    number: "08",
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "Analysez vos performances",
    description:
      "Votre tableau de bord centralise tous vos KPIs : chiffre d'affaires, dépenses, résultat net, factures impayées et alertes stock.",
    steps: [
      "Le tableau de bord s'actualise automatiquement en temps réel",
      "Consultez les graphiques Revenus vs Dépenses sur 6 mois",
      "Identifiez les factures en retard grâce aux alertes",
      "Exportez vos rapports TVA et IS pour votre comptable",
    ],
  },
];

const highlights = [
  {
    icon: Zap,
    title: "Prise en main rapide",
    desc: "Votre première facture en moins de 5 minutes",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Conforme OHADA",
    desc: "TVA 19,25%, IS et rapports fiscaux intégrés",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Brain,
    title: "Nkap AI inclus",
    desc: "Assistant IA pour analyser vos finances",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Landmark,
    title: "Mobile Money natif",
    desc: "MTN Money & Orange Money intégrés",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-dot-pattern opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/8 blur-[120px] rounded-full" />
      </div>

      {/* Navbar — same as landing */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-7xl z-50 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-amber-500/5 opacity-50 rounded-2xl pointer-events-none" />
        <div className="relative px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 bg-white overflow-hidden p-0.5">
              <img src="/logo.jpeg" alt="Nkap Control Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Nkap Control</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/#features" className="hover:text-white transition-colors">Fonctionnalites</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="/#testimonials" className="hover:text-white transition-colors">References</Link>
            <Link href="/help" className="hover:text-white transition-colors">Aide</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block">
              Se connecter
            </Link>
            <Button asChild className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
              <Link href="/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-44 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium mb-8 shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            Guide de démarrage
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Maîtrisez Nkap Control{" "}
            <span className="text-gradient animate-shimmer">en 8 étapes.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-zinc-400 mb-10 max-w-2xl leading-relaxed">
            De la création de compte à la génération de vos premiers rapports fiscaux — suivez ce guide pas à pas pour tirer le meilleur de votre outil de gestion.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-500/20 group">
              <Link href="/register">
                Créer mon compte gratuitement
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-12 px-8 text-base font-semibold rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Link href="/login">J&apos;ai déjà un compte</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Highlights row */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm flex flex-col gap-2"
            >
              <div className={`w-9 h-9 rounded-xl ${h.bg} flex items-center justify-center`}>
                <h.icon className={`w-4.5 h-4.5 ${h.color}`} />
              </div>
              <p className="text-sm font-semibold text-white">{h.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{h.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Les 8 étapes clés</h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            Chaque étape est autonome. Commencez par celle qui vous correspond le mieux.
          </p>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className={`relative rounded-2xl border ${step.border} bg-zinc-900/60 backdrop-blur-sm p-6 sm:p-8 hover:bg-zinc-900/80 transition-colors group`}
            >
              {/* Step number */}
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`text-xs font-bold tracking-widest ${step.color} uppercase`}>
                      Étape {step.number}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-5">{step.description}</p>
                  <ul className="space-y-2.5">
                    {step.steps.map((s, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-zinc-300">
                        <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${step.color}`} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-10 sm:p-14 text-center border border-white/10 shadow-2xl shadow-emerald-500/20"
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Prêt à vous lancer ?
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Commencez gratuitement dès aujourd&apos;hui
            </h2>
            <p className="text-emerald-100 text-base mb-8 max-w-xl mx-auto">
              Aucune carte bancaire requise. Plan Starter gratuit à vie. Passez à Pro ou Max quand vous êtes prêt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base font-semibold bg-white text-emerald-700 hover:bg-emerald-50 rounded-full shadow-lg">
                <Link href="/register">
                  Créer un compte gratuit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-12 px-8 text-base font-semibold rounded-full text-white hover:bg-white/20 border border-white/30">
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white overflow-hidden p-0.5">
              <img src="/logo.jpeg" alt="Nkap Control" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm text-white">Nkap Control</span>
          </div>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Nkap Control — La gestion financière des PME africaines
          </p>
          <div className="flex items-center gap-5 text-xs text-zinc-500">
            <Link href="/#features" className="hover:text-zinc-300 transition-colors">Fonctionnalités</Link>
            <Link href="/#pricing" className="hover:text-zinc-300 transition-colors">Tarifs</Link>
            <Link href="/help" className="hover:text-zinc-300 transition-colors">Aide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
