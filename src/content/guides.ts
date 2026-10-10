export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "callout"; title: string; text: string };

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: "Facturation" | "Fiscalité" | "Trésorerie" | "Comptabilité" | "Gestion";
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  body: GuideBlock[];
}

export const guides: Guide[] = [
  {
    slug: "mentions-obligatoires-facture-cameroun",
    title: "Les mentions obligatoires d'une facture au Cameroun",
    description:
      "NIU, RCCM, numérotation, TVA, conditions de paiement : la liste complète des informations à faire figurer sur vos factures pour qu'elles soient valables et déductibles.",
    category: "Facturation",
    publishedAt: "2026-06-02",
    updatedAt: "2026-10-08",
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: "Une facture n'est pas un simple reçu. C'est une pièce comptable et fiscale : elle prouve la vente, fixe la date d'exigibilité de la TVA et permet à votre client professionnel de déduire cette TVA. Une facture incomplète peut être rejetée par le service comptable du client, retarder votre paiement, ou être remise en cause lors d'un contrôle de la Direction Générale des Impôts (DGI). Voici, rubrique par rubrique, ce qu'une facture émise par une PME camerounaise doit contenir.",
      },
      { type: "h2", text: "1. L'identité complète du vendeur" },
      {
        type: "p",
        text: "Votre client doit pouvoir identifier sans ambiguïté l'entreprise qui facture. Faites apparaître en en-tête :",
      },
      {
        type: "ul",
        items: [
          "la raison sociale ou le nom commercial, et la forme juridique (SARL, SA, SAS, Établissement…) ;",
          "l'adresse du siège (ville, quartier, boîte postale) ;",
          "le Numéro d'Identifiant Unique (NIU) délivré par l'administration fiscale ;",
          "le numéro d'immatriculation au Registre du Commerce et du Crédit Mobilier (RCCM) ;",
          "un téléphone et une adresse email de contact.",
        ],
      },
      {
        type: "callout",
        title: "Le NIU, mention la plus souvent oubliée",
        text: "Les grandes entreprises et les administrations refusent fréquemment une facture sans NIU, car elles ne peuvent pas justifier la déduction de TVA ni effectuer correctement les retenues à la source. Ajoutez-le une fois pour toutes dans votre modèle.",
      },
      { type: "h2", text: "2. L'identité du client" },
      {
        type: "p",
        text: "Pour un client professionnel, indiquez sa raison sociale, son adresse et, idéalement, son NIU. Pour un particulier, le nom et la ville suffisent en général. Plus l'identification est précise, plus la facture est opposable en cas de litige.",
      },
      { type: "h2", text: "3. Une numérotation unique et continue" },
      {
        type: "p",
        text: "Chaque facture porte un numéro unique, attribué dans un ordre chronologique et sans rupture. Un « trou » dans la séquence (FAC-0012 puis FAC-0014) est un signal d'alerte pour un vérificateur, qui peut y voir une vente dissimulée. Un format lisible comme FAC-2026-0001 permet de repartir à 1 chaque année tout en restant unique.",
      },
      {
        type: "p",
        text: "Une facture émise ne se supprime pas et ne se modifie pas. Si elle contient une erreur, on émet un avoir (note de crédit) qui l'annule totalement ou partiellement, puis une nouvelle facture correcte.",
      },
      { type: "h2", text: "4. Les dates" },
      {
        type: "ul",
        items: [
          "la date d'émission de la facture ;",
          "la date de la livraison ou de la fin de la prestation, si elle diffère ;",
          "la date d'échéance du paiement.",
        ],
      },
      { type: "h2", text: "5. Le détail de ce qui est vendu" },
      {
        type: "p",
        text: "Pour chaque ligne : une désignation précise (pas seulement « prestation »), la quantité, l'unité, le prix unitaire hors taxe et le montant hors taxe de la ligne. Si vous accordez une remise, faites-la apparaître clairement, ligne par ligne ou globalement.",
      },
      { type: "h2", text: "6. Les montants et la TVA" },
      {
        type: "p",
        text: "En bas de facture, on attend au minimum le total hors taxe (HT), le taux et le montant de la TVA, puis le total toutes taxes comprises (TTC). Au Cameroun, le taux global habituellement appliqué est de 19,25 % (TVA de 17,5 % majorée des centimes additionnels communaux). Si une opération est exonérée, indiquez la mention d'exonération plutôt qu'un simple 0 %.",
      },
      {
        type: "table",
        head: ["Rubrique", "Exemple"],
        rows: [
          ["Total HT", "500 000 FCFA"],
          ["TVA 19,25 %", "96 250 FCFA"],
          ["Total TTC", "596 250 FCFA"],
        ],
      },
      { type: "h2", text: "7. Les conditions de paiement" },
      {
        type: "p",
        text: "Précisez le délai (à réception, 30 jours…), les moyens de paiement acceptés (virement, chèque, MTN Mobile Money, Orange Money, espèces) avec les coordonnées correspondantes : RIB, numéro marchand ou numéro de téléphone. C'est l'information qui accélère le plus l'encaissement : un client qui sait immédiatement comment payer paie plus vite.",
      },
      { type: "h2", text: "Checklist avant d'envoyer une facture" },
      {
        type: "ol",
        items: [
          "Le NIU et le RCCM figurent-ils dans l'en-tête ?",
          "Le numéro suit-il bien le précédent ?",
          "Chaque ligne a-t-elle une désignation claire, une quantité et un prix HT ?",
          "Le calcul HT → TVA → TTC est-il juste ?",
          "La date d'échéance et le moyen de paiement sont-ils indiqués ?",
          "Le nom du client est-il correctement orthographié ?",
        ],
      },
      {
        type: "callout",
        title: "À retenir",
        text: "Les règles fiscales évoluent avec chaque loi de finances. En cas de doute sur un cas particulier (exonération, retenue à la source, marché public), validez avec votre centre des impôts ou un expert-comptable agréé.",
      },
    ],
  },
  {
    slug: "calcul-tva-cameroun-ht-ttc",
    title: "TVA au Cameroun : calculer HT, TVA et TTC sans erreur",
    description:
      "Le taux de 19,25 % expliqué simplement, les formules pour passer du HT au TTC et inversement, et les erreurs d'arrondi qui faussent vos déclarations.",
    category: "Fiscalité",
    publishedAt: "2026-06-10",
    updatedAt: "2026-10-08",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "La TVA est un impôt que l'entreprise collecte pour le compte de l'État. Elle ne vous appartient pas : vous l'encaissez auprès de vos clients, vous déduisez celle que vous avez payée à vos fournisseurs, et vous reversez la différence. Bien la calculer évite deux problèmes : perdre de la marge en l'oubliant dans vos prix, ou déclarer un montant faux.",
      },
      { type: "h2", text: "D'où vient le taux de 19,25 % ?" },
      {
        type: "p",
        text: "Le taux normal de TVA au Cameroun est de 17,5 %. S'y ajoutent les centimes additionnels communaux (CAC), égaux à 10 % du montant de la TVA. 17,5 % + (10 % × 17,5 %) = 17,5 % + 1,75 % = 19,25 %. C'est ce taux global que l'on applique en pratique sur les factures soumises au taux normal.",
      },
      { type: "h2", text: "Passer du HT au TTC" },
      {
        type: "p",
        text: "Formule : TTC = HT × 1,1925. Le montant de la taxe est TVA = HT × 0,1925.",
      },
      {
        type: "table",
        head: ["Prix HT", "TVA (19,25 %)", "Prix TTC"],
        rows: [
          ["10 000 FCFA", "1 925 FCFA", "11 925 FCFA"],
          ["150 000 FCFA", "28 875 FCFA", "178 875 FCFA"],
          ["1 000 000 FCFA", "192 500 FCFA", "1 192 500 FCFA"],
        ],
      },
      { type: "h2", text: "Retrouver le HT à partir d'un prix TTC" },
      {
        type: "p",
        text: "C'est l'erreur la plus fréquente : pour retrouver le HT, on ne retire pas 19,25 % du TTC. On divise : HT = TTC ÷ 1,1925.",
      },
      {
        type: "p",
        text: "Exemple : un client vous impose un budget de 100 000 FCFA TTC. Le HT est 100 000 ÷ 1,1925 = 83 857 FCFA, et la TVA 16 143 FCFA. Si vous aviez retiré 19,25 % (100 000 − 19 250 = 80 750), vous auriez sous-facturé votre prestation de plus de 3 000 FCFA.",
      },
      { type: "h2", text: "TVA collectée, TVA déductible, TVA à payer" },
      {
        type: "ul",
        items: [
          "TVA collectée : la TVA figurant sur vos factures de vente.",
          "TVA déductible : la TVA figurant sur les factures de vos fournisseurs (achats, prestations, certains investissements), à condition que ces factures soient régulières.",
          "TVA à reverser = TVA collectée − TVA déductible. Si le résultat est négatif, vous disposez d'un crédit de TVA.",
        ],
      },
      {
        type: "p",
        text: "Exemple mensuel : vous avez facturé 4 000 000 FCFA HT (770 000 FCFA de TVA collectée) et acheté 1 500 000 FCFA HT de marchandises (288 750 FCFA de TVA déductible). Vous reversez 481 250 FCFA.",
      },
      { type: "h2", text: "Les pièges d'arrondi" },
      {
        type: "p",
        text: "Le franc CFA n'a pas de centimes en pratique. Calculez la TVA ligne par ligne ou sur le total, mais choisissez une méthode et tenez-vous-y. Arrondir chaque ligne puis additionner peut donner quelques francs d'écart avec un calcul sur le total ; sur des centaines de factures, ces écarts compliquent le rapprochement avec votre déclaration.",
      },
      { type: "h2", text: "Qui est concerné ?" },
      {
        type: "p",
        text: "L'assujettissement à la TVA dépend du régime fiscal de l'entreprise, lui-même lié à son chiffre d'affaires. Les entreprises du régime réel facturent et déclarent la TVA ; les très petites entreprises relevant de l'impôt libératoire n'en facturent généralement pas. Vérifiez votre régime sur votre attestation fiscale ou auprès de votre centre des impôts.",
      },
      {
        type: "callout",
        title: "Bon réflexe",
        text: "Fixez vos prix en HT dans votre catalogue et laissez votre logiciel calculer la TVA. Vous évitez les erreurs de conversion et votre marge reste lisible.",
      },
    ],
  },
  {
    slug: "devis-facture-proforma-difference",
    title: "Devis, facture proforma, facture : quelle différence ?",
    description:
      "Trois documents qui se ressemblent mais n'ont pas la même valeur juridique. Quand utiliser chacun, et comment passer de l'un à l'autre sans erreur.",
    category: "Facturation",
    publishedAt: "2026-06-18",
    updatedAt: "2026-10-08",
    readingMinutes: 5,
    body: [
      {
        type: "p",
        text: "Dans les échanges commerciaux au Cameroun, on entend souvent « envoyez-moi une proforma » alors que le client attend un devis, ou l'inverse. Les confondre n'est pas grave en soi, mais savoir ce que chaque document engage vous protège en cas de désaccord.",
      },
      { type: "h2", text: "Le devis : une proposition qui engage le vendeur" },
      {
        type: "p",
        text: "Le devis décrit précisément ce que vous proposez de fournir et à quel prix. Il porte une durée de validité (30 jours, par exemple). Tant que le client ne l'a pas accepté, il ne l'engage pas. Une fois signé ou accepté par écrit (« bon pour accord »), il devient un contrat : vous devez livrer au prix indiqué, et le client doit payer.",
      },
      {
        type: "ul",
        items: [
          "Numérotez vos devis séparément des factures (par exemple DEV-2026-0001).",
          "Indiquez une date limite de validité, surtout si vos coûts d'achat fluctuent.",
          "Précisez les conditions : acompte, délai de livraison, ce qui n'est pas inclus.",
        ],
      },
      { type: "h2", text: "La facture proforma : un document d'information" },
      {
        type: "p",
        text: "La proforma a l'apparence d'une facture mais n'en a pas la valeur. Elle sert surtout à permettre au client d'engager une démarche : obtenir un financement, débloquer un budget, ouvrir une lettre de crédit, préparer un dédouanement. Elle n'est pas enregistrée en comptabilité et ne génère pas de TVA à reverser. Pensez à y inscrire clairement « Facture proforma ».",
      },
      { type: "h2", text: "La facture : la pièce comptable définitive" },
      {
        type: "p",
        text: "La facture constate la vente réalisée. Elle est enregistrée en comptabilité, déclenche la TVA collectée et constitue la créance sur le client. Elle doit comporter toutes les mentions obligatoires et suit une numérotation continue.",
      },
      {
        type: "table",
        head: ["", "Devis", "Proforma", "Facture"],
        rows: [
          ["Engage juridiquement", "Oui, une fois accepté", "Non", "Oui"],
          ["Enregistrée en comptabilité", "Non", "Non", "Oui"],
          ["TVA à reverser", "Non", "Non", "Oui"],
          ["Usage principal", "Négocier, faire accepter", "Financement, douane, budget", "Encaisser"],
        ],
      },
      { type: "h2", text: "Le bon enchaînement" },
      {
        type: "ol",
        items: [
          "Vous envoyez un devis ; le client l'accepte.",
          "Si besoin, vous émettez une facture d'acompte.",
          "Après livraison, vous convertissez le devis en facture, en reprenant exactement les lignes acceptées et en déduisant l'acompte déjà facturé.",
        ],
      },
      {
        type: "p",
        text: "Convertir le devis plutôt que ressaisir la facture évite les écarts entre ce qui a été accepté et ce qui est facturé — première source de contestation et donc de retard de paiement.",
      },
    ],
  },
  {
    slug: "plan-de-tresorerie-pme",
    title: "Construire un plan de trésorerie simple pour sa PME",
    description:
      "Une méthode en cinq étapes pour anticiper les mois difficiles, payer salaires et fournisseurs à temps et éviter les découverts, avec un exemple chiffré.",
    category: "Trésorerie",
    publishedAt: "2026-07-01",
    updatedAt: "2026-10-08",
    readingMinutes: 8,
    body: [
      {
        type: "p",
        text: "Beaucoup d'entreprises rentables ferment parce qu'elles manquent de liquidités au mauvais moment : un gros client paie avec trois mois de retard pendant que les salaires, le loyer et les fournisseurs n'attendent pas. Le plan de trésorerie sert à voir ces moments venir, plusieurs semaines à l'avance.",
      },
      { type: "h2", text: "Résultat et trésorerie : ne pas confondre" },
      {
        type: "p",
        text: "Le résultat mesure si vous gagnez de l'argent sur la période (ventes facturées moins charges). La trésorerie mesure l'argent réellement disponible sur vos comptes, en caisse et sur vos portefeuilles Mobile Money. Une vente facturée en mars et payée en juin améliore votre résultat de mars mais votre trésorerie de juin seulement.",
      },
      { type: "h2", text: "Étape 1 : partir du solde réel" },
      {
        type: "p",
        text: "Additionnez tout ce qui est disponible aujourd'hui : comptes bancaires, caisse, comptes MTN Mobile Money et Orange Money professionnels. C'est votre point de départ. S'il est faux, tout le plan l'est.",
      },
      { type: "h2", text: "Étape 2 : lister les encaissements attendus" },
      {
        type: "ul",
        items: [
          "Factures déjà émises non payées, placées au mois où vous pensez réellement être payé (pas à la date d'échéance théorique si le client paie toujours en retard).",
          "Ventes prévues, avec prudence.",
          "Autres entrées : apport, prêt, subvention, remboursement de crédit de TVA.",
        ],
      },
      { type: "h2", text: "Étape 3 : lister les décaissements" },
      {
        type: "ul",
        items: [
          "Charges fixes : salaires et cotisations CNPS, loyer, électricité, internet, abonnements.",
          "Achats de marchandises et paiements aux fournisseurs.",
          "Impôts et taxes : TVA à reverser, acomptes, patente.",
          "Remboursements d'emprunt et investissements.",
        ],
      },
      { type: "h2", text: "Étape 4 : calculer mois par mois" },
      {
        type: "p",
        text: "Solde de fin de mois = solde de début + encaissements − décaissements. Le solde de fin d'un mois devient le solde de début du suivant.",
      },
      {
        type: "table",
        head: ["(en milliers FCFA)", "Octobre", "Novembre", "Décembre"],
        rows: [
          ["Solde début", "2 400", "1 650", "-150"],
          ["Encaissements", "3 200", "2 100", "5 600"],
          ["Décaissements", "3 950", "3 900", "4 100"],
          ["Solde fin", "1 650", "-150", "1 350"],
        ],
      },
      {
        type: "p",
        text: "Dans cet exemple, l'entreprise est rentable sur le trimestre, mais elle sera à découvert fin novembre. Le savoir dès octobre laisse le temps d'agir.",
      },
      { type: "h2", text: "Étape 5 : agir sur les mois tendus" },
      {
        type: "ul",
        items: [
          "Relancer plus tôt les factures en retard, ou proposer un paiement Mobile Money immédiat.",
          "Demander un acompte de 30 à 50 % sur les nouvelles commandes.",
          "Négocier un étalement avec un fournisseur avant l'échéance, pas après.",
          "Décaler un achat non urgent.",
          "Solliciter une facilité de caisse en présentant votre plan à la banque.",
        ],
      },
      {
        type: "callout",
        title: "Le rythme qui fonctionne",
        text: "Mettez à jour le plan chaque semaine, en remplaçant les prévisions par les montants réels. Quinze minutes par semaine suffisent, et l'exercice devient vite un réflexe.",
      },
    ],
  },
  {
    slug: "mobile-money-comptabilite-entreprise",
    title: "MTN MoMo et Orange Money : bien les gérer dans sa comptabilité",
    description:
      "Séparer les comptes, traiter les frais, rapprocher les relevés : les bonnes pratiques pour que les paiements Mobile Money ne deviennent pas un trou noir comptable.",
    category: "Comptabilité",
    publishedAt: "2026-07-15",
    updatedAt: "2026-10-08",
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: "Le Mobile Money est devenu le premier moyen de paiement de nombreuses PME camerounaises. Il est rapide et pratique, mais il crée un risque : des dizaines de petites transactions mêlées aux dépenses personnelles, sans facture associée. En fin d'année, impossible de justifier le chiffre d'affaires.",
      },
      { type: "h2", text: "Règle n° 1 : un numéro dédié à l'entreprise" },
      {
        type: "p",
        text: "N'utilisez jamais votre numéro personnel pour encaisser les clients. Ouvrez un compte marchand ou, à défaut, une ligne réservée à l'activité. C'est la condition pour que le relevé du portefeuille reflète uniquement l'activité de l'entreprise.",
      },
      { type: "h2", text: "Règle n° 2 : traiter chaque portefeuille comme un compte bancaire" },
      {
        type: "p",
        text: "En comptabilité SYSCOHADA, un portefeuille Mobile Money se suit comme un compte de trésorerie à part entière, avec son propre solde. Chaque entrée doit correspondre à une facture ou à un encaissement identifié, chaque sortie à une dépense justifiée ou à un transfert vers la banque.",
      },
      { type: "h2", text: "Règle n° 3 : enregistrer les frais à part" },
      {
        type: "p",
        text: "Lorsqu'un client paie 50 000 FCFA, vous ne recevez pas forcément 50 000 FCFA nets. La vente reste de 50 000 FCFA ; la différence est une charge (frais de services bancaires et assimilés). Enregistrer seulement le net fausserait votre chiffre d'affaires et vos déclarations.",
      },
      {
        type: "table",
        head: ["Opération", "Montant"],
        rows: [
          ["Facture client (TTC)", "50 000 FCFA"],
          ["Frais prélevés par l'opérateur", "500 FCFA → charge"],
          ["Montant net reçu sur le portefeuille", "49 500 FCFA"],
        ],
      },
      { type: "h2", text: "Règle n° 4 : rapprocher chaque semaine" },
      {
        type: "ol",
        items: [
          "Exportez l'historique du portefeuille (application ou relevé de l'opérateur).",
          "Pointez chaque entrée avec la facture payée correspondante.",
          "Pointez chaque sortie avec un justificatif.",
          "Vérifiez que le solde théorique de votre logiciel égale le solde affiché par l'opérateur.",
        ],
      },
      {
        type: "p",
        text: "Le rapprochement hebdomadaire prend quelques minutes. Fait une fois par an, il devient un casse-tête de plusieurs jours, avec des montants impossibles à retrouver.",
      },
      { type: "h2", text: "Règle n° 5 : vider régulièrement vers la banque" },
      {
        type: "p",
        text: "Les plafonds des portefeuilles et le risque de fraude incitent à transférer régulièrement le solde vers le compte bancaire. Ce transfert n'est ni une recette ni une dépense : c'est un mouvement interne entre deux comptes de trésorerie, à enregistrer comme tel.",
      },
      {
        type: "callout",
        title: "Liens de paiement",
        text: "Envoyer au client un lien de paiement rattaché à une facture précise règle la moitié du problème : chaque encaissement arrive déjà identifié, ce qui rend le rapprochement presque automatique.",
      },
    ],
  },
  {
    slug: "relancer-factures-impayees",
    title: "Relancer ses factures impayées sans abîmer la relation client",
    description:
      "Calendrier de relance, modèles de messages par WhatsApp et email, et ce que vous pouvez faire quand un client ne paie toujours pas.",
    category: "Gestion",
    publishedAt: "2026-08-04",
    updatedAt: "2026-10-08",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "Les retards de paiement sont l'une des premières causes de difficultés des PME. Pourtant, beaucoup de gérants hésitent à relancer de peur de froisser un bon client. En réalité, une relance polie et régulière est perçue comme du professionnalisme ; c'est l'absence de suivi qui fait passer votre facture en bas de la pile.",
      },
      { type: "h2", text: "Prévenir plutôt que relancer" },
      {
        type: "ul",
        items: [
          "Mettez la date d'échéance et le moyen de paiement bien en évidence sur la facture.",
          "Envoyez la facture le jour même de la livraison, pas en fin de mois.",
          "Demandez un acompte sur les commandes importantes.",
          "Confirmez dès le départ le nom de la personne qui valide les paiements chez le client.",
        ],
      },
      { type: "h2", text: "Un calendrier de relance type" },
      {
        type: "table",
        head: ["Moment", "Action", "Ton"],
        rows: [
          ["J-3 avant échéance", "Rappel courtois de l'échéance", "Informatif"],
          ["J+3", "Première relance écrite (email ou WhatsApp)", "Cordial"],
          ["J+10", "Appel téléphonique", "Direct"],
          ["J+20", "Relance écrite ferme, nouvelle date de paiement", "Ferme"],
          ["J+30 et au-delà", "Mise en demeure", "Formel"],
        ],
      },
      { type: "h2", text: "Exemples de messages" },
      { type: "h3", text: "Première relance" },
      {
        type: "p",
        text: "« Bonjour M. Nana, sauf erreur de notre part, la facture FAC-2026-0142 de 350 000 FCFA, arrivée à échéance le 5 octobre, n'a pas encore été réglée. Vous pouvez la payer par virement ou par Mobile Money via le lien ci-joint. Merci d'avance, et bonne journée. »",
      },
      { type: "h3", text: "Relance ferme" },
      {
        type: "p",
        text: "« Bonjour, malgré nos précédents messages, la facture FAC-2026-0142 reste impayée à ce jour. Nous vous remercions de procéder au règlement avant le 30 octobre. Sans retour de votre part, nous serons contraints de suspendre les prochaines livraisons. »",
      },
      { type: "h2", text: "Quand le client ne paie toujours pas" },
      {
        type: "ol",
        items: [
          "Proposez un échéancier écrit : mieux vaut être payé en trois fois que pas du tout.",
          "Suspendez les nouvelles livraisons jusqu'à régularisation.",
          "Envoyez une mise en demeure par écrit avec accusé de réception.",
          "En dernier recours, la procédure OHADA d'injonction de payer permet d'obtenir un titre exécutoire pour une créance certaine, liquide et exigible ; un avocat ou un huissier peut vous accompagner.",
        ],
      },
      {
        type: "callout",
        title: "Mesurer pour progresser",
        text: "Suivez chaque mois le montant total de vos factures en retard et le délai moyen de paiement par client. Vous identifierez rapidement les clients à qui demander systématiquement un acompte.",
      },
    ],
  },
  {
    slug: "syscohada-bases-pour-dirigeants",
    title: "SYSCOHADA révisé : les bases à connaître quand on dirige une PME",
    description:
      "Le plan comptable OHADA expliqué aux non-comptables : les 9 classes de comptes, les états financiers obligatoires et ce que votre comptable attend de vous.",
    category: "Comptabilité",
    publishedAt: "2026-08-20",
    updatedAt: "2026-10-08",
    readingMinutes: 8,
    body: [
      {
        type: "p",
        text: "Le SYSCOHADA (Système Comptable OHADA) est le référentiel comptable commun aux 17 États membres de l'OHADA, dont le Cameroun. Sa version révisée s'applique aux comptes des entreprises depuis l'exercice 2018. Vous n'avez pas besoin d'être comptable, mais comprendre sa logique vous aide à mieux dialoguer avec votre expert-comptable et à lire vos propres chiffres.",
      },
      { type: "h2", text: "Les 9 classes de comptes" },
      {
        type: "table",
        head: ["Classe", "Contenu", "Exemples"],
        rows: [
          ["1", "Ressources durables", "Capital, réserves, emprunts"],
          ["2", "Actif immobilisé", "Matériel, véhicules, logiciels"],
          ["3", "Stocks", "Marchandises, matières premières"],
          ["4", "Tiers", "Clients, fournisseurs, État (TVA), personnel"],
          ["5", "Trésorerie", "Banque, caisse, Mobile Money"],
          ["6", "Charges", "Achats, loyers, salaires, frais bancaires"],
          ["7", "Produits", "Ventes, prestations de services"],
          ["8", "Autres charges et produits", "Éléments hors activité ordinaire"],
          ["9", "Comptabilité analytique", "Suivi interne par activité"],
        ],
      },
      {
        type: "p",
        text: "Les classes 1 à 5 composent le bilan (ce que l'entreprise possède et doit). Les classes 6 et 7 forment le compte de résultat (ce qu'elle a gagné ou perdu sur l'année).",
      },
      { type: "h2", text: "Les états financiers annuels" },
      {
        type: "ul",
        items: [
          "le bilan ;",
          "le compte de résultat ;",
          "le tableau des flux de trésorerie ;",
          "les notes annexes.",
        ],
      },
      {
        type: "p",
        text: "Le SYSCOHADA prévoit aussi un système minimal de trésorerie (SMT), allégé, pour les très petites entités dont le chiffre d'affaires est inférieur à certains seuils. Votre comptable vous dira lequel s'applique à vous.",
      },
      { type: "h2", text: "Ce que votre comptable attend de vous" },
      {
        type: "ol",
        items: [
          "Toutes les factures de vente, numérotées dans l'ordre, y compris les avoirs.",
          "Toutes les factures d'achat et justificatifs de dépenses, classés par mois.",
          "Les relevés bancaires et les historiques Mobile Money.",
          "Un état de la caisse.",
          "L'inventaire des stocks en fin d'exercice.",
        ],
      },
      {
        type: "p",
        text: "Plus ces pièces sont complètes et classées tout au long de l'année, moins la clôture coûte cher en honoraires et en temps. Un outil qui centralise factures, dépenses et comptes de trésorerie permet de transmettre un export propre en quelques clics.",
      },
      {
        type: "callout",
        title: "Une règle de base",
        text: "Pas de dépense sans justificatif, pas de vente sans facture. C'est le principe qui rend tout le reste possible.",
      },
    ],
  },
  {
    slug: "gestion-de-stock-petite-entreprise",
    title: "Gestion de stock : les méthodes simples qui évitent les pertes",
    description:
      "Seuil d'alerte, inventaire tournant, coût moyen pondéré : comment savoir ce que vous avez, ce que ça vaut et quand recommander.",
    category: "Gestion",
    publishedAt: "2026-09-08",
    updatedAt: "2026-10-08",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "Pour une boutique, un grossiste ou un atelier, le stock représente souvent la plus grosse somme immobilisée. Trop de stock bloque la trésorerie ; pas assez fait perdre des ventes. Entre les deux, les écarts inexpliqués (casse, vol, erreurs de saisie) grignotent la marge sans que personne ne s'en rende compte.",
      },
      { type: "h2", text: "1. Enregistrer chaque mouvement" },
      {
        type: "p",
        text: "Chaque entrée (achat, retour client) et chaque sortie (vente, casse, usage interne) doit être enregistrée au moment où elle a lieu. Une fiche de stock à jour vaut mieux que le meilleur inventaire annuel.",
      },
      { type: "h2", text: "2. Fixer un seuil d'alerte par article" },
      {
        type: "p",
        text: "Seuil d'alerte = consommation moyenne par jour × délai de réapprovisionnement en jours + stock de sécurité.",
      },
      {
        type: "p",
        text: "Exemple : vous vendez 12 sacs de ciment par jour, votre fournisseur livre en 4 jours, et vous gardez 20 sacs de sécurité. Seuil = 12 × 4 + 20 = 68 sacs. Dès que le stock passe sous 68, vous recommandez.",
      },
      { type: "h2", text: "3. Valoriser le stock au coût moyen pondéré" },
      {
        type: "p",
        text: "Quand vos prix d'achat varient, la méthode du coût moyen unitaire pondéré (CMUP), admise par le SYSCOHADA, est la plus simple : après chaque achat, on recalcule le coût moyen de l'article.",
      },
      {
        type: "table",
        head: ["Opération", "Quantité", "Prix unitaire", "Valeur"],
        rows: [
          ["Stock initial", "100", "4 500", "450 000"],
          ["Achat", "50", "4 800", "240 000"],
          ["Nouveau stock", "150", "4 600 (CMUP)", "690 000"],
        ],
      },
      { type: "h2", text: "4. Pratiquer l'inventaire tournant" },
      {
        type: "p",
        text: "Plutôt que de fermer la boutique une journée par an, comptez chaque semaine une petite partie des articles, en commençant par ceux de plus forte valeur. Tout écart entre le compté et le théorique est analysé tout de suite, quand on se souvient encore de ce qui s'est passé.",
      },
      { type: "h2", text: "5. Suivre trois indicateurs" },
      {
        type: "ul",
        items: [
          "la valeur totale du stock ;",
          "la rotation : combien de fois le stock est vendu et renouvelé dans l'année ;",
          "les articles dormants : ceux qui n'ont pas bougé depuis 90 jours, à écouler en promotion.",
        ],
      },
      {
        type: "callout",
        title: "Relier stock et facturation",
        text: "Quand la facture de vente déduit automatiquement les quantités du stock, la fiche est toujours juste et les écarts deviennent immédiatement visibles.",
      },
    ],
  },
  {
    slug: "fixer-ses-prix-calculer-sa-marge",
    title: "Fixer ses prix et calculer sa marge : la méthode pas à pas",
    description:
      "Coût de revient, marge, taux de marque, seuil de rentabilité : comment fixer un prix de vente qui couvre vraiment vos charges, avec des exemples en FCFA.",
    category: "Gestion",
    publishedAt: "2026-10-13",
    updatedAt: "2026-10-13",
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: "Beaucoup de commerçants fixent leurs prix en regardant le voisin, puis ajoutent « un petit bénéfice ». Le résultat est souvent le même : beaucoup de ventes, peu d'argent en fin de mois. Un prix de vente se construit à partir de vos propres coûts. Voici une méthode simple, applicable aussi bien à une boutique qu'à une activité de services.",
      },
      { type: "h2", text: "1. Calculer le coût de revient réel" },
      {
        type: "p",
        text: "Le coût de revient, c'est tout ce qu'un produit vous coûte avant d'être vendu. Pour un article acheté pour être revendu, il ne se limite pas au prix payé au fournisseur.",
      },
      {
        type: "ul",
        items: [
          "le prix d'achat hors taxe ;",
          "le transport jusqu'à votre magasin (taxi, moto, camion, frais de chargement) ;",
          "les frais de dédouanement si le produit est importé ;",
          "les pertes habituelles : casse, produits périmés, invendus.",
        ],
      },
      {
        type: "p",
        text: "Exemple : vous achetez des cartons de savon à 9 000 FCFA HT l'unité. Le transport coûte 15 000 FCFA pour 30 cartons, soit 500 FCFA par carton, et vous perdez en moyenne 1 carton sur 30 (abîmé ou invendable). Coût de revient d'un carton vendu : (9 000 + 500) × 30 ÷ 29 ≈ 9 830 FCFA, et non 9 000 FCFA.",
      },
      { type: "h2", text: "2. Répartir les charges fixes" },
      {
        type: "p",
        text: "Le loyer, l'électricité, le salaire du vendeur, la patente, internet : ces charges existent même si vous ne vendez rien. Elles doivent être couvertes par l'ensemble de vos ventes. Additionnez-les sur un mois pour savoir combien votre marge totale doit rapporter, au minimum, chaque mois.",
      },
      {
        type: "table",
        head: ["Charge fixe mensuelle", "Montant"],
        rows: [
          ["Loyer de la boutique", "150 000 FCFA"],
          ["Salaire du vendeur", "80 000 FCFA"],
          ["Électricité et eau", "25 000 FCFA"],
          ["Internet, téléphone, divers", "20 000 FCFA"],
          ["Total", "275 000 FCFA"],
        ],
      },
      { type: "h2", text: "3. Marge, taux de marge et taux de marque" },
      {
        type: "p",
        text: "La marge est la différence entre le prix de vente hors taxe et le coût de revient. Deux pourcentages servent à l'exprimer, et on les confond souvent :",
      },
      {
        type: "ul",
        items: [
          "le taux de marge = marge ÷ coût de revient ;",
          "le taux de marque = marge ÷ prix de vente HT.",
        ],
      },
      {
        type: "p",
        text: "Si un article vous revient à 10 000 FCFA et que vous le vendez 12 500 FCFA HT, la marge est de 2 500 FCFA. Le taux de marge est de 25 %, mais le taux de marque n'est que de 20 %. Quand un fournisseur ou un associé parle de « 25 % de marge », demandez toujours sur quelle base il calcule.",
      },
      { type: "h2", text: "4. Calculer le prix de vente" },
      {
        type: "p",
        text: "Pour obtenir un taux de marque visé, divisez le coût de revient par (1 − taux de marque). Pour viser 30 % de marque sur un carton qui revient à 9 830 FCFA : 9 830 ÷ 0,70 ≈ 14 040 FCFA HT. Si vous êtes assujetti à la TVA, le prix affiché au client sera 14 040 × 1,1925 ≈ 16 740 FCFA TTC.",
      },
      {
        type: "callout",
        title: "Erreur fréquente",
        text: "Ajouter 30 % au coût de revient (9 830 × 1,30 = 12 780 FCFA) ne donne pas 30 % de marque, mais seulement 23 %. Sur des centaines d'articles, l'écart représente beaucoup d'argent.",
      },
      { type: "h2", text: "5. Vérifier le seuil de rentabilité" },
      {
        type: "p",
        text: "Le seuil de rentabilité est le chiffre d'affaires à partir duquel vos marges couvrent toutes vos charges fixes. Formule : seuil = charges fixes ÷ taux de marque.",
      },
      {
        type: "p",
        text: "Avec 275 000 FCFA de charges fixes par mois et un taux de marque moyen de 30 %, il faut vendre 275 000 ÷ 0,30 ≈ 917 000 FCFA HT par mois avant de gagner le moindre franc. En dessous, l'activité perd de l'argent, même si chaque vente « rapporte ».",
      },
      { type: "h2", text: "6. Confronter le prix au marché" },
      {
        type: "p",
        text: "Une fois votre prix calculé, comparez-le aux prix pratiqués autour de vous. S'il est nettement plus élevé, ne baissez pas aveuglément : cherchez d'abord où réduire le coût de revient (acheter en plus grande quantité, regrouper les transports, négocier avec un autre fournisseur) ou comment justifier la différence (livraison, conseil, garantie, paiement Mobile Money accepté).",
      },
      {
        type: "callout",
        title: "À retenir",
        text: "Un bon prix couvre le coût de revient complet, une part des charges fixes, et laisse un bénéfice. Recalculez-le à chaque hausse de vos prix d'achat, pas une fois par an.",
      },
    ],
  },
  {
    slug: "avoir-note-de-credit-facture",
    title: "Avoir (note de crédit) : corriger ou annuler une facture correctement",
    description:
      "Erreur de prix, retour de marchandise, remise accordée après coup : pourquoi on ne supprime jamais une facture, et comment émettre un avoir sans fausser sa TVA.",
    category: "Facturation",
    publishedAt: "2026-10-16",
    updatedAt: "2026-10-16",
    readingMinutes: 5,
    body: [
      {
        type: "p",
        text: "Une facture envoyée contient une erreur, ou le client renvoie une partie de la marchandise. Le réflexe naturel est de modifier la facture ou de la supprimer pour en refaire une. C'est précisément ce qu'il ne faut pas faire. La bonne méthode s'appelle l'avoir, aussi appelé note de crédit.",
      },
      { type: "h2", text: "Pourquoi on ne supprime pas une facture" },
      {
        type: "p",
        text: "Une facture émise a peut-être déjà été enregistrée par votre client dans sa comptabilité, et elle a été prise en compte dans votre chiffre d'affaires et votre TVA collectée. La supprimer crée un trou dans votre numérotation, et la modifier fait coexister deux versions différentes d'un même document. Dans les deux cas, en cas de contrôle fiscal, c'est un signal d'alerte.",
      },
      { type: "h2", text: "Qu'est-ce qu'un avoir ?" },
      {
        type: "p",
        text: "L'avoir est un document qui annule tout ou partie d'une facture existante. Il fonctionne comme une facture « en négatif » : il réduit votre chiffre d'affaires, votre TVA collectée et la somme que le client vous doit.",
      },
      { type: "h2", text: "Les cas où l'on émet un avoir" },
      {
        type: "ul",
        items: [
          "erreur de prix, de quantité ou de taux de TVA sur la facture ;",
          "retour de marchandise défectueuse ou non conforme ;",
          "remise ou ristourne accordée après l'émission de la facture ;",
          "annulation d'une commande déjà facturée ;",
          "facture adressée au mauvais client.",
        ],
      },
      { type: "h2", text: "Ce que doit contenir un avoir" },
      {
        type: "ul",
        items: [
          "la mention « Avoir » ou « Note de crédit » bien visible ;",
          "un numéro propre, dans une séquence dédiée (par exemple AV-2026-0001) ;",
          "la référence de la facture d'origine (numéro et date) ;",
          "les lignes concernées, avec les montants HT, la TVA et le TTC ;",
          "le motif : erreur de prix, retour, remise, annulation.",
        ],
      },
      { type: "h2", text: "Exemple : retour partiel" },
      {
        type: "p",
        text: "Vous avez facturé 10 chaises à 25 000 FCFA HT, soit 250 000 FCFA HT et 298 125 FCFA TTC. Le client en renvoie 2, abîmées pendant le transport. Vous émettez un avoir pour 2 chaises :",
      },
      {
        type: "table",
        head: ["", "Facture FAC-2026-0210", "Avoir AV-2026-0015", "Reste dû"],
        rows: [
          ["Montant HT", "250 000", "-50 000", "200 000"],
          ["TVA 19,25 %", "48 125", "-9 625", "38 500"],
          ["Total TTC", "298 125", "-59 625", "238 500"],
        ],
      },
      { type: "h2", text: "Erreur totale : annuler puis refacturer" },
      {
        type: "p",
        text: "Si la facture est entièrement fausse (mauvais client, montants erronés partout), émettez un avoir qui reprend la totalité de la facture d'origine, puis une nouvelle facture correcte avec un nouveau numéro. Votre historique reste complet et lisible : facture, annulation, nouvelle facture.",
      },
      { type: "h2", text: "Rembourser ou déduire ?" },
      {
        type: "p",
        text: "Si le client n'a pas encore payé, l'avoir réduit simplement ce qu'il vous doit. S'il a déjà payé, vous pouvez soit le rembourser (virement, Mobile Money, espèces contre reçu), soit déduire l'avoir de sa prochaine facture. Notez le choix sur l'avoir pour éviter tout malentendu.",
      },
      {
        type: "callout",
        title: "Bon réflexe",
        text: "Envoyez l'avoir au client par le même canal que la facture d'origine et demandez une confirmation de réception. Son service comptable en a besoin pour corriger sa propre TVA déductible.",
      },
    ],
  },
  {
    slug: "bon-de-commande-fournisseur",
    title: "Bon de commande fournisseur : sécuriser ses achats",
    description:
      "À quoi sert un bon de commande, ce qu'il doit contenir et comment le rapprocher du bon de livraison et de la facture pour ne payer que ce qui a été reçu.",
    category: "Gestion",
    publishedAt: "2026-10-20",
    updatedAt: "2026-10-20",
    readingMinutes: 5,
    body: [
      {
        type: "p",
        text: "Une commande passée par téléphone ou par WhatsApp semble rapide et pratique. Jusqu'au jour où le fournisseur livre une autre quantité, applique un autre prix, ou facture des articles jamais reçus. Le bon de commande est le document qui fixe noir sur blanc ce que vous avez demandé, et qui vous protège dans ces situations.",
      },
      { type: "h2", text: "Le rôle du bon de commande" },
      {
        type: "ul",
        items: [
          "il formalise votre demande : articles, quantités, prix convenus, délai ;",
          "une fois accepté par le fournisseur, il l'engage sur ces conditions ;",
          "il permet de vérifier la livraison et la facture qui suivront ;",
          "il évite les achats non autorisés dans l'entreprise, car seule la personne habilitée émet des bons de commande.",
        ],
      },
      { type: "h2", text: "Les informations à faire figurer" },
      {
        type: "ul",
        items: [
          "un numéro unique (par exemple BC-2026-0034) et la date ;",
          "vos coordonnées et celles du fournisseur ;",
          "pour chaque article : désignation précise, référence, quantité, prix unitaire HT ;",
          "le total HT, la TVA et le total TTC ;",
          "le lieu et la date de livraison souhaités ;",
          "les conditions de paiement négociées (acompte, délai, moyen de paiement) ;",
          "le nom et la signature de la personne qui commande.",
        ],
      },
      { type: "h2", text: "Le rapprochement en trois documents" },
      {
        type: "p",
        text: "La règle de base des achats bien tenus est simple : on ne paie une facture fournisseur qu'après avoir vérifié qu'elle correspond à la commande et à ce qui a réellement été livré.",
      },
      {
        type: "table",
        head: ["Document", "Ce qu'il prouve", "À vérifier"],
        rows: [
          ["Bon de commande", "Ce que vous avez demandé", "Quantités et prix convenus"],
          ["Bon de livraison", "Ce que vous avez reçu", "Quantités réellement livrées, état"],
          ["Facture fournisseur", "Ce qu'on vous réclame", "Correspond aux deux précédents"],
        ],
      },
      {
        type: "p",
        text: "Exemple : vous commandez 50 sacs de riz à 18 000 FCFA HT. Le bon de livraison n'en mentionne que 46, et la facture en réclame 50 au prix de 18 500 FCFA. Grâce au bon de commande, vous contestez à la fois la quantité et le prix, documents à l'appui.",
      },
      { type: "h2", text: "À la réception de la marchandise" },
      {
        type: "ol",
        items: [
          "Comptez et contrôlez les articles en présence du livreur.",
          "Notez toute anomalie (manquant, casse, mauvais article) directement sur le bon de livraison avant de signer.",
          "Gardez un exemplaire signé du bon de livraison.",
          "Mettez à jour votre stock avec les quantités réellement reçues.",
        ],
      },
      {
        type: "callout",
        title: "Un bénéfice souvent oublié",
        text: "Les bons de commande en cours donnent une vision des dépenses à venir. Reportés dans votre plan de trésorerie, ils vous évitent de découvrir une grosse facture fournisseur au dernier moment.",
      },
    ],
  },
  {
    slug: "bien-tenir-sa-caisse",
    title: "Bien tenir sa caisse : la méthode pour ne plus perdre d'argent",
    description:
      "Fond de caisse, brouillard de caisse, contrôle quotidien, écarts : les règles simples pour gérer les espèces d'un commerce sans trous inexpliqués.",
    category: "Trésorerie",
    publishedAt: "2026-10-23",
    updatedAt: "2026-10-23",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "Malgré la montée du Mobile Money, les espèces restent très présentes dans le commerce au Cameroun. Et la caisse est l'endroit où l'argent disparaît le plus facilement : rendu de monnaie approximatif, petites dépenses non notées, prélèvements personnels, erreurs de comptage. Quelques règles simples suffisent pour reprendre le contrôle.",
      },
      { type: "h2", text: "1. Séparer la caisse de l'entreprise de votre portefeuille" },
      {
        type: "p",
        text: "C'est la règle la plus importante. Si vous vous servez dans la caisse pour vos dépenses personnelles, vous ne saurez jamais si l'activité gagne de l'argent. Fixez-vous plutôt une rémunération, retirée à date fixe et notée comme telle.",
      },
      { type: "h2", text: "2. Démarrer chaque journée avec un fond de caisse fixe" },
      {
        type: "p",
        text: "Le fond de caisse est la petite somme en billets et en pièces qui permet de rendre la monnaie dès le matin, par exemple 20 000 FCFA. Il est identique chaque jour. Le soir, on le remet de côté pour le lendemain, et tout ce qui dépasse correspond à la recette du jour.",
      },
      { type: "h2", text: "3. Noter chaque mouvement dans un brouillard de caisse" },
      {
        type: "p",
        text: "Le brouillard de caisse est un registre, papier ou numérique, où l'on note chaque entrée et chaque sortie d'espèces au moment où elle a lieu : date, motif, montant, et numéro de la pièce justificative.",
      },
      {
        type: "table",
        head: ["Heure", "Motif", "Entrée", "Sortie", "Solde"],
        rows: [
          ["08:00", "Fond de caisse", "20 000", "", "20 000"],
          ["10:15", "Vente ticket n° 118", "35 000", "", "55 000"],
          ["12:40", "Achat sacs d'emballage (reçu)", "", "4 500", "50 500"],
          ["16:30", "Vente ticket n° 119", "12 000", "", "62 500"],
          ["18:00", "Dépôt à la banque", "", "40 000", "22 500"],
        ],
      },
      { type: "h2", text: "4. Pas de sortie sans justificatif" },
      {
        type: "p",
        text: "Chaque dépense payée en espèces doit avoir son reçu ou sa facture. Quand le vendeur ne peut pas en fournir, rédigez une pièce de caisse : date, montant, objet, nom du bénéficiaire et sa signature. Ces pièces sont indispensables pour votre comptabilité et pour justifier vos charges.",
      },
      { type: "h2", text: "5. Compter la caisse chaque soir" },
      {
        type: "ol",
        items: [
          "Comptez les billets et les pièces, par valeur.",
          "Comparez avec le solde théorique du brouillard de caisse.",
          "Notez l'écart éventuel, même s'il est faible, avec une explication.",
          "Faites signer le comptage par la personne qui a tenu la caisse.",
        ],
      },
      {
        type: "p",
        text: "Un petit écart ponctuel arrive à tout le monde. Des écarts répétés, toujours dans le même sens, doivent vous alerter : erreurs de rendu de monnaie, ventes non enregistrées, ou détournement.",
      },
      { type: "h2", text: "6. Limiter le montant gardé en caisse" },
      {
        type: "p",
        text: "Plus il y a d'espèces dans la boutique, plus le risque de vol et de perte est grand. Déposez régulièrement la recette à la banque, ou transférez-la vers le compte de l'entreprise, et conservez les bordereaux de dépôt. En comptabilité, ce dépôt est un simple transfert entre deux comptes de trésorerie : ni une recette, ni une dépense.",
      },
      {
        type: "callout",
        title: "À retenir",
        text: "Fond de caisse fixe, tout noter, pas de sortie sans pièce, comptage chaque soir. Cette routine prend dix minutes par jour et met fin aux « trous » inexpliqués.",
      },
    ],
  },
  {
    slug: "creer-son-entreprise-cameroun-etapes",
    title: "Créer son entreprise au Cameroun : les étapes clés",
    description:
      "Choisir sa forme juridique, passer par le CFCE, obtenir RCCM et NIU, s'affilier à la CNPS, ouvrir un compte : le parcours de création expliqué simplement.",
    category: "Gestion",
    publishedAt: "2026-10-27",
    updatedAt: "2026-10-27",
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: "Travailler de manière informelle limite vite une activité : pas de factures valables pour les entreprises clientes, pas d'accès aux marchés publics, pas de compte bancaire professionnel, pas de crédit. Formaliser son entreprise ouvre ces portes. Voici les grandes étapes, dans l'ordre où elles se présentent.",
      },
      { type: "h2", text: "1. Choisir sa forme juridique" },
      {
        type: "p",
        text: "Le droit des sociétés au Cameroun est celui de l'OHADA (Acte uniforme relatif au droit des sociétés commerciales et du GIE). Les formes les plus courantes pour une PME sont :",
      },
      {
        type: "table",
        head: ["Forme", "Pour qui", "Point clé"],
        rows: [
          ["Entreprise individuelle (Établissement)", "Un entrepreneur seul qui démarre", "Simple, mais pas de séparation entre vos biens et ceux de l'entreprise"],
          ["Entreprenant", "Très petite activité", "Statut OHADA allégé, sous plafonds de chiffre d'affaires"],
          ["SARL", "Un ou plusieurs associés", "Responsabilité limitée aux apports, forme la plus répandue"],
          ["SAS", "Projets avec investisseurs", "Grande liberté pour organiser la gouvernance"],
          ["SA", "Projets importants", "Formalisme plus lourd"],
        ],
      },
      {
        type: "p",
        text: "Le choix dépend du nombre d'associés, du besoin de protéger votre patrimoine personnel et de vos ambitions. Pour une société, les statuts sont rédigés par un notaire ou sous seing privé selon les cas ; un conseil juridique vaut l'investissement.",
      },
      { type: "h2", text: "2. Passer par le CFCE" },
      {
        type: "p",
        text: "Les Centres de Formalités de Création d'Entreprises (CFCE), présents dans les principales villes, regroupent en un même lieu les administrations concernées. C'est le guichet unique : vous y déposez votre dossier et en ressortez avec les documents essentiels, dans des délais nettement plus courts qu'en faisant le tour des administrations. Renseignez-vous directement auprès du CFCE de votre ville sur la liste des pièces à fournir et les frais en vigueur, qui évoluent.",
      },
      { type: "h2", text: "3. Les numéros indispensables" },
      {
        type: "ul",
        items: [
          "le RCCM (Registre du Commerce et du Crédit Mobilier) : il prouve l'existence légale de l'entreprise ;",
          "le NIU (Numéro d'Identifiant Unique) : votre identifiant fiscal, à faire figurer sur toutes vos factures ;",
          "l'immatriculation à la CNPS dès que vous employez du personnel, pour déclarer les salariés et payer les cotisations sociales.",
        ],
      },
      { type: "h2", text: "4. Connaître son régime fiscal" },
      {
        type: "p",
        text: "Le régime d'imposition dépend principalement du chiffre d'affaires annuel : impôt libératoire pour les plus petites activités, régime simplifié, puis régime réel pour les entreprises plus importantes. Il détermine notamment si vous devez facturer et déclarer la TVA. Votre attestation d'immatriculation et votre centre des impôts de rattachement vous indiquent votre régime ; vérifiez-le chaque année, car les seuils sont fixés par la loi de finances.",
      },
      { type: "h2", text: "5. Ouvrir un compte bancaire et des moyens d'encaissement" },
      {
        type: "p",
        text: "Avec vos statuts, votre RCCM et votre NIU, ouvrez un compte bancaire au nom de l'entreprise, et un compte marchand Mobile Money si vos clients paient par MTN MoMo ou Orange Money. Séparer dès le premier jour l'argent de l'entreprise de votre argent personnel vous fera gagner un temps considérable en comptabilité.",
      },
      { type: "h2", text: "6. Mettre en place une gestion propre dès le départ" },
      {
        type: "ol",
        items: [
          "Créez un modèle de facture avec toutes les mentions obligatoires.",
          "Choisissez un expert-comptable ou un centre de gestion agréé.",
          "Classez chaque facture d'achat et chaque justificatif de dépense, mois par mois.",
          "Suivez votre trésorerie chaque semaine.",
        ],
      },
      {
        type: "callout",
        title: "Important",
        text: "Les procédures, pièces exigées et frais de création évoluent régulièrement. Ce guide présente le parcours général : confirmez toujours les détails à jour auprès du CFCE, d'un notaire ou d'un conseiller juridique avant de vous lancer.",
      },
    ],
  },
];

// Guides dated in the future stay hidden until their publication day (pages revalidate hourly)
export function getPublishedGuides(now = new Date()) {
  return guides.filter((g) => new Date(g.publishedAt) <= now);
}

export function getGuide(slug: string) {
  return getPublishedGuides().find((g) => g.slug === slug);
}

export function formatGuideDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
