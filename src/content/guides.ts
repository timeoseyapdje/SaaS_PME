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
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}

export function formatGuideDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
