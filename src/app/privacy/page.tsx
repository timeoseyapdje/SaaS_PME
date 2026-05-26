import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300 mb-8 inline-block"
        >
          &larr; Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Dernière mise à jour : 25 mai 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              La présente Politique de Confidentialité décrit la manière dont
              <strong className="text-foreground"> Nkap Control</strong> collecte, utilise, stocke et
              protège les données personnelles de ses Utilisateurs. Nous nous engageons à
              respecter la vie privée de nos Utilisateurs conformément à la réglementation
              camerounaise en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Données Collectées</h2>
            <p>Nous collectons les catégories de données suivantes :</p>

            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.1 Données d&apos;identification</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom et prénom de l&apos;Utilisateur</li>
              <li>Adresse email</li>
              <li>Mot de passe (stocké de manière chiffrée avec bcrypt)</li>
              <li>Poste et permissions au sein de l&apos;entreprise</li>
              <li>Statut de la demande d&apos;adhésion (le cas échéant)</li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.2 Données de l&apos;entreprise</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom commercial et raison sociale</li>
              <li>Numéro RCCM et NIU</li>
              <li>Adresse, ville et pays</li>
              <li>Téléphone et email de l&apos;entreprise</li>
              <li>Site web</li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.3 Données financières et commerciales</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Factures émises et avoirs (notes de crédit)</li>
              <li>Devis et propositions commerciales (numéros DEV-YYYY-XXXX, statuts, montants, date et token de signature)</li>
              <li>Modèles de documents (factures et devis)</li>
              <li>Bons de commande fournisseurs</li>
              <li>Dépenses et revenus</li>
              <li>Soldes des comptes bancaires et mobile money</li>
              <li>Informations sur les clients et fournisseurs (nom, email, téléphone, adresse)</li>
              <li>Catalogue produits et catégories (prix, coûts, stocks)</li>
              <li>Commandes et leur statut (En attente, Confirmé, Livré, etc.)</li>
              <li>Historique des mouvements de stock</li>
              <li>Liens de paiement générés et transactions associées</li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.3bis Données de signature numérique</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Token de signature unique (à usage unique, supprimé après utilisation)</li>
              <li>Date et heure d&apos;acceptation ou de refus d&apos;un devis</li>
              <li>Ces données sont liées au devis et conservées tant que le devis existe dans le système</li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.4 Données de paiement</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Méthode de paiement choisie (MTN MoMo, Orange Money, virement, carte)</li>
              <li>Numéro de téléphone pour les paiements mobile money</li>
              <li>Historique des paiements d&apos;abonnement</li>
              <li>Références de transactions getMIpay</li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">2.5 Données d&apos;équipe et de permissions</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Postes attribués et permissions associées par module</li>
              <li>Demandes d&apos;adhésion et leur statut (en attente, approuvée, refusée)</li>
              <li>Historique des invitations et modifications d&apos;équipe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Utilisation des Données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Fournir et améliorer les services de la plateforme</li>
              <li>Gérer votre compte et votre abonnement</li>
              <li>Générer vos factures, avoirs, devis, modèles, bons de commande, rapports et déclarations fiscales</li>
              <li>Envoyer vos factures et devis par email à vos clients (via Resend) lorsque vous utilisez la fonction d&apos;envoi</li>
              <li>Générer des liens de signature numérique à usage unique pour vos devis</li>
              <li>Pré-remplir les messages WhatsApp avec les informations de la facture ou du devis (montant, numéro, échéance) — aucune donnée n&apos;est transmise à WhatsApp sans action explicite de votre part</li>
              <li>Fournir les analyses de l&apos;assistant Nkap AI</li>
              <li>Envoyer des notifications relatives à votre compte (emails transactionnels)</li>
              <li>Assurer le support client</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Protection des Données</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-card border border-border">
                <p className="font-semibold text-foreground text-xs">Chiffrement</p>
                <p className="text-xs text-muted-foreground mt-1">Les mots de passe sont chiffrés avec bcrypt (12 rounds). Les communications sont protégées par HTTPS/TLS.</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <p className="font-semibold text-foreground text-xs">Hébergement</p>
                <p className="text-xs text-muted-foreground mt-1">Les données sont hébergées sur des serveurs sécurisés (Vercel + Neon PostgreSQL) avec des sauvegardes régulières.</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <p className="font-semibold text-foreground text-xs">Accès restreint</p>
                <p className="text-xs text-muted-foreground mt-1">L&apos;accès aux données est strictement limité par un système de postes hiérarchiques avec permissions granulaires par module (Propriétaire, Directeur Général, Comptable, Lecteur).</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="font-semibold text-emerald-400 text-xs">Séparation des données</p>
                <p className="text-xs text-muted-foreground mt-1">Le super administrateur de la plateforme n&apos;a accès qu&apos;aux informations d&apos;identification des entreprises. <strong className="text-foreground">Il n&apos;a aucun accès à vos données financières</strong> (factures, revenus, dépenses, trésorerie).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Partage des Données</h2>
            <p className="font-semibold text-emerald-400">
              Nkap Control ne vend, ne loue et ne partage pas vos données personnelles avec des tiers.
            </p>
            <p className="mt-2">
              Vos données peuvent uniquement être communiquées dans les cas suivants :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Obligation légale (décision de justice, réquisition des autorités compétentes)</li>
              <li>Protection des droits de Nkap Control en cas de litige</li>
              <li>Sous-traitants techniques nécessaires au fonctionnement du service (hébergement, envoi d&apos;emails, processeur de paiement getMIpay) sous contrat de confidentialité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Conservation des Données</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Les données de compte sont conservées tant que le compte est actif</li>
              <li>Les comptes dont le poste ne dispose que de permissions de lecture et inactifs depuis <strong className="text-foreground">6 mois</strong> sont automatiquement supprimés (notification envoyée 30 jours avant)</li>
              <li>En cas de suppression de compte, les données sont effacées dans un délai de 30 jours</li>
              <li>Les données de paiement sont conservées 5 ans conformément aux obligations légales</li>
              <li>Les tokens de signature numérique sont supprimés immédiatement après utilisation (acceptation ou refus). La date de signature (<em>signedAt</em>) est conservée tant que le devis existe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Vos Droits</h2>
            <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong className="text-foreground">Droit d&apos;accès</strong> : consulter vos données personnelles à tout moment</li>
              <li><strong className="text-foreground">Droit de rectification</strong> : modifier vos informations depuis les paramètres</li>
              <li><strong className="text-foreground">Droit de suppression</strong> : supprimer votre compte et vos données</li>
              <li><strong className="text-foreground">Droit à la portabilité</strong> : exporter vos données (PDF, Excel)</li>
              <li><strong className="text-foreground">Droit d&apos;opposition</strong> : vous opposer à certains traitements</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:contact@nkapcontrol.com" className="text-emerald-400 hover:text-emerald-300">
                contact@nkapcontrol.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Cookies</h2>
            <p>
              Nkap Control utilise uniquement des cookies techniques nécessaires au fonctionnement
              de la plateforme (authentification, session). Aucun cookie publicitaire ou de tracking
              n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. Les modifications significatives seront
              communiquées par email ou notification sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact</h2>
            <p>
              Pour toute question concernant la protection de vos données :{" "}
              <a href="mailto:contact@nkapcontrol.com" className="text-emerald-400 hover:text-emerald-300">
                contact@nkapcontrol.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Nkap Control. Tous droits réservés.</p>
          <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
            Conditions d&apos;utilisation
          </Link>
        </div>
      </div>
    </div>
  );
}
