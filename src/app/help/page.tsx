"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Shield,
  Sparkles,
  Landmark,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowRight,
  Mail,
  HelpCircle,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  faqs: FAQItem[];
}

const helpCategories: HelpCategory[] = [
  {
    title: "Premiers pas",
    description: "Creer votre compte et demarrer avec Nkap Control",
    icon: HelpCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    faqs: [
      {
        question: "Comment creer un compte ?",
        answer:
          "Rendez-vous sur la page d'inscription, remplissez votre nom, email, nom d'entreprise et mot de passe. Votre compte sera cree automatiquement avec le plan Starter gratuit. La ville par defaut est Douala, modifiable dans les parametres.",
      },
      {
        question: "Comment fonctionne le compte de demonstration ?",
        answer:
          "Le compte demo vous permet de tester toutes les fonctionnalites de Nkap Control en lecture seule. Vous pouvez naviguer dans le tableau de bord, consulter les factures et rapports fictifs. Aucune modification n'est possible. Nkap AI n'est pas disponible en mode demo.",
      },
      {
        question: "Quels sont les roles disponibles ?",
        answer:
          "Trois roles existent : Administrateur (acces complet), Comptable (fonctions financieres et de gestion), et Lecteur (consultation uniquement). Le super administrateur de la plateforme peut modifier les roles des utilisateurs.",
      },
      {
        question: "Comment modifier les informations de mon entreprise ?",
        answer:
          "Allez dans Parametres depuis le menu lateral. Vous pourrez modifier le nom, l'adresse, le RCCM, le NIU, le telephone, la ville et d'autres informations de votre entreprise.",
      },
    ],
  },
  {
    title: "Facturation",
    description: "Creer, envoyer et suivre vos factures",
    icon: FileText,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    faqs: [
      {
        question: "Comment creer une facture ?",
        answer:
          "Allez dans Facturation > Nouvelle facture. Remplissez les informations du client, ajoutez les lignes de produits/services avec les quantites et prix. La TVA (19,25%) est calculee automatiquement. Vous pouvez ensuite telecharger le PDF ou envoyer la facture par email.",
      },
      {
        question: "Comment envoyer une facture par email ?",
        answer:
          "Depuis la page d'une facture, cliquez sur le bouton 'Envoyer par email'. Le client recevra la facture en format PDF avec un recapitulatif directement dans l'email.",
      },
      {
        question: "Comment suivre les paiements des factures ?",
        answer:
          "Chaque facture a un statut : Brouillon, Envoyee, Payee ou En retard. Vous pouvez mettre a jour le statut depuis la liste des factures. Le tableau de bord affiche un resume des factures en attente et en retard.",
      },
      {
        question: "Combien de factures puis-je creer ?",
        answer:
          "Le plan Starter permet 20 factures par mois. Les plans Pro et Max offrent des factures illimitees.",
      },
    ],
  },
  {
    title: "Tresorerie",
    description: "Gerer vos comptes bancaires et mobile money",
    icon: Landmark,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    faqs: [
      {
        question: "Quels types de comptes puis-je ajouter ?",
        answer:
          "Vous pouvez gerer des comptes bancaires classiques, des comptes MTN Mobile Money, Orange Money et une caisse physique. Chaque compte affiche son solde en temps reel.",
      },
      {
        question: "Comment suivre ma tresorerie ?",
        answer:
          "Allez dans Finances > Tresorerie pour voir l'ensemble de vos comptes et leurs soldes. Vous pouvez enregistrer des mouvements (entrees et sorties) pour chaque compte.",
      },
      {
        question: "Les paiements Mobile Money sont-ils integres ?",
        answer:
          "Oui, Nkap Control supporte les paiements MTN MoMo et Orange Money pour le reglement de vos abonnements et le suivi de votre tresorerie mobile.",
      },
    ],
  },
  {
    title: "Depenses et revenus",
    description: "Suivre vos depenses et recettes",
    icon: BarChart3,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    faqs: [
      {
        question: "Comment enregistrer une depense ?",
        answer:
          "Allez dans Finances > Depenses & Recettes. Cliquez sur 'Nouvelle depense', selectionnez la categorie, entrez le montant et la description. Vous pouvez aussi enregistrer des revenus directs (hors factures).",
      },
      {
        question: "Quelles categories de depenses sont disponibles ?",
        answer:
          "Les categories standard incluent : Salaires, Loyer, Fournitures, Transport, Communication, Marketing, Maintenance, Impots et taxes, et Autres. Ces categories sont utilisees dans les rapports fiscaux.",
      },
      {
        question: "Comment voir un resume de mes finances ?",
        answer:
          "Le tableau de bord principal affiche vos KPIs : chiffre d'affaires, depenses, solde de tresorerie et nombre de factures. Les graphiques montrent l'evolution mensuelle de vos revenus et depenses.",
      },
    ],
  },
  {
    title: "Rapports fiscaux",
    description: "Rapports conformes OHADA et fiscalite camerounaise",
    icon: Shield,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    faqs: [
      {
        question: "Quels rapports fiscaux sont disponibles ?",
        answer:
          "Nkap Control genere le Compte de resultat simplifie et le Bilan simplifie conformes a la norme OHADA. Vous pouvez aussi estimer votre TVA a payer et l'Impot sur les Societes (IS).",
      },
      {
        question: "Quels sont les taux fiscaux appliques ?",
        answer:
          "Les taux en vigueur au Cameroun sont : TVA a 19,25% et IS a 33%, conformement au Code General des Impots du Cameroun.",
      },
      {
        question: "Nkap Control remplace-t-il un expert-comptable ?",
        answer:
          "Non. Nkap Control fournit des outils de calcul et de suivi, mais ne se substitue pas a un expert-comptable agree. Vous restez seul responsable de vos declarations fiscales officielles.",
      },
    ],
  },
  {
    title: "Nkap AI",
    description: "Votre assistant financier intelligent",
    icon: Sparkles,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    faqs: [
      {
        question: "Qu'est-ce que Nkap AI ?",
        answer:
          "Nkap AI est un assistant financier intelligent integre a Nkap Control. Il analyse vos donnees en temps reel et peut repondre a vos questions sur votre chiffre d'affaires, vos depenses, votre tresorerie, les factures en retard, et vous donner des conseils financiers personnalises.",
      },
      {
        question: "Combien de messages puis-je envoyer ?",
        answer:
          "Le plan Starter n'inclut pas Nkap AI. Le plan Pro offre 10 messages par jour. Le plan Max offre un acces illimite a Nkap AI.",
      },
      {
        question: "Les reponses de Nkap AI sont-elles fiables ?",
        answer:
          "Nkap AI fournit des analyses basees sur vos donnees reelles. Cependant, ses reponses sont a titre indicatif et ne constituent pas des conseils financiers professionnels. Consultez toujours un expert pour des decisions importantes.",
      },
      {
        question: "Nkap AI est-il disponible en mode demo ?",
        answer:
          "Non, Nkap AI n'est pas accessible depuis le compte de demonstration. Creez votre propre compte pour profiter de l'assistant financier.",
      },
    ],
  },
  {
    title: "Abonnement et paiement",
    description: "Gerer votre plan et vos paiements",
    icon: CreditCard,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    faqs: [
      {
        question: "Quels sont les plans disponibles ?",
        answer:
          "Starter (gratuit) : 1 utilisateur, 20 factures/mois, tableau de bord basique.\nPro (5 000 XAF/mois) : 5 utilisateurs, factures illimitees, tresorerie multi-comptes, rapports fiscaux, Nkap AI (10 msg/jour).\nMax (15 000 XAF/mois) : utilisateurs illimites, Nkap AI illimite, personnalisation avancee, API, support 24/7.",
      },
      {
        question: "Comment changer de plan ?",
        answer:
          "Allez dans Abonnement depuis le menu lateral. Vous pouvez passer a un plan superieur a tout moment. Le changement est effectif immediatement.",
      },
      {
        question: "Quels moyens de paiement sont acceptes ?",
        answer:
          "Nous acceptons MTN Mobile Money, Orange Money, virement bancaire et carte bancaire (Visa, Mastercard). Les abonnements sont factures mensuellement.",
      },
      {
        question: "Comment resilier mon abonnement ?",
        answer:
          "Vous pouvez resilier a tout moment depuis les parametres. L'acces au plan payant est maintenu jusqu'a la fin de la periode facturee. Apres resiliation, votre compte repasse au plan Starter. Aucun remboursement n'est effectue pour les periodes partielles.",
      },
      {
        question: "Y a-t-il des codes promo ?",
        answer:
          "Oui, des codes promotionnels peuvent etre disponibles et offrir des reductions sur les abonnements. Vous pouvez les saisir lors du choix de votre plan.",
      },
    ],
  },
  {
    title: "Gestion des contacts",
    description: "Clients et fournisseurs",
    icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    faqs: [
      {
        question: "Comment ajouter un client ?",
        answer:
          "Allez dans Contacts > Clients et cliquez sur 'Nouveau client'. Renseignez le nom, l'email, le telephone et l'adresse. Vous pourrez ensuite associer ce client a vos factures.",
      },
      {
        question: "Comment suivre les dettes d'un client ?",
        answer:
          "Depuis la liste des clients, vous pouvez voir le montant total des factures en attente pour chaque client. Le tableau de bord affiche egalement les factures en retard par client.",
      },
      {
        question: "Puis-je gerer mes fournisseurs aussi ?",
        answer:
          "Oui, Nkap Control permet de gerer vos fournisseurs. Allez dans Contacts > Fournisseurs pour ajouter, modifier ou consulter vos fournisseurs et l'historique des transactions.",
      },
    ],
  },
  {
    title: "Parametres et securite",
    description: "Compte, mot de passe et preferences",
    icon: Settings,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    faqs: [
      {
        question: "Comment changer mon mot de passe ?",
        answer:
          "Allez dans Parametres > Securite. Entrez votre ancien mot de passe puis le nouveau. Le mot de passe doit comporter au moins 8 caracteres.",
      },
      {
        question: "Puis-je supprimer mon compte ?",
        answer:
          "Oui, vous pouvez supprimer votre compte et toutes vos donnees a tout moment depuis les parametres. Cette action est irreversible.",
      },
      {
        question: "Que se passe-t-il si mon compte est inactif ?",
        answer:
          "Les comptes avec le role Lecteur inactifs depuis 6 mois consecutifs sont automatiquement supprimes. Un email de notification est envoye 30 jours avant la suppression. Les comptes Administrateur et Comptable ne sont pas concernes.",
      },
      {
        question: "Mes donnees sont-elles securisees ?",
        answer:
          "Oui. Les mots de passe sont chiffres avec bcrypt. Les communications sont protegees par HTTPS/TLS. Les donnees sont hebergees sur des serveurs securises. Le super administrateur n'a aucun acces a vos donnees financieres.",
      },
    ],
  },
];

function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="border border-zinc-800/50 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-zinc-900/50 transition-colors"
          >
            <span className="text-sm font-medium text-zinc-200 pr-4">
              {faq.question}
            </span>
            {openIndex === idx ? (
              <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            )}
          </button>
          {openIndex === idx && (
            <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = searchQuery.trim()
    ? helpCategories
        .map((cat) => ({
          ...cat,
          faqs: cat.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.faqs.length > 0)
    : helpCategories;

  const activeCategory = selectedCategory
    ? filteredCategories.find((c) => c.title === selectedCategory)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-emerald-500/30">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-dot-pattern opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/8 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300 mb-8 inline-flex items-center gap-1 transition-colors"
        >
          &larr; Retour a l&apos;accueil
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Centre d&apos;aide
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
            Trouvez des reponses a vos questions sur Nkap Control. Parcourez nos
            categories ou utilisez la recherche.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedCategory(null);
              }}
              placeholder="Rechercher une question..."
              className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Categories grid or selected category */}
        {!activeCategory && !searchQuery.trim() ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <button
                key={cat.title}
                onClick={() => setSelectedCategory(cat.title)}
                className="p-5 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all text-left group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cat.bg}`}
                >
                  <cat.icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-zinc-500">{cat.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-emerald-500">
                  {cat.faqs.length} question{cat.faqs.length > 1 ? "s" : ""}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            {/* Back to categories */}
            {!searchQuery.trim() && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-emerald-400 hover:text-emerald-300 mb-6 inline-flex items-center gap-1 transition-colors"
              >
                &larr; Toutes les categories
              </button>
            )}

            {searchQuery.trim() ? (
              <>
                <p className="text-sm text-zinc-500 mb-6">
                  {filteredCategories.reduce((a, c) => a + c.faqs.length, 0)}{" "}
                  resultat(s) pour &ldquo;{searchQuery}&rdquo;
                </p>
                {filteredCategories.map((cat) => (
                  <div key={cat.title} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.bg}`}
                      >
                        <cat.icon className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <h2 className="text-lg font-semibold text-white">
                        {cat.title}
                      </h2>
                    </div>
                    <FAQAccordion faqs={cat.faqs} />
                  </div>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">
                      Aucun resultat trouve. Essayez avec d&apos;autres mots-cles.
                    </p>
                  </div>
                )}
              </>
            ) : (
              activeCategory && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeCategory.bg}`}
                    >
                      <activeCategory.icon
                        className={`w-5 h-5 ${activeCategory.color}`}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {activeCategory.title}
                      </h2>
                      <p className="text-xs text-zinc-500">
                        {activeCategory.description}
                      </p>
                    </div>
                  </div>
                  <FAQAccordion faqs={activeCategory.faqs} />
                </div>
              )
            )}
          </div>
        )}

        {/* Contact section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
            <Mail className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Vous ne trouvez pas la reponse ?
            </h3>
            <p className="text-sm text-zinc-400 mb-4 max-w-md">
              Notre equipe est la pour vous aider. Contactez-nous et nous vous
              repondrons dans les plus brefs delais.
            </p>
            <a
              href="mailto:contact@nkapcontrol.cm"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Mail className="w-4 h-4" />
              contact@nkapcontrol.cm
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} Nkap Control. Tous droits reserves.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">
              Confidentialite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
