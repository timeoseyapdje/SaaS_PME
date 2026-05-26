# Cahier des Charges — Nkap Control

**Version** : 2.1
**Date** : 25 mai 2026
**Auteur** : Timéo Dave Seyapdje
**Statut** : En production

---

## 1. Présentation du Projet

### 1.1 Contexte

Les PME camerounaises manquent d'outils numériques adaptés à leur réalité : facturation conforme OHADA, paiement Mobile Money, gestion des stocks et de la trésorerie dans un seul outil abordable. Les solutions étrangères (QuickBooks, Sage) sont trop chères et non adaptées à la fiscalité locale.

### 1.2 Solution

**Nkap Control** est une application SaaS de gestion financière et commerciale tout-en-un, conçue pour les PME d'Afrique francophone. Elle couvre la facturation, les devis, la comptabilité simplifiée, le catalogue produits, les commandes, les liens de paiement Mobile Money et les rapports fiscaux conformes OHADA.

### 1.3 Cible

- PME camerounaises et africaines (1 à 50 employés)
- Commerçants, prestataires de services, PME industrielles
- Experts-comptables gérant plusieurs clients PME

---

## 2. Objectifs

| Priorité | Objectif |
|----------|---------|
| P0 | Réduire le temps de facturation de 80% (de 30 min à 5 min) |
| P0 | Conformité fiscale OHADA automatique (TVA 19,25%, IS 33%) |
| P0 | Intégration native Mobile Money (MTN MoMo, Orange Money) |
| P1 | Tableau de bord financier en temps réel |
| P1 | Gestion du catalogue produits et des stocks |
| P1 | Création et suivi des commandes clients |
| P1 | Devis et propositions commerciales |
| P1 | Liens de paiement partageables |
| P2 | Assistant IA d'analyse financière (Nkap AI) |
| P2 | Rapports exportables (PDF, Excel) |
| P2 | Multi-utilisateurs avec gestion des rôles |

---

## 3. Fonctionnalités

### 3.1 Authentification & Entreprise

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Inscription | Email + mot de passe, création d'entreprise | ✅ Livré |
| Connexion | NextAuth.js v5, JWT, sessions sécurisées | ✅ Livré |
| Profil entreprise | Nom, logo, RCCM, NIU, adresse, TVA | ✅ Livré |
| Gestion des membres | Invitation, rôles (Admin / Comptable / Lecteur) | ✅ Livré |
| Postes personnalisés | Permissions granulaires par module | ✅ Livré |
| Transfert de propriété | Changement de propriétaire d'entreprise | ✅ Livré |
| Vérification email | Code de vérification à la création de compte | ✅ Livré |
| Réinitialisation MDP | Email de réinitialisation sécurisé | ✅ Livré |

### 3.2 Tableau de Bord

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| KPIs financiers | CA, dépenses, résultat net, factures impayées | ✅ Livré |
| Graphique revenus/dépenses | Bar chart 6 derniers mois | ✅ Livré |
| Factures récentes | Tableau cliquable avec statuts colorés | ✅ Livré |
| Alertes stock faible | Produits sous le seuil d'alerte | ✅ Livré |
| Nkap AI intégré | Chat IA accessible depuis le tableau de bord | ✅ Livré |

### 3.3 Facturation

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Création de facture | Lignes produits/services, TVA auto | ✅ Livré |
| Numérotation automatique | Format `FAC-YYYY-NNNN` | ✅ Livré |
| Statuts | Brouillon, Envoyée, Payée, En retard, Annulée | ✅ Livré |
| Export PDF | Génération PDF avec logo entreprise | ✅ Livré |
| Export Excel/CSV | Export tableau factures | ✅ Livré |
| Envoi email | Email HTML au client via Resend | ✅ Livré |
| Partage WhatsApp | Message pré-rempli avec montant et échéance | ✅ Livré |
| Duplication | Créer un brouillon copie en 1 clic | ✅ Livré |
| Rappels de retard | Détection auto + bouton rappel avec horodatage | ✅ Livré |
| Vérification retards | `POST /api/invoices/mark-overdue` — met à jour les statuts | ✅ Livré |
| Catalogue dans le formulaire | Sélection produit → remplissage auto de la ligne | ✅ Livré |
| Facture depuis commande | Conversion commande → facture en 1 clic | ✅ Livré |
| Imprimer | Impression navigateur | ✅ Livré |

### 3.4 Devis

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Création de devis | Lignes produits/services, TVA, date de validité | ✅ Livré |
| Numérotation automatique | Format `DEV-YYYY-NNNN` | ✅ Livré |
| Flux de statuts | DRAFT → SENT → ACCEPTED/REJECTED → CONVERTED | ✅ Livré |
| Export PDF | Rendu PDF identique aux factures | ✅ Livré |
| Envoi email | Email HTML au client via Resend | ✅ Livré |
| Partage WhatsApp | Message pré-rempli avec montant et validité | ✅ Livré |
| Conversion en facture | Crée une facture FAC-YYYY-XXXX en 1 clic | ✅ Livré |
| Catalogue dans le formulaire | Sélection produit → remplissage auto de la ligne | ✅ Livré |
| Lien vers facture convertie | Badge et lien vers la facture générée | ✅ Livré |

### 3.5 Dépenses & Revenus

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Saisie dépenses | Catégorie, montant, date, fournisseur | ✅ Livré |
| Catégories | Loyer, Salaires, Fournitures, Marketing, etc. | ✅ Livré |
| Revenus hors facture | Enregistrement revenus divers | ✅ Livré |
| Export Excel/CSV | Export des dépenses et revenus | ✅ Livré |

### 3.6 Trésorerie

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Multi-comptes | Banque, Caisse, MTN Money, Orange Money | ✅ Livré |
| Transactions | Entrées / Sorties avec catégories | ✅ Livré |
| Soldes temps réel | Mise à jour instantanée | ✅ Livré |
| Historique reversements | Suivi des payouts NotchPay | ✅ Livré |

### 3.7 Catalogue Produits & Inventaire

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Produits | Nom, SKU, prix, coût, description, images, unité | ✅ Livré |
| Catégories | Arborescence (parent/enfant) | ✅ Livré |
| Suivi stock | Stock initial, entrées/sorties automatiques | ✅ Livré |
| Seuil d'alerte | Badge rouge/orange/vert selon stock | ✅ Livré |
| Mouvements stock | Historique IN/OUT/ADJUSTMENT/RETURN | ✅ Livré |
| Ajustement manuel | Correction de stock avec raison | ✅ Livré |

### 3.8 Commandes

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Création commande | Sélection client + produits, calcul TVA auto | ✅ Livré |
| Statuts | Pending → Confirmed → Processing → Shipped → Delivered | ✅ Livré |
| Déduction stock | Automatique lors du passage à Confirmed | ✅ Livré |
| Restauration stock | Automatique lors d'Annulation / Retour | ✅ Livré |
| Conversion en facture | 1 clic depuis la page de commande | ✅ Livré |
| Timeline statut | Visualisation de l'historique des transitions | ✅ Livré |

### 3.9 Liens de Paiement Mobile Money

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Création lien | Titre, montant, devise, date expiration, max utilisations | ✅ Livré |
| Page publique | `/pay/[slug]` sans authentification | ✅ Livré |
| Charge directe | La demande est envoyée sur le téléphone du client (pas de redirect) | ✅ Livré |
| Commission | Client paie montant + 2,5% — entreprise reçoit montant exact | ✅ Livré |
| Reversement auto | Transfert vers compte MTN/Orange principal après paiement | ✅ Livré |
| Webhooks sécurisés | Signature HMAC-SHA256 via `x-notch-signature` | ✅ Livré |
| Suivi transactions | Historique des paiements par lien | ✅ Livré |
| Statuts lien | Active, Expired, Disabled | ✅ Livré |

### 3.10 Clients & Fournisseurs

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Fiche contact | Nom, email, téléphone, adresse, NIU, type | ✅ Livré |
| Historique | Factures, commandes, paiements par contact | ✅ Livré |
| Actions rapides | Nouvelle facture, devis, commande, lien paiement | ✅ Livré |
| Statistiques | Total facturé, balance, factures en attente | ✅ Livré |

### 3.11 Rapports

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Compte de résultat | Revenus - Dépenses = Résultat net | ✅ Livré |
| Bilan simplifié | Actif / Passif | ✅ Livré |
| Déclaration TVA | Montants collectés / déductibles | ✅ Livré |
| Calcul IS | Impôt sur les sociétés (33%) | ✅ Livré |
| Export PDF/Excel | Tous les rapports exportables | ✅ Livré |

### 3.12 Nkap AI

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Assistant financier | Chat IA basé sur l'API Anthropic | ✅ Livré |
| Analyse contextualisée | Accès aux données financières en temps réel | ✅ Livré |
| Suggestions | Questions suggérées pour guider l'utilisateur | ✅ Livré |
| Quotas | Starter: 0 msg, Pro: 10/jour, Max: illimité | ✅ Livré |

### 3.13 Abonnements

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| 3 plans | Starter (gratuit), Pro (3 000 XAF/mois), Max (10 000 XAF/mois) | ✅ Livré |
| Paiement Mobile Money | MTN Money / Orange Money via NotchPay | ✅ Livré |
| Paiement Stripe | Carte bancaire | ✅ Livré |
| Codes promo | Réduction en % ou montant fixe | ✅ Livré |
| Gestion | Upgrade/downgrade/résiliation | ✅ Livré |

### 3.14 Expérience Utilisateur

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Dark / Light / Système | next-themes | ✅ Livré |
| Toast notifications | Toutes les actions avec retour visuel | ✅ Livré |
| Confirmations inline | Suppression avec boutons Oui/Annuler (pas de dialog natif) | ✅ Livré |
| Page d'aide in-app | FAQ par section + liens démarrage rapide à `/help` | ✅ Livré |
| Pages d'erreur | `error.tsx` + `not-found.tsx` globaux | ✅ Livré |
| Responsive | Mobile (360px), Tablette, Desktop | ✅ Livré |
| Sidebar mobile | Hamburger menu avec overlay | ✅ Livré |

### 3.15 Administration Plateforme (Super Admin)

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Gestion utilisateurs | Liste, modification, suppression | ✅ Livré |
| Gestion entreprises | Vue d'ensemble, révocation abonnements | ✅ Livré |
| Codes promo | Création et gestion des codes de réduction | ✅ Livré |
| Notifications | Envoi de notifications ciblées | ✅ Livré |
| Sync positions | Synchronisation des postes par défaut | ✅ Livré |

---

## 4. Architecture Technique

### 4.1 Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) |
| Base de données | PostgreSQL (Neon Serverless) + Prisma ORM v5 |
| Authentification | NextAuth.js v5 (JWT, credentials) |
| UI | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Animations | Framer Motion |
| Graphiques | Recharts 2 |
| IA | Anthropic SDK (`@anthropic-ai/sdk`) |
| Paiements | NotchPay (MTN Money, Orange Money) |
| Abonnements | Stripe |
| Emails | Resend |
| PDF/Excel | jsPDF + ExcelJS |
| Typage | TypeScript 5 (strict) |

### 4.2 Services Externes

| Service | Usage |
|---------|-------|
| **Vercel** | Hébergement Next.js (Edge Network, auto-déploiement) |
| **Neon** | PostgreSQL serverless (prod) |
| **Stripe** | Paiements par carte et gestion des abonnements |
| **NotchPay** | Paiements Mobile Money (MTN, Orange) |
| **Anthropic API** | Intelligence artificielle (Nkap AI) |
| **Resend** | Emails transactionnels |

### 4.3 Modèle de Données

```
Company
  ├── Users + Positions (permissions par module)
  ├── AdmissionRequests (demandes d'accès à une entreprise)
  ├── Clients
  │   ├── Invoices → InvoiceItems
  │   ├── Quotes   → QuoteItems
  │   ├── Orders   → OrderItems
  │   └── PaymentLinks → PaymentLinkTransactions
  ├── Suppliers
  ├── Expenses + Revenues
  ├── BankAccounts + Payouts
  ├── TaxDeclarations
  ├── Categories → Products → StockMovements
  ├── Subscription + PromoCodes
  └── Notifications
```

### 4.4 Sécurité

- Authentification JWT (expiration 30 jours)
- Mots de passe bcrypt (12 rounds)
- Isolation stricte des données par `companyId` sur chaque requête API
- HTTPS obligatoire (Vercel)
- Webhooks NotchPay signés HMAC-SHA256
- Variables sensibles en variables d'environnement uniquement

---

## 5. Conformité Fiscale Camerounaise

| Taxe | Taux | Périodicité | Référence légale |
|------|------|-------------|-----------------|
| TVA | 19,25% | Mensuelle (15 du mois suivant) | CGI art. 125 |
| IS | 33% | Annuelle (31 mars) | CGI art. 22 |
| Retenue à la source | 5,5% | Sur chaque paiement | CGI art. 57 |
| TSR | 3% | Sur revenus | CGI |

---

## 6. Plans & Monétisation

| Plan | Prix mensuel | Cible | Limites clés |
|------|-------------|-------|--------------|
| **Starter** | Gratuit | Test / Très petites PME | 1 user, 20 factures/mois |
| **Pro** | 3 000 XAF | PME en croissance | 5 users, tout illimité, AI 10 msg/j |
| **Max** | 10 000 XAF | PME ambitieuses | Illimité, AI illimité, API, support 24/7 |

---

## 7. Roadmap

### Version 2.0 (mars–avril 2026) ✅ Livré
- Catalogue produits & gestion des stocks
- Commandes avec workflow de statuts
- Liens de paiement Mobile Money
- Charge directe NotchPay (sans page intermédiaire)
- Dark/Light mode + design système unifié
- Gestion d'équipe avec permissions granulaires

### Version 2.1 (mai 2026) ✅ Livré
- **Devis (Quotes)** — création, envoi, acceptation, conversion en facture
- **Envoi email** — factures et devis par email avec templates HTML
- **Partage WhatsApp** — bouton sur factures et devis
- **Duplication de facture** — brouillon copie en 1 clic
- **Catalogue dans les formulaires** — sélecteur de produits par ligne
- **Rappels de retard** — détection auto + bouton rappel horodaté
- **Page d'aide in-app** — FAQ complète à `/help`
- **UX** — toasts partout, confirmations inline, pages d'erreur

### Version 2.2 (Q3 2026) 🔄 Planifié
- Factures récurrentes (mensuelle/trimestrielle/annuelle)
- Acomptes & paiements partiels sur facture
- Import CSV en masse (clients, produits)
- Signature électronique des devis (lien client)
- Notifications push (factures en retard, stock faible)

### Version 3.0 (Q1 2027) 📋 Prévu
- Application mobile (React Native / Expo)
- Module RH simplifié (fiches de paie, CNPS)
- Intégration bancaire directe (rapprochement automatique)
- API publique pour intégrations tierces
- Multi-devises avancé avec taux temps réel

---

## 8. Équipe & Contacts

| Rôle | Contact |
|------|---------|
| Développeur Principal | Timéo Dave Seyapdje — seyapdjetimeo@gmail.com |
| Support Technique | contact@nkapcontrol.cm |

---

*Cahier des charges — Nkap Control v2.1 — © 2026 Timéo Dave Seyapdje. Document confidentiel.*
