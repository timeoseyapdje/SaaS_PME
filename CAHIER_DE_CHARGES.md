# Cahier des Charges — Nkap Control

**Version** : 2.0  
**Date** : 7 mai 2026  
**Auteur** : Timéo Dave Seyapdje  
**Statut** : En production

---

## 1. Présentation du Projet

### 1.1 Contexte

Les PME camerounaises manquent d'outils numériques adaptés à leur réalité : facturation conforme OHADA, paiement Mobile Money, gestion des stocks et de la trésorerie dans un seul outil abordable. Les solutions étrangères (QuickBooks, Sage) sont trop chères et non adaptées à la fiscalité locale.

### 1.2 Solution

**Nkap Control** est une application SaaS de gestion financière et commerciale tout-en-un, conçue pour les PME d'Afrique francophone. Elle couvre la facturation, la comptabilité simplifiée, le catalogue produits, les commandes, les liens de paiement Mobile Money et les rapports fiscaux conformes OHADA.

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
| Compte démo | Lecture seule, données fictives | ✅ Livré |

### 3.2 Tableau de Bord

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| KPIs financiers | CA, dépenses, résultat net, factures impayées | ✅ Livré |
| Graphique revenus/dépenses | Bar chart 6 derniers mois, adaptatif dark/light | ✅ Livré |
| Factures récentes | Tableau cliquable avec statuts colorés | ✅ Livré |
| Alertes stock faible | Produits sous le seuil d'alerte | ✅ Livré |
| Compteur produits actifs | KPI catalogue | ✅ Livré |

### 3.3 Facturation

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Création de facture | Lignes produits/services, TVA auto, remises | ✅ Livré |
| Numérotation automatique | Format FAC-YYYY-NNNNN | ✅ Livré |
| Statuts | Brouillon, Envoyée, Payée, En retard, Annulée | ✅ Livré |
| Export PDF | Génération PDF avec logo entreprise | ✅ Livré |
| Export Excel | Export tableau factures | ✅ Livré |
| Facture depuis commande | Conversion commande → facture en 1 clic | ✅ Livré |

### 3.4 Dépenses & Revenus

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Saisie dépenses | Catégorie, montant, date, pièce jointe | ✅ Livré |
| Catégories | Loyer, Salaires, Fournitures, Marketing, etc. | ✅ Livré |
| Revenus hors facture | Enregistrement revenus divers | ✅ Livré |

### 3.5 Trésorerie

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Multi-comptes | Banque, Caisse, MTN Money, Orange Money | ✅ Livré |
| Transactions | Entrées / Sorties avec catégories | ✅ Livré |
| Soldes temps réel | Mise à jour instantanée | ✅ Livré |
| Historique | Filtrage par date, compte, type | ✅ Livré |

### 3.6 Catalogue Produits & Inventaire

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Produits | Nom, SKU, prix, coût, description, images, unité | ✅ Livré |
| Catégories | Arborescence (parent/enfant) | ✅ Livré |
| Suivi stock | Stock initial, entrées/sorties automatiques | ✅ Livré |
| Seuil d'alerte | Badge rouge/orange/vert selon stock | ✅ Livré |
| Mouvements stock | Historique IN/OUT/ADJUSTMENT/RETURN | ✅ Livré |
| Ajustement manuel | Correction de stock avec raison | ✅ Livré |

### 3.7 Commandes

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Création commande | Sélection client + produits, calcul TVA auto | ✅ Livré |
| Statuts | Pending → Confirmed → Processing → Shipped → Delivered | ✅ Livré |
| Déduction stock | Automatique lors du passage à Confirmed | ✅ Livré |
| Restauration stock | Automatique lors d'Annulation / Retour | ✅ Livré |
| Conversion en facture | 1 clic depuis la page de commande | ✅ Livré |
| Timeline statut | Visualisation de l'historique des transitions | ✅ Livré |
| Méthode de paiement | MTN MoMo, Orange Money, Espèces, Virement, Chèque | ✅ Livré |

### 3.8 Liens de Paiement

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Création lien | Titre, montant, devise, date expiration, max utilisations | ✅ Livré |
| Lien public | Page `/pay/[slug]` sans authentification | ✅ Livré |
| Mobile Money | Saisie numéro téléphone, sélection opérateur | ✅ Livré |
| Suivi transactions | Historique des paiements par lien | ✅ Livré |
| Statuts lien | Active, Expired, Disabled | ✅ Livré |
| Copie lien | Bouton copier avec feedback visuel | ✅ Livré |

### 3.9 Clients & Fournisseurs

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Fiche client/fournisseur | Nom, email, téléphone, adresse, NIU, RCCM | ✅ Livré |
| Type | Particulier ou Entreprise | ✅ Livré |
| Historique | Factures, commandes, paiements par contact | ✅ Livré |
| Actions rapides | Nouvelle facture, commande, lien de paiement | ✅ Livré |
| Statistiques | Total facturé, factures en attente | ✅ Livré |

### 3.10 Rapports

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Compte de résultat | Revenus - Dépenses = Résultat net | ✅ Livré |
| Bilan simplifié | Actif / Passif | ✅ Livré |
| Déclaration TVA | Montants collectés / déductibles | ✅ Livré |
| Calcul IS | Impôt sur les sociétés (33%) | ✅ Livré |
| Export PDF/Excel | Tous les rapports exportables | ✅ Livré |

### 3.11 Nkap AI

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Assistant financier | Chat IA basé sur l'API Anthropic | ✅ Livré |
| Analyse contextualisée | Accès aux données financières de l'entreprise | ✅ Livré |
| Quotas | Starter: 0 msg, Pro: 10/jour, Max: illimité | ✅ Livré |

### 3.12 Abonnements

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| 3 plans | Starter (gratuit), Pro (3 000 XAF/mois), Max (10 000 XAF/mois) | ✅ Livré |
| Paiement Stripe | Carte bancaire, local via Stripe | ✅ Livré |
| Gestion | Upgrade/downgrade/résiliation depuis les paramètres | ✅ Livré |
| Facturation mensuelle | Renouvellement automatique | ✅ Livré |

### 3.13 Paramètres

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Profil entreprise | Logo, coordonnées, fiscalité | ✅ Livré |
| Thème | Dark / Light / Système (next-themes) | ✅ Livré |
| Notifications | Email pour factures en retard, alertes stock | ✅ Livré |
| Sécurité | Changement mot de passe | ✅ Livré |

---

## 4. Architecture Technique

### 4.1 Infrastructure

```
┌─────────────────────────────────────────────┐
│                   Client                    │
│         Next.js App Router (SSR/CSR)        │
│         Tailwind CSS + shadcn/ui            │
│         Framer Motion + Recharts            │
└────────────────────┬────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────┐
│                 Serveur                     │
│        Next.js API Routes (Edge)            │
│    NextAuth.js v5 — JWT Sessions            │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│               Base de Données               │
│          PostgreSQL (Neon Serverless)       │
│              Prisma ORM v5                  │
└─────────────────────────────────────────────┘
```

### 4.2 Services Externes

| Service | Usage |
|---------|-------|
| **Vercel** | Hébergement Next.js (Edge Network) |
| **Neon** | PostgreSQL serverless (prod) |
| **Stripe** | Gestion des abonnements et paiements |
| **Anthropic API** | Intelligence artificielle (Nkap AI) |
| **Resend** | Envoi d'emails transactionnels |

### 4.3 Modèle de Données Principal

```
Company
  ├── Users (Admin / Comptable / Lecteur)
  ├── Clients
  ├── Suppliers
  ├── Invoices → InvoiceItems
  ├── Expenses
  ├── Transactions → TreasuryAccounts
  ├── Categories → Products → StockMovements
  ├── Orders → OrderItems
  ├── PaymentLinks → PaymentLinkTransactions
  └── Subscriptions
```

---

## 5. Contraintes

### 5.1 Techniques
- **Performance** : LCP < 2s, temps réponse API < 500ms
- **Compatibilité** : Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- **Responsive** : Mobile (360px), Tablette (768px), Desktop (1280px+)
- **Accessibilité** : Contrastes WCAG AA minimum

### 5.2 Sécurité
- Authentification JWT avec expiration 30 jours
- Mots de passe bcrypt (12 rounds minimum)
- Isolation des données par `companyId` sur chaque requête
- HTTPS obligatoire (certificat Let's Encrypt via Vercel)
- Variables sensibles en variables d'environnement uniquement

### 5.3 Conformité
- TVA camerounaise : 19,25% (Code Général des Impôts art. 125)
- IS : 33% (Code Général des Impôts art. 22)
- Retenue à la source : 5,5%
- Format OHADA pour les états financiers
- Numérotation des factures séquentielle et sans rupture

---

## 6. Plans & Monétisation

| Plan | Prix mensuel | Cible | Limites clés |
|------|-------------|-------|--------------|
| **Starter** | Gratuit | Test / Très petites PME | 1 user, 20 factures/mois |
| **Pro** | 3 000 XAF | PME en croissance | 5 users, tout illimité, AI 10 msg/j |
| **Max** | 10 000 XAF | PME ambitieuses | Illimité, AI illimité, API, support 24/7 |

**Modèle de revenus** : SaaS récurrent (facturation mensuelle via Stripe)

---

## 7. Roadmap

### Version 2.0 (actuelle — mai 2026) ✅
- Catalogue produits & gestion des stocks
- Commandes avec workflow de statuts
- Liens de paiement Mobile Money
- Dark/Light mode
- Design système unifié (tokens sémantiques)

### Version 2.1 (Q3 2026) 🔄 Planifié
- Application mobile (React Native / Expo)
- Notifications push (factures en retard, stock faible)
- Import en masse via Excel/CSV (produits, clients)
- Signature électronique des factures
- Factures récurrentes automatiques

### Version 3.0 (Q1 2027) 📋 Prévu
- Multi-devises avancé (ETH, USD, EUR avec taux temps réel)
- Module RH simplifié (fiches de paie, CNPS)
- Intégration bancaire directe (rapprochement automatique)
- API publique pour intégrations tierces
- Marketplace d'intégrations (WooCommerce, Shopify, etc.)

---

## 8. Équipe & Contacts

| Rôle | Contact |
|------|---------|
| Développeur Principal | Timéo Dave Seyapdje — seyapdjetimeo@gmail.com |
| Support Technique | contact@nkapcontrol.cm |

---

*Cahier des charges — Nkap Control v2.0 — © 2026 Timéo Dave Seyapdje. Document confidentiel.*
