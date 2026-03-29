import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300 mb-8 inline-block"
        >
          &larr; Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-zinc-500 mb-10">
          Dernière mise à jour : 29 mars 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              La présente Politique de Confidentialité décrit la manière dont
              <strong className="text-white"> Nkap Control</strong> collecte, utilise, stocke et
              protège les données personnelles de ses Utilisateurs. Nous nous engageons à
              respecter la vie privée de nos Utilisateurs conformément à la réglementation
              camerounaise en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Données Collectées</h2>
            <p>Nous collectons les catégories de données suivantes :</p>

            <h3 className="text-sm font-semibold text-white mt-4 mb-2">2.1 Données d&apos;identification</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom et prénom de l&apos;Utilisateur</li>
              <li>Adresse email</li>
              <li>Mot de passe (stocké de manière chiffrée avec bcrypt)</li>
              <li>Rôle au sein de l&apos;entreprise</li>
            </ul>

            <h3 className="text-sm font-semibold text-white mt-4 mb-2">2.2 Données de l&apos;entreprise</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom commercial et raison sociale</li>
              <li>Numéro RCCM et NIU</li>
              <li>Adresse, ville et pays</li>
              <li>Téléphone et email de l&apos;entreprise</li>
              <li>Site web</li>
            </ul>

            <h3 className="text-sm font-semibold text-white mt-4 mb-2">2.3 Données financières</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Factures émises et reçues</li>
              <li>Dépenses et revenus</li>
              <li>Soldes des comptes bancaires et mobile money</li>
              <li>Informations sur les clients et fournisseurs</li>
            </ul>

            <h3 className="text-sm font-semibold text-white mt-4 mb-2">2.4 Données de paiement</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Méthode de paiement choisie (MTN MoMo, Orange Money, virement, carte)</li>
              <li>Numéro de téléphone pour les paiements mobile money</li>
              <li>Historique des paiements d&apos;abonnement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Utilisation des Données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Fournir et améliorer les services de la plateforme</li>
              <li>Gérer votre compte et votre abonnement</li>
              <li>Générer vos factures, rapports et déclarations fiscales</li>
              <li>Fournir les analyses de l&apos;assistant Nkap AI</li>
              <li>Envoyer des notifications relatives à votre compte (emails transactionnels)</li>
              <li>Assurer le support client</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Protection des Données</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <p className="font-semibold text-white text-xs">Chiffrement</p>
                <p className="text-xs text-zinc-500 mt-1">Les mots de passe sont chiffrés avec bcrypt (12 rounds). Les communications sont protégées par HTTPS/TLS.</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <p className="font-semibold text-white text-xs">Hébergement</p>
                <p className="text-xs text-zinc-500 mt-1">Les données sont hébergées sur des serveurs sécurisés (Vercel + Neon PostgreSQL) avec des sauvegardes régulières.</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <p className="font-semibold text-white text-xs">Accès restreint</p>
                <p className="text-xs text-zinc-500 mt-1">L&apos;accès aux données est strictement limité par un système de rôles (Administrateur, Comptable, Lecteur).</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="font-semibold text-emerald-400 text-xs">Séparation des données</p>
                <p className="text-xs text-zinc-500 mt-1">Le super administrateur de la plateforme n&apos;a accès qu&apos;aux informations d&apos;identification des entreprises. <strong className="text-white">Il n&apos;a aucun accès à vos données financières</strong> (factures, revenus, dépenses, trésorerie).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Partage des Données</h2>
            <p className="font-semibold text-emerald-400">
              Nkap Control ne vend, ne loue et ne partage pas vos données personnelles avec des tiers.
            </p>
            <p className="mt-2">
              Vos données peuvent uniquement être communiquées dans les cas suivants :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Obligation légale (décision de justice, réquisition des autorités compétentes)</li>
              <li>Protection des droits de Nkap Control en cas de litige</li>
              <li>Sous-traitants techniques nécessaires au fonctionnement du service (hébergement, envoi d&apos;emails) sous contrat de confidentialité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Conservation des Données</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Les données de compte sont conservées tant que le compte est actif</li>
              <li>Les comptes <strong className="text-white">Lecteur (Viewer) inactifs depuis 6 mois</strong> sont automatiquement supprimés (notification envoyée 30 jours avant)</li>
              <li>En cas de suppression de compte, les données sont effacées dans un délai de 30 jours</li>
              <li>Les données de paiement sont conservées 5 ans conformément aux obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Vos Droits</h2>
            <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong className="text-white">Droit d&apos;accès</strong> : consulter vos données personnelles à tout moment</li>
              <li><strong className="text-white">Droit de rectification</strong> : modifier vos informations depuis les paramètres</li>
              <li><strong className="text-white">Droit de suppression</strong> : supprimer votre compte et vos données</li>
              <li><strong className="text-white">Droit à la portabilité</strong> : exporter vos données (PDF, Excel)</li>
              <li><strong className="text-white">Droit d&apos;opposition</strong> : vous opposer à certains traitements</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:contact@nkapcontrol.cm" className="text-emerald-400 hover:text-emerald-300">
                contact@nkapcontrol.cm
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Cookies</h2>
            <p>
              Nkap Control utilise uniquement des cookies techniques nécessaires au fonctionnement
              de la plateforme (authentification, session). Aucun cookie publicitaire ou de tracking
              n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. Les modifications significatives seront
              communiquées par email ou notification sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>
              Pour toute question concernant la protection de vos données :{" "}
              <a href="mailto:contact@nkapcontrol.cm" className="text-emerald-400 hover:text-emerald-300">
                contact@nkapcontrol.cm
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} Nkap Control. Tous droits réservés.</p>
          <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">
            Conditions d&apos;utilisation
          </Link>
        </div>
      </div>
    </div>
  );
}
