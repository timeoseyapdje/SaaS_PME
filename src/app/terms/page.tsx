import Link from "next/link";

export default function TermsPage() {
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
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-sm text-zinc-500 mb-10">
          Dernière mise à jour : 29 mars 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
              l&apos;utilisation de la plateforme <strong className="text-white">Nkap Control</strong>,
              un logiciel de gestion financière en ligne (SaaS) destiné aux Petites et Moyennes
              Entreprises (PME) au Cameroun et en Afrique francophone.
            </p>
            <p className="mt-2">
              En créant un compte ou en utilisant la plateforme, vous acceptez sans réserve
              les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Définitions</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white">Plateforme</strong> : le site web et l&apos;application Nkap Control accessible à l&apos;adresse nkap-control.vercel.app</li>
              <li><strong className="text-white">Utilisateur</strong> : toute personne physique ou morale créant un compte sur la Plateforme</li>
              <li><strong className="text-white">Entreprise</strong> : l&apos;entité commerciale associée au compte Utilisateur</li>
              <li><strong className="text-white">Abonnement</strong> : le plan souscrit par l&apos;Utilisateur (Starter, Pro ou Max)</li>
              <li><strong className="text-white">Contenu</strong> : toute donnée saisie par l&apos;Utilisateur (factures, dépenses, clients, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Inscription et Compte</h2>
            <p>
              Pour utiliser Nkap Control, l&apos;Utilisateur doit créer un compte en fournissant
              des informations exactes et à jour : nom, adresse email, nom de l&apos;entreprise et
              mot de passe.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>L&apos;Utilisateur est responsable de la confidentialité de ses identifiants</li>
              <li>Un seul compte par adresse email est autorisé</li>
              <li>L&apos;Utilisateur s&apos;engage à ne pas créer de faux comptes</li>
              <li>La ville par défaut est Douala, modifiable dans les paramètres</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Plans et Tarification</h2>
            <p>Nkap Control propose trois plans :</p>
            <div className="mt-3 space-y-2">
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <p className="font-semibold text-white">Starter — Gratuit</p>
                <p className="text-xs text-zinc-500 mt-1">1 utilisateur, 20 factures/mois, tableau de bord basique, gestion clients, export PDF</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-emerald-500/20">
                <p className="font-semibold text-emerald-400">Pro — 5 000 XAF/mois</p>
                <p className="text-xs text-zinc-500 mt-1">5 utilisateurs, factures illimitées, trésorerie multi-comptes, rapports fiscaux, Nkap AI (10 msg/jour), support prioritaire</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/50 border border-amber-500/20">
                <p className="font-semibold text-amber-400">Max — 15 000 XAF/mois</p>
                <p className="text-xs text-zinc-500 mt-1">Utilisateurs illimités, Nkap AI illimité, personnalisation avancée, API, support 24/7</p>
              </div>
            </div>
            <p className="mt-3">
              Les prix sont en Francs CFA (XAF) et peuvent être modifiés avec un préavis de 30 jours.
              Les codes promotionnels peuvent offrir des réductions sur les abonnements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Paiements</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Les paiements sont acceptés via MTN Mobile Money, Orange Money, virement bancaire et carte bancaire</li>
              <li>Les abonnements sont facturés mensuellement</li>
              <li>Les paiements par virement sont validés après réception effective des fonds</li>
              <li>Les comptes système (administrateur et démonstration) sont exemptés de paiement</li>
              <li>Aucun remboursement n&apos;est effectué pour les périodes partielles après résiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Résiliation</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>L&apos;Utilisateur peut résilier son abonnement à tout moment depuis les paramètres</li>
              <li>L&apos;accès au plan payant est maintenu jusqu&apos;à la fin de la période facturée</li>
              <li>Après résiliation, le compte repasse automatiquement au plan Starter</li>
              <li>L&apos;Utilisateur peut supprimer son compte et ses données à tout moment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Comptes Inactifs</h2>
            <p>
              Les comptes avec le rôle <strong className="text-white">Lecteur (Viewer)</strong> qui
              n&apos;ont eu aucune activité pendant une période de <strong className="text-white">6 mois
              consécutifs</strong> seront automatiquement supprimés. Un email de notification sera
              envoyé 30 jours avant la suppression.
            </p>
            <p className="mt-2">
              Les comptes Administrateur et Comptable ne sont pas concernés par cette politique.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Compte de Démonstration</h2>
            <p>
              Un compte de démonstration est disponible pour tester la plateforme. Ce compte est
              en <strong className="text-white">lecture seule</strong> : aucune modification de
              paramètres, d&apos;abonnement ou de données n&apos;est autorisée. Les données affichées
              sont fictives et à titre illustratif uniquement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Propriété des Données</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>L&apos;Utilisateur reste propriétaire de toutes les données qu&apos;il saisit sur la plateforme</li>
              <li>Nkap Control ne vend, ne partage et ne monétise pas les données des Utilisateurs</li>
              <li>Le super administrateur de la plateforme a accès aux informations d&apos;identification des entreprises (nom, RCCM, NIU, ville, email, téléphone) mais <strong className="text-white">n&apos;a aucun accès aux données financières</strong> (factures, revenus, dépenses, trésorerie) des Utilisateurs</li>
              <li>L&apos;Utilisateur peut exporter ses données à tout moment (PDF, Excel)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Fiscalité</h2>
            <p>
              Les taux fiscaux affichés (TVA 19,25%, IS 33%) sont ceux en vigueur au Cameroun
              conformément au Code Général des Impôts. Nkap Control fournit des outils de calcul
              et de déclaration mais <strong className="text-white">ne se substitue pas à un
              expert-comptable agréé</strong>. L&apos;Utilisateur est seul responsable de ses
              déclarations fiscales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Intelligence Artificielle (Nkap AI)</h2>
            <p>
              La fonctionnalité Nkap AI utilise l&apos;intelligence artificielle pour fournir des
              analyses et conseils financiers. Ces informations sont fournies à titre indicatif
              et ne constituent pas des conseils financiers professionnels. L&apos;Utilisateur est
              responsable des décisions prises sur la base de ces analyses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Rôles et Permissions</h2>
            <p>Trois rôles sont disponibles au sein d&apos;une entreprise :</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong className="text-white">Administrateur</strong> : accès complet à toutes les fonctionnalités</li>
              <li><strong className="text-white">Comptable</strong> : accès aux fonctions financières et de gestion</li>
              <li><strong className="text-white">Lecteur</strong> : accès en consultation uniquement</li>
            </ul>
            <p className="mt-2">
              Seul le Super Administrateur de la plateforme peut modifier les rôles des utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">13. Disponibilité</h2>
            <p>
              Nkap Control s&apos;efforce de maintenir la plateforme disponible 24h/24 et 7j/7.
              Toutefois, des interruptions pour maintenance peuvent survenir. En aucun cas
              Nkap Control ne pourra être tenu responsable des pertes liées à une indisponibilité
              temporaire du service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">14. Limitation de Responsabilité</h2>
            <p>
              Nkap Control est fourni &quot;tel quel&quot;. Nous ne garantissons pas que la plateforme
              sera exempte d&apos;erreurs ou d&apos;interruptions. La responsabilité de Nkap Control
              est limitée au montant des abonnements payés au cours des 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">15. Modifications des CGU</h2>
            <p>
              Nkap Control se réserve le droit de modifier les présentes CGU à tout moment.
              Les Utilisateurs seront informés par email ou notification sur la plateforme.
              La poursuite de l&apos;utilisation après modification vaut acceptation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">16. Droit Applicable</h2>
            <p>
              Les présentes CGU sont régies par le droit camerounais. Tout litige sera soumis
              aux juridictions compétentes de Douala, Cameroun.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">17. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU, contactez-nous à :{" "}
              <a href="mailto:contact@nkapcontrol.cm" className="text-emerald-400 hover:text-emerald-300">
                contact@nkapcontrol.cm
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800/50 text-center text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} Nkap Control. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
