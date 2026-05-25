# Nkap Control — Gestion Financière & Commerciale pour PME

Solution SaaS tout-en-un de gestion financière et commerciale, conçue spécifiquement pour les PME camerounaises et africaines. Conforme au droit OHADA et au Code Général des Impôts du Cameroun.

---

## Fonctionnalités

### Facturation & Devis
- **Factures** — Création, envoi et suivi avec TVA camerounaise (19,25%), numérotation automatique `FAC-YYYY-XXXX`, export PDF/Excel, envoi email, partage WhatsApp, duplication en 1 clic
- **Devis** — Création de propositions commerciales `DEV-YYYY-XXXX`, flux de statuts (Brouillon → Envoyé → Accepté/Refusé → Converti), conversion en facture en 1 clic, export PDF, envoi email et WhatsApp
- **Catalogue dans les formulaires** — Sélection de produits depuis le catalogue pour remplir automatiquement les lignes
- **Rappels de retard** — Détection automatique des factures échues, bouton rappel avec horodatage
- **Partage WhatsApp** — Message pré-rempli avec numéro, montant et échéance, lien direct vers la conversation du client

### Finance & Comptabilité
- **Tableau de bord** — KPIs en temps réel (CA, dépenses, résultat net, factures impayées), graphiques 6 mois
- **Dépenses & Recettes** — Enregistrement et catégorisation des flux financiers
- **Trésorerie** — Gestion multi-comptes (Compte courant, Caisse, MTN Money, Orange Money)
- **Rapports fiscaux** — Compte de résultat, bilan simplifié, synthèse TVA et IS conformes OHADA

### Commerce & Ventes
- **Catalogue produits** — Produits et services, catégories, images, prix/coût, stocks avec seuils d'alerte
- **Commandes** — Suivi de statut (Pending → Delivered), déduction automatique des stocks, conversion en facture
- **Liens de paiement** — Génération de liens partageables (MTN Money / Orange Money), page publique sans authentification

### Paiements Mobile Money (NotchPay)
- **Charge directe** — Le client reçoit une demande sur son téléphone et confirme avec son PIN (pas de page intermédiaire)
- **Commission automatique** — Le client paie montant + 2,5% de frais, l'entreprise reçoit exactement le montant demandé
- **Reversements automatiques** — Transfert automatique vers le compte MTN/Orange principal de l'entreprise
- **Webhooks sécurisés** — Vérification HMAC-SHA256 via `x-notch-signature`

### Plateforme
- **Nkap AI** — Assistant IA (API Anthropic) pour l'analyse financière en temps réel
- **Aide in-app** — FAQ complète par section + liens démarrage rapide accessible depuis la sidebar
- **Emails transactionnels** — Envoi de factures et devis par email (Resend) avec templates HTML
- **Dark / Light / System mode** — next-themes
- **Multi-devises** — FCFA (XAF), Euro, Dollar US
- **Gestion d'équipe** — Invitations, postes avec permissions granulaires par module
- **Abonnements** — Plans Starter (gratuit), Pro (3 000 FCFA/mois), Max (10 000 FCFA/mois)

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router, SSR/CSR) |
| Base de données | PostgreSQL (Neon) + Prisma ORM v5 |
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

---

## Installation

### Prérequis
- Node.js 20+
- PostgreSQL 14+ (ou compte [Neon](https://neon.tech))
- Compte NotchPay
- Clé API Anthropic
- Compte Resend

### Étapes

```bash
# 1. Cloner
git clone https://github.com/timeoseyapdje/SaaS_PME.git
cd SaaS_PME

# 2. Dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
```

Renseigner `.env` :

```env
# Base de données
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

# Stripe (abonnements — optionnel)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

```bash
# 4. Base de données
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma db push

# 5. Démarrer
npm run dev
```

> **Important** : Toujours utiliser `./node_modules/.bin/prisma` (pas `npx prisma`) pour éviter de télécharger Prisma v7 incompatible avec la v5 du projet.

---

## Configuration NotchPay (Webhooks)

### Webhook abonnements
- **URL** : `https://votre-domaine.com/api/payments/webhook`
- **Événements** : `payment.complete`, `payment.failed`

### Webhook liens de paiement
- **URL** : `https://votre-domaine.com/api/webhooks/payment-links`
- **Événements** : `payment.complete`, `payment.failed`

### Compte de reversement
Dans l'app → **Trésorerie** → créer un compte **MTN Money** ou **Orange Money** → saisir le numéro → cocher **Compte principal**.

---

## Structure du Projet

```
src/
├── app/
│   ├── (auth)/                    # Login, Register, Forgot/Reset password
│   ├── (dashboard)/               # Pages protégées
│   │   ├── dashboard/             # KPIs + graphiques + alertes
│   │   ├── invoices/              # Factures (liste, création, détail)
│   │   ├── devis/                 # Devis (liste, création, détail)
│   │   ├── expenses/              # Dépenses & Recettes
│   │   ├── treasury/              # Trésorerie + historique reversements
│   │   ├── clients/               # Clients
│   │   ├── suppliers/             # Fournisseurs
│   │   ├── products/              # Catalogue, catégories, inventaire
│   │   ├── orders/                # Commandes
│   │   ├── payment-links/         # Liens de paiement + transactions
│   │   ├── reports/               # Rapports fiscaux OHADA
│   │   ├── help/                  # Aide & documentation in-app
│   │   ├── settings/              # Paramètres entreprise & compte
│   │   ├── subscription/          # Abonnement & facturation
│   │   ├── team/                  # Membres, postes, demandes
│   │   └── admin/                 # Administration plateforme
│   ├── api/
│   │   ├── quotes/                # CRUD devis + conversion en facture
│   │   ├── invoices/              # CRUD factures + mark-overdue + duplicate
│   │   ├── email/                 # send-invoice + send-quote
│   │   ├── pay/[slug]/            # Page publique de paiement
│   │   ├── webhooks/              # Webhooks NotchPay
│   │   └── ...
│   └── pay/[slug]/                # Page publique de paiement Mobile Money
├── components/
│   ├── ui/                        # Composants shadcn/ui + product-picker-dialog
│   ├── invoices/                  # InvoiceForm, InvoiceTable, InvoiceStatusBadge
│   ├── quotes/                    # QuoteForm
│   └── layout/                   # Sidebar, Header
├── lib/
│   ├── notchpay.ts               # Intégration NotchPay (init + charge directe + transferts)
│   ├── email.ts                  # Templates email (factures, devis, abonnements...)
│   ├── export.ts                 # exportInvoicePDF + exportQuotePDF + Excel/CSV
│   ├── permissions.ts            # Modules, actions, templates de rôles
│   ├── auth-permissions.ts       # requirePermission() helper
│   ├── currency.ts               # Formatage devises
│   └── tax.ts                    # TVA 19,25% + calculs OHADA
├── hooks/
│   ├── usePermissions.ts         # Hook canAny(), can()
│   └── useChat.ts                # Hook Nkap AI chat
└── types/index.ts                # Types TypeScript (Invoice, Quote, Client...)
prisma/
└── schema.prisma                 # Schéma BDD complet
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
npm run dev                              # Développement (localhost:3000)
npm run build                            # Build production
./node_modules/.bin/prisma generate      # Régénérer le client Prisma
./node_modules/.bin/prisma db push       # Synchroniser le schéma → BDD
./node_modules/.bin/prisma studio        # GUI base de données
```

---

## Licence

Projet privé — © 2026 Nkap Control. Tous droits réservés.
