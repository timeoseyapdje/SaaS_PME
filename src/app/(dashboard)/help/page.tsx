import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Users,
  TrendingDown,
  CreditCard,
  BarChart3,
  ShoppingCart,
  Package,
  Link2,
  MessageCircle,
  Mail,
  Bell,
  FileDown,
  BookOpen,
  Copy,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Facturation",
    icon: FileText,
    color: "text-blue-500",
    items: [
      { q: "Comment créer une facture ?", a: "Allez dans Facturation → Nouvelle facture. Sélectionnez un client, ajoutez vos lignes, puis sauvegardez en brouillon ou envoyez directement." },
      { q: "Comment marquer une facture comme payée ?", a: "Ouvrez la facture et cliquez sur le bouton vert « Marquer payée ». La date de paiement est automatiquement enregistrée." },
      { q: "Comment envoyer un rappel pour une facture en retard ?", a: "Sur la liste des factures, cliquez « Vérifier retards » pour marquer automatiquement les factures échues. Ouvrez ensuite la facture et cliquez « Envoyer rappel »." },
      { q: "Comment envoyer une facture par email ou WhatsApp ?", a: "Ouvrez la facture et utilisez les boutons « Email » ou « WhatsApp » dans la barre d'actions. L'email est pré-rempli avec l'adresse du client." },
      { q: "Comment dupliquer une facture ?", a: "Ouvrez la facture et cliquez « Dupliquer ». Un nouveau brouillon est créé avec les mêmes lignes et le même client." },
      { q: "Comment exporter une facture en PDF ?", a: "Ouvrez la facture et cliquez sur le bouton « PDF » dans la barre d'actions." },
    ],
  },
  {
    title: "Devis",
    icon: BookOpen,
    color: "text-purple-500",
    items: [
      { q: "Comment créer un devis ?", a: "Allez dans Facturation → Nouveau devis. Le processus est identique à une facture." },
      { q: "Comment convertir un devis en facture ?", a: "Ouvrez le devis et cliquez « Convertir en facture ». Une facture brouillon est automatiquement créée avec les mêmes lignes." },
      { q: "Comment utiliser le catalogue dans un devis ?", a: "Dans le formulaire de devis ou de facture, cliquez sur l'icône livre à droite de chaque ligne pour sélectionner un produit du catalogue." },
    ],
  },
  {
    title: "Clients & Fournisseurs",
    icon: Users,
    color: "text-emerald-500",
    items: [
      { q: "Comment ajouter un client ?", a: "Allez dans Contacts → Clients → bouton « Nouveau client ». Remplissez au minimum le nom du client." },
      { q: "Pourquoi mon client n'apparaît pas dans le formulaire de facture ?", a: "Vérifiez que le client a bien été créé dans Contacts → Clients. Le formulaire charge la liste dynamiquement." },
    ],
  },
  {
    title: "Dépenses & Finances",
    icon: TrendingDown,
    color: "text-red-500",
    items: [
      { q: "Comment enregistrer une dépense ?", a: "Allez dans Finances → Dépenses & Recettes. Cliquez « Nouvelle dépense » et remplissez le formulaire." },
      { q: "Comment suivre ma trésorerie ?", a: "Allez dans Finances → Trésorerie. Vous pouvez y ajouter vos comptes bancaires, MTN Money et Orange Money." },
    ],
  },
  {
    title: "Paiements Mobile Money",
    icon: CreditCard,
    color: "text-orange-500",
    items: [
      { q: "Comment accepter un paiement MTN/Orange Money ?", a: "Créez un lien de paiement dans Ventes → Liens de paiement. Partagez le lien avec votre client. Il sera invité à confirmer avec son PIN." },
      { q: "Pourquoi le paiement reste-t-il en attente ?", a: "Le client doit confirmer le paiement sur son téléphone avec son code PIN. Si le problème persiste, vérifiez que votre clé NotchPay est bien configurée." },
    ],
  },
  {
    title: "Rapports & Analyses",
    icon: BarChart3,
    color: "text-yellow-500",
    items: [
      { q: "Comment voir mes résultats financiers ?", a: "Allez dans Rapports → Résultats financiers. Vous pouvez filtrer par période et exporter en Excel ou PDF." },
      { q: "Comment l'assistant IA peut-il m'aider ?", a: "Cliquez sur l'icône bulle de chat en bas à droite. Posez n'importe quelle question sur vos finances : « Quelles factures sont en retard ? », « Quel est mon CA ce mois ? »..." },
    ],
  },
  {
    title: "Équipe & Permissions",
    icon: Users,
    color: "text-cyan-500",
    items: [
      { q: "Comment inviter un membre de l'équipe ?", a: "Allez dans Équipe → Membres → « Inviter un membre ». Définissez son poste et ses permissions. Il recevra un email d'invitation." },
      { q: "Comment limiter les accès d'un employé ?", a: "Allez dans Équipe → Postes. Créez ou modifiez un poste et définissez les permissions module par module." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Aide & Documentation" subtitle="Tout ce que vous devez savoir pour utiliser Nkap Control" />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Démarrage rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Créer une facture", href: "/invoices/new", icon: FileText },
                { label: "Créer un devis", href: "/devis/new", icon: BookOpen },
                { label: "Nouveau client", href: "/clients", icon: Users },
                { label: "Lien de paiement", href: "/payment-links/new", icon: Link2 },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-center">
                  <Icon className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-medium">{label}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ sections */}
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <section.icon className={`w-5 h-5 ${section.color}`} />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div key={item.q} className="space-y-1">
                  <p className="text-sm font-medium">{item.q}</p>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Contact */}
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-sm">Vous n&apos;avez pas trouvé votre réponse ?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Utilisez l&apos;assistant Nkap AI ou contactez le support.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  Nkap AI
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
