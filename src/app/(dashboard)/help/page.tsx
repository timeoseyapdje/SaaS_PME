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
  BookOpen,
  ArrowRight,
  RotateCcw,
  LayoutTemplate,
  Upload,
  PenLine,
  RefreshCw,
  Receipt,
  Calculator,
  TrendingUp,
  Bell,
  Settings,
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Facturation",
    icon: FileText,
    color: "text-blue-500",
    items: [
      { q: "Comment créer une facture ?", a: "Allez dans Facturation → Nouvelle facture. Sélectionnez un client, ajoutez vos lignes (ou chargez un modèle), puis sauvegardez en brouillon ou envoyez directement." },
      { q: "Comment marquer une facture comme payée ?", a: "Ouvrez la facture et cliquez sur le bouton vert « Marquer payée ». La date de paiement est automatiquement enregistrée." },
      { q: "Comment enregistrer un acompte ou paiement partiel ?", a: "Ouvrez la facture (statut ENVOYÉE ou EN RETARD) et descendez jusqu'à la section « Paiements reçus ». Cliquez « Ajouter un acompte », entrez le montant et le mode de paiement. La barre de progression et le solde restant se mettent à jour automatiquement. La facture passe à PAYÉE quand le total est atteint." },
      { q: "Comment créer une facture récurrente ?", a: "Dans le formulaire de création, cliquez sur « Options avancées » et activez « Facture récurrente ». Choisissez la périodicité (Mensuelle, Trimestrielle, Annuelle). Sur la facture, le bouton « Générer la prochaine » crée automatiquement le brouillon suivant." },
      { q: "Comment envoyer un rappel pour une facture en retard ?", a: "Sur la liste des factures, cliquez « Vérifier retards » pour marquer les factures échues. Ouvrez ensuite la facture et cliquez « Envoyer rappel ». Les relances automatiques sont aussi envoyées par le système à J+7, J+14 et J+30." },
      { q: "Comment envoyer une facture par email ou WhatsApp ?", a: "Ouvrez la facture et utilisez les boutons « Email » ou « WhatsApp » dans la barre d'actions. L'email est pré-rempli avec l'adresse du client." },
      { q: "Comment dupliquer une facture ?", a: "Ouvrez la facture et cliquez « Dupliquer ». Un nouveau brouillon est créé avec les mêmes lignes et le même client." },
      { q: "Comment exporter une facture en PDF ?", a: "Ouvrez la facture et cliquez sur le bouton « PDF ». Le PDF inclut une boîte de référence de paiement pour faciliter les règlements." },
      { q: "Comment créer un avoir (note de crédit) ?", a: "Ouvrez une facture PAYÉE ou ANNULÉE et cliquez « Créer un avoir ». Entrez le montant à rembourser et le motif. L'avoir est accessible dans Finance → Avoirs." },
      { q: "Comment sauvegarder une facture comme modèle ?", a: "Ouvrez la facture et cliquez « Modèle » dans la barre d'actions. Donnez un nom au modèle. Il sera disponible dans Facturation → Modèles et dans le formulaire de création." },
    ],
  },
  {
    title: "Devis",
    icon: BookOpen,
    color: "text-purple-500",
    items: [
      { q: "Comment créer un devis ?", a: "Allez dans Facturation → Nouveau devis. Le processus est identique à une facture. Vous pouvez charger un modèle de devis pour gagner du temps." },
      { q: "Comment convertir un devis en facture ?", a: "Ouvrez le devis et cliquez « Convertir en facture ». Une facture brouillon est automatiquement créée avec les mêmes lignes." },
      { q: "Comment faire signer un devis électroniquement ?", a: "Ouvrez le devis (statut BROUILLON ou ENVOYÉ) et cliquez « Demander signature ». Un lien unique est généré. Copiez-le ou partagez-le via WhatsApp. Le client visite la page, consulte le devis et clique « Accepter ». Le devis passe automatiquement en statut ACCEPTÉ avec la date de signature." },
      { q: "Comment utiliser le catalogue dans un devis ?", a: "Dans le formulaire de devis ou de facture, cliquez sur l'icône livre à droite de chaque ligne pour sélectionner un produit du catalogue." },
    ],
  },
  {
    title: "Modèles de documents",
    icon: LayoutTemplate,
    color: "text-indigo-500",
    items: [
      { q: "À quoi servent les modèles ?", a: "Les modèles permettent de sauvegarder des lignes préremplies (description, quantité, prix) pour vos factures et devis récurrents. Fini la ressaisie à chaque fois." },
      { q: "Comment créer un modèle ?", a: "Allez dans Facturation → Modèles → « Nouveau modèle ». Choisissez le type (Facture ou Devis), nommez-le et ajoutez vos lignes. Vous pouvez aussi sauvegarder directement depuis une facture existante avec le bouton « Modèle »." },
      { q: "Comment utiliser un modèle lors de la création ?", a: "Dans le formulaire de nouvelle facture ou nouveau devis, cliquez « Charger un modèle » en haut. Sélectionnez un modèle : les lignes, les notes et les conditions sont automatiquement pré-remplies." },
    ],
  },
  {
    title: "Clients & Fournisseurs",
    icon: Users,
    color: "text-emerald-500",
    items: [
      { q: "Comment ajouter un client ?", a: "Allez dans Contacts → Clients → bouton « Nouveau client ». Remplissez au minimum le nom du client." },
      { q: "Comment importer des clients en masse depuis un CSV ?", a: "Dans Contacts → Clients, cliquez « Importer CSV ». Téléchargez d'abord le modèle CSV, remplissez-le (Nom, Email, Téléphone, Adresse, Ville, Type, Notes) puis importez-le. Un aperçu s'affiche avant confirmation. Idem pour les fournisseurs." },
      { q: "Comment importer des dépenses en masse ?", a: "Dans Finance → Dépenses, cliquez « Importer CSV ». Le modèle contient les colonnes : Description, Montant, Date, Categorie, ModePaiement, Notes." },
      { q: "Pourquoi mon client n'apparaît pas dans le formulaire de facture ?", a: "Vérifiez que le client a bien été créé dans Contacts → Clients. Le formulaire charge la liste dynamiquement." },
    ],
  },
  {
    title: "Bons de commande fournisseurs",
    icon: ShoppingCart,
    color: "text-orange-500",
    items: [
      { q: "À quoi servent les bons de commande ?", a: "Les bons de commande (BC-YYYY-XXXX) permettent de formaliser vos achats auprès de vos fournisseurs : quantités commandées, prix, délai de livraison attendu. Ils sont liés à vos fournisseurs existants." },
      { q: "Comment créer un bon de commande ?", a: "Allez dans Fournisseurs → Bons de commande → « Nouveau bon de commande ». Sélectionnez le fournisseur, ajoutez les lignes (description, qté, prix), indiquez la date de livraison attendue et soumettez." },
      { q: "Comment suivre le statut d'un bon de commande ?", a: "Un BC passe de BROUILLON → ENVOYÉ → REÇU. Ouvrez le BC et cliquez sur le bouton d'action correspondant à chaque étape. Un BC peut aussi être annulé à tout moment." },
    ],
  },
  {
    title: "Avoirs (Notes de crédit)",
    icon: RotateCcw,
    color: "text-pink-500",
    items: [
      { q: "Qu'est-ce qu'un avoir ?", a: "Un avoir est un document qui annule partiellement ou totalement une facture, généralement en cas de retour de marchandise ou d'erreur de facturation. Il est numéroté AV-YYYY-XXXX." },
      { q: "Comment créer un avoir depuis une facture ?", a: "Ouvrez la facture concernée (statut PAYÉE ou ANNULÉE) et cliquez « Créer un avoir ». Entrez le montant et le motif. L'avoir est lié à la facture d'origine." },
      { q: "Comment gérer les avoirs ?", a: "Dans Finance → Avoirs, vous voyez tous vos avoirs avec leur statut (ÉMIS ou APPLIQUÉ). Cliquez « Appliquer » pour marquer un avoir comme utilisé." },
    ],
  },
  {
    title: "Dépenses & Finances",
    icon: TrendingDown,
    color: "text-red-500",
    items: [
      { q: "Comment enregistrer une dépense ?", a: "Allez dans Finance → Dépenses & Recettes. Cliquez « Nouvelle dépense » et remplissez le formulaire. Vous pouvez aussi importer des dépenses en masse via CSV." },
      { q: "Comment suivre ma trésorerie ?", a: "Allez dans Finance → Trésorerie. Vous pouvez y ajouter vos comptes bancaires, MTN Money et Orange Money. Cochez « Compte principal » pour les reversements automatiques." },
    ],
  },
  {
    title: "Rapports & Analyses",
    icon: BarChart3,
    color: "text-yellow-500",
    items: [
      { q: "Comment voir mes résultats financiers ?", a: "Allez dans Rapports → Résultats financiers. Vous pouvez filtrer par période et exporter en Excel ou PDF." },
      { q: "Comment calculer la TVA à déclarer ?", a: "Dans Rapports → Rapport TVA, vous trouvez la TVA collectée (sur vos factures), la TVA déductible estimée (sur vos dépenses), et le solde à déclarer, ventilé mois par mois. Taux Cameroun : 19,25%." },
      { q: "Comment estimer mon impôt sur les sociétés (IS) ?", a: "Dans Rapports → Calcul IS, l'application calcule automatiquement : CA – Charges = Résultat net × 30% (taux IS Cameroun) = IS estimé. C'est une estimation indicative — consultez un expert-comptable pour la déclaration officielle." },
      { q: "Comment prévoir mes flux de trésorerie ?", a: "Dans Rapports → Trésorerie 90j, un graphique montre semaine par semaine les encaissements attendus (factures non payées à échéance) et les sorties prévues (dépenses récurrentes). Le solde prévisionnel cumulé est affiché." },
      { q: "Comment l'assistant IA peut-il m'aider ?", a: "Cliquez sur l'icône bulle de chat en bas à droite. Posez n'importe quelle question : « Quelles factures sont en retard ? », « Quel est mon CA ce mois ? »..." },
    ],
  },
  {
    title: "Paiements Mobile Money",
    icon: CreditCard,
    color: "text-teal-500",
    items: [
      { q: "Comment accepter un paiement MTN/Orange Money ?", a: "Créez un lien de paiement dans Ventes → Liens de paiement. Partagez le lien avec votre client. getMIpay lui envoie une demande USSD qu'il confirme avec son code PIN Mobile Money." },
      { q: "Pourquoi le paiement reste-t-il en attente ?", a: "Le client doit confirmer le paiement sur son téléphone avec son code PIN. Si le problème persiste, vérifiez que vos clés getMIpay sont bien configurées dans les variables d'environnement." },
      { q: "Où va l'argent une fois le paiement reçu ?", a: "Le reversement est automatiquement effectué vers le compte marqué « Compte principal » dans Finance → Trésorerie. Vérifiez qu'au moins un compte a cette option activée." },
    ],
  },
  {
    title: "Équipe & Permissions",
    icon: Users,
    color: "text-cyan-500",
    items: [
      { q: "Comment inviter un membre de l'équipe ?", a: "Allez dans Équipe → Membres → « Inviter un membre ». Définissez son poste et ses permissions. Il recevra un email d'invitation." },
      { q: "Comment limiter les accès d'un employé ?", a: "Allez dans Équipe → Postes. Créez ou modifiez un poste et définissez les permissions module par module." },
      { q: "Comment recevoir une notification quand une facture est payée ?", a: "Les notifications internes apparaissent dans la cloche en haut à droite de l'application. Elles vous alertent automatiquement sur les paiements reçus, les factures en retard et les demandes d'admission." },
    ],
  },
  {
    title: "Paramètres & Personnalisation",
    icon: Settings,
    color: "text-gray-500",
    items: [
      { q: "Comment changer le thème (clair/sombre) ?", a: "Allez dans Paramètres → Personnalisation → Apparence. Choisissez entre Clair, Sombre ou Système (suit les préférences de votre appareil)." },
      { q: "Comment masquer des sections de la barre latérale ?", a: "Allez dans Paramètres → Personnalisation → Barre latérale. Désactivez le switch à côté de chaque section que vous souhaitez masquer. Le Dashboard et les Paramètres restent toujours visibles." },
      { q: "Comment réorganiser la barre latérale ?", a: "Dans Paramètres → Personnalisation → Barre latérale, glissez-déposez les sections pour les réorganiser dans l'ordre qui vous convient. Les modifications sont appliquées instantanément." },
      { q: "Comment réinitialiser la barre latérale ?", a: "Si vous voulez revenir à l'ordre et à la visibilité par défaut, cliquez sur le bouton « Réinitialiser » en haut à droite de la section Barre latérale dans les paramètres." },
      { q: "Comment personnaliser les documents (plan Max) ?", a: "Allez dans Paramètres → Personnalisation. Si vous êtes sur le plan Max, vous pouvez modifier la couleur principale, ajouter un logo, un en-tête et un pied de page personnalisés, et choisir un modèle de facture." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-full">
      <Header title="Aide & Documentation" subtitle="Tout ce que vous devez savoir pour utiliser Nkap Control" />

      <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accès rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { label: "Créer une facture", href: "/invoices/new", icon: FileText },
                { label: "Créer un devis", href: "/devis/new", icon: BookOpen },
                { label: "Lien de paiement", href: "/payment-links/new", icon: Link2 },
                { label: "Nouveau client", href: "/clients", icon: Users },
                { label: "Bon de commande", href: "/purchase-orders/new", icon: ShoppingCart },
                { label: "Modèles", href: "/templates", icon: LayoutTemplate },
                { label: "Avoirs", href: "/credit-notes", icon: RotateCcw },
                { label: "Rapports TVA/IS", href: "/reports", icon: Calculator },
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

        {/* Nouveautés banner */}
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-emerald-400 mb-2">Nouvelles fonctionnalités disponibles</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
              {[
                { icon: Receipt, text: "Acomptes et paiements partiels sur factures" },
                { icon: PenLine, text: "Signature numérique des devis" },
                { icon: LayoutTemplate, text: "Modèles réutilisables de factures/devis" },
                { icon: RotateCcw, text: "Avoirs (notes de crédit)" },
                { icon: ShoppingCart, text: "Bons de commande fournisseurs" },
                { icon: Upload, text: "Import CSV (clients, fournisseurs, dépenses)" },
                { icon: RefreshCw, text: "Factures récurrentes (mensuelle/trimestrielle/annuelle)" },
                { icon: Bell, text: "Relances automatiques à J+7, J+14, J+30" },
                { icon: Calculator, text: "Rapport TVA détaillé + calcul IS automatique" },
                { icon: TrendingUp, text: "Prévisions de trésorerie sur 90 jours" },
                { icon: Settings, text: "Barre latérale personnalisable (masquer, réordonner)" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{text}</span>
                </div>
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
                <div key={item.q} className="space-y-1 border-b border-border last:border-0 pb-4 last:pb-0">
                  <p className="text-sm font-medium text-foreground">{item.q}</p>
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
              <a href="mailto:support@nkapcontrol.com">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors cursor-pointer">
                  <Mail className="w-4 h-4" />
                  Email support
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
