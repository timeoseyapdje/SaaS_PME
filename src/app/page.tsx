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
} from "lucide-react";

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
    price: "15 000",
    period: "FCFA/mois",
    description: "Pour les PME en croissance",
    features: [
      "5 utilisateurs",
      "Factures illimitees",
      "Tableau de bord avance",
      "Gestion tresorerie multi-comptes",
      "Rapports fiscaux (TVA, IS)",
      "Support prioritaire",
      "Export Excel et PDF",
    ],
    cta: "Choisir Pro",
    popular: true,
  },
  {
    name: "Entreprise",
    price: "45 000",
    period: "FCFA/mois",
    description: "Pour les grandes structures",
    features: [
      "Utilisateurs illimites",
      "Tout du plan Pro",
      "Multi-societes",
      "API personnalisee",
      "Formation equipe dediee",
      "Support telephonique 24/7",
      "Personnalisation avancee",
    ],
    cta: "Contacter l'equipe",
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
  return (
    <div className="min-h-screen bg-background selection:bg-emerald-500/30 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-background to-background dark:from-emerald-500/10 dark:via-zinc-950 dark:to-zinc-950 blur-3xl" />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 bg-white overflow-hidden p-0.5">
              <img src="/logo.png" alt="Nkap Control Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Nkap Control</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Fonctionnalites</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Tarifs</Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">Temoignages</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-emerald-600 transition-colors hidden sm:block">
              Se connecter
            </Link>
            <Button asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 shadow-md">
              <Link href="/register">Commencer</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-16">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-24">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 border border-emerald-500/20">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Concu pour les PME camerounaises
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              La gestion financiere{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500">
                reinventee pour les PME.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Facturez, suivez votre tresorerie, gerez vos clients et produisez vos rapports fiscaux conformes OHADA. Le tout en FCFA, avec MTN Money et Orange Money integres.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-500/20 group">
                <Link href="/register">
                  Demarrer gratuitement
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-full border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50">
                <Link href="/login">Voir la demo</Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Plan gratuit disponible</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Paiement Mobile Money</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Conforme OHADA</div>
            </motion.div>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md shadow-2xl p-2 sm:p-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="rounded-xl overflow-hidden border border-border/50 bg-background shadow-inner relative aspect-[16/9] md:aspect-[21/9] flex flex-col">
              <div className="h-12 border-b border-border/50 flex items-center px-4 gap-4 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="h-6 w-64 bg-background border border-border/50 rounded-md mx-auto" />
              </div>
              <div className="flex-1 flex p-4 gap-4 bg-background">
                <div className="w-48 hidden md:flex flex-col gap-2">
                  <div className="h-8 bg-emerald-500/10 rounded-md w-full" />
                  <div className="h-8 bg-muted/30 rounded-md w-3/4" />
                  <div className="h-8 bg-muted/30 rounded-md w-5/6" />
                  <div className="h-8 bg-muted/30 rounded-md w-4/5" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="h-24 flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                      <div className="h-3 w-16 bg-emerald-500/20 rounded mb-2" />
                      <div className="h-5 w-24 bg-emerald-500/15 rounded" />
                    </div>
                    <div className="h-24 flex-1 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3">
                      <div className="h-3 w-16 bg-rose-500/20 rounded mb-2" />
                      <div className="h-5 w-24 bg-rose-500/15 rounded" />
                    </div>
                    <div className="h-24 flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                      <div className="h-3 w-16 bg-emerald-500/20 rounded mb-2" />
                      <div className="h-5 w-24 bg-emerald-500/15 rounded" />
                    </div>
                  </div>
                  <div className="flex-1 bg-muted/20 border border-border/50 rounded-xl" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Tout ce dont votre PME a besoin</h2>
            <p className="text-lg text-muted-foreground">Des outils puissants, adaptes au contexte camerounais et a la norme OHADA.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Des tarifs simples et transparents</h2>
            <p className="text-lg text-muted-foreground">Choisissez le plan adapte a la taille de votre entreprise. Payez par Mobile Money ou virement bancaire.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.popular
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
                  className={`w-full h-12 rounded-xl font-semibold ${
                    plan.popular
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
        <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-lg text-muted-foreground">Des entrepreneurs camerounais qui ont transforme leur gestion financiere.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-amber-700 p-10 sm:p-16 text-center border border-white/10 shadow-2xl shadow-emerald-500/20">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Pret a propulser votre PME ?</h2>
              <p className="text-emerald-100 text-lg mb-10">
                Rejoignez des centaines d&apos;entreprises camerounaises qui font confiance a Nkap Control pour leur gestion quotidienne.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base font-semibold bg-white text-emerald-600 hover:bg-emerald-50 rounded-full shadow-lg">
                  <Link href="/register">Creer un compte gratuit</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold rounded-full border-white/30 text-white hover:bg-white/10">
                  <Link href="/login">Tester la demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-white overflow-hidden p-0.5">
                  <img src="/logo.png" alt="Nkap Control Logo" className="w-full h-full object-contain" />
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
                <li><Link href="/login" className="hover:text-foreground transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Centre d&apos;aide</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">WhatsApp</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Conditions generales</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Confidentialite</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Mentions legales</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Nkap Control. Tous droits reserves.
            </p>
            <p className="text-sm text-muted-foreground">
              Fait avec passion a Yaounde, Cameroun
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
