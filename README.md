# Nkap Control — Gestion Financière & Commerciale pour PME

Solution SaaS tout-en-un de gestion financière et commerciale, conçue spécifiquement pour les PME camerounaises et africaines. Conforme au droit OHADA et au Code Général des Impôts du Cameroun. Disponible en PWA (installable sur Android, iOS et desktop).

---

## Fonctionnalités

### Finance & Comptabilité
- **Tableau de bord** — KPIs en temps réel (CA, dépenses, résultat net, factures impayées), graphiques revenus/dépenses 6 mois, alertes stock faible
- **Facturation** — Création, envoi et suivi des factures avec TVA camerounaise (19,25%), numérotation automatique, export PDF/Excel
- **Dépenses & Recettes** — Enregistrement et catégorisation des flux financiers
- **Trésorerie** — Gestion multi-comptes (Compte courant, Caisse, MTN Money, Orange Money) avec historique des reversements
- **Rapports fiscaux** — Compte de résultat, bilan simplifié, synthèse TVA et IS conformes OHADA

### Commerce & Ventes
- **Catalogue produits** — Gestion des produits et services, catégories, images, prix/coût, suivi des stocks avec seuils d'alerte
- **Commandes** — Création de commandes, suivi de statut (Pending → Confirmed → Shipped → Delivered), déduction automatique des stocks, conversion en facture
- **Liens de paiement** — Génération de liens partageables (MTN Money / Orange Money), page publique sans authentification, historique des transactions par lien
- **Clients & Fournisseurs** — Gestion des contacts avec historique complet des factures et transactions

### Système de paiement (NotchPay)
- **Commission automatique** — Le client paie montant + 2,5% de frais de traitement, l'entreprise reçoit exactement le montant demandé
- **Reversements automatiques** — Dès qu'un paiement est confirmé, l'argent est transféré automatiquement vers le compte MTN/Orange par défaut de l'entreprise
- **Webhooks sécurisés** — Vérification des signatures HMAC-SHA256 via `x-notch-signature`
- **Historique des payouts** — Suivi du statut de chaque reversement (Initié → En cours → Effectué)

### Plateforme
- **Nkap AI** — Assistant IA basé sur l'API Anthropic pour l'analyse financière
- **PWA** — Application installable sur Android, iOS et desktop (mode hors-ligne partiel)
- **Dark / Light mode** — Thème sombre, clair ou automatique
- **Multi-devises** — FCFA (XAF), Euro, Dollar US
- **Gestion des abonnements** — Plans Starter (gratuit), Pro (3 000 FCFA/mois), Max (10 000 FCFA/mois)

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| Base de données | PostgreSQL (Neon) + Prisma ORM |
| Authentification | NextAuth.js v5 (JWT, credentials) |
| UI | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Thème | next-themes (dark/light/system) |
| Animations | Framer Motion |
| Graphiques | Recharts 2 |
| Validation | Zod + React Hook Form |
| IA | Anthropic SDK (@anthropic-ai/sdk) |
| Paiements en ligne | NotchPay (MTN Money, Orange Money) |
| Abonnements | Stripe |
| Emails | Resend |
| PDF/Excel | jsPDF + html2canvas + ExcelJS |
| Typage | TypeScript 5 (strict mode) |
| PWA | Service Worker natif + Next.js manifest |

---

## Installation

### Prérequis
- Node.js 20+
- PostgreSQL 14+ (ou compte Neon)
- Compte NotchPay (pour les paiements Mobile Money)
- Clé API Anthropic (pour Nkap AI)
- Compte Resend (pour les emails)

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/timeoseyapdje/SaaS_PME.git
cd SaaS_PME

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
```

Renseigner `.env` :

```env
# Base de données (Neon recommandé)
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@direct-host/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-clé-secrète-32-caractères"

# App
NEXT_PUBLIC_APP_NAME="Nkap Control"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-..."

# NotchPay (paiements Mobile Money)
NOTCHPAY_PUBLIC_KEY="pk_..."
NOTCHPAY_PRIVATE_KEY="sk_..."

# Resend (emails)
RESEND_API_KEY="re_..."
FROM_EMAIL="Nkap Control <noreply@nkapcontrol.com>"

# Stripe (abonnements SaaS — optionnel)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

```bash
# 4. Initialiser la base de données
npx prisma generate
npx prisma db push

# 5. Données de démonstration (optionnel)
npm run db:seed

# 6. Démarrer
npm run dev
```

Accès : [http://localhost:3000](http://localhost:3000)

### Compte de démonstration (après seeding)

| Champ | Valeur |
|-------|--------|
| Email | demo@nkapcontrol.cm |
| Mot de passe | demo123456 |

---

## Configuration NotchPay (Webhooks)

### Webhook 1 — Abonnements
- **URL** : `https://votre-domaine.com/api/payments/webhook`
- **Context** : Your account
- **Événements** : Invoices → `payment.complete` + `payment.failed`

### Webhook 2 — Liens de paiement
- **URL** : `https://votre-domaine.com/api/webhooks/payment-links`
- **Context** : Quick events
- **Événements** : Payment links → `payment.complete` + `payment.failed`

### Configuration compte de reversement
Dans l'app → **Trésorerie** → créer un compte **MTN Money** ou **Orange Money** → saisir le numéro de téléphone → cocher **Compte principal**.

---

## Structure du Projet

```
src/
├── app/
│   ├── (auth)/                    # Login, Register, Forgot password
│   ├── (dashboard)/               # Pages protégées
│   │   ├── dashboard/             # Tableau de bord KPIs
│   │   ├── invoices/              # Factures (liste, création, détail)
│   │   ├── expenses/              # Dépenses & Recettes
│   │   ├── treasury/              # Trésorerie + historique reversements
│   │   ├── clients/               # Clients
│   │   ├── suppliers/             # Fournisseurs
│   │   ├── products/              # Catalogue, catégories, inventaire
│   │   ├── orders/                # Commandes
│   │   ├── payment-links/         # Liens de paiement + transactions par lien
│   │   ├── reports/               # Rapports fiscaux OHADA
│   │   ├── settings/              # Paramètres entreprise & compte
│   │   ├── subscription/          # Abonnement & facturation
│   │   └── admin/                 # Administration plateforme
│   ├── api/                       # Routes API REST
│   │   ├── pay/[slug]/            # Endpoint public lien de paiement
│   │   ├── webhooks/payment-links/# Webhook NotchPay liens de paiement
│   │   ├── payments/webhook/      # Webhook NotchPay abonnements
│   │   ├── payouts/               # Historique reversements
│   │   └── ...
│   ├── manifest.ts                # Web App Manifest (PWA)
│   ├── onboarding/                # Guide de démarrage
│   ├── pay/[slug]/                # Page publique de paiement
│   └── help/                      # Centre d'aide
├── components/
│   ├── ui/                        # Composants shadcn/ui
│   ├── layout/                    # Sidebar, Header
│   └── PWARegister.tsx            # Enregistrement Service Worker
├── lib/
│   ├── notchpay.ts                # Intégration NotchPay (paiements + transferts)
│   ├── auth.ts                    # Configuration NextAuth
│   ├── currency.ts                # Formatage devises
│   └── tax.ts                     # Calculs fiscaux OHADA
└── types/                         # Types TypeScript
prisma/
├── schema.prisma                  # Schéma BDD (inclut modèle Payout)
└── seed.ts                        # Données de démonstration
public/
└── sw.js                          # Service Worker PWA
```

---

## Fiscalité Camerounaise Intégrée

| Taxe | Taux | Périodicité |
|------|------|-------------|
| TVA | 19,25% | Mensuelle (15 du mois suivant) |
| IS | 33% | Annuelle (31 mars) |
| Retenue à la source | 5,5% | Sur chaque paiement |
| TSR | 3% | Sur revenus |

---

## Plans & Tarifs

| Plan | Prix | Limites |
|------|------|---------|
| Starter | Gratuit | 1 utilisateur, 20 factures/mois |
| Pro | 3 000 FCFA/mois | 5 utilisateurs, tout illimité, Nkap AI (10 msg/j) |
| Max | 10 000 FCFA/mois | Illimité, Nkap AI illimité, API, support 24/7 |

---

## Commandes Utiles

```bash
npm run dev          # Démarrage développement (localhost:3000)
npm run build        # Build production (push BDD + generate + next build)
npm run db:push      # Synchroniser le schéma Prisma → BDD
npm run db:seed      # Peupler avec des données de démo
npm run db:studio    # Ouvrir Prisma Studio (GUI BDD)
npm run db:generate  # Régénérer le client Prisma
npm run lint         # Linter ESLint
```

---

## Licence

Projet privé — © 2026 Nkap Control. Tous droits réservés.
