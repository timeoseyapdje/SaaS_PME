# Nkap Control — Gestion Financière & Commerciale pour PME

Solution SaaS tout-en-un de gestion financière et commerciale, conçue spécifiquement pour les PME camerounaises et africaines. Conforme au droit OHADA et au Code Général des Impôts du Cameroun.

---

## Fonctionnalités

### Finance & Comptabilité
- **Tableau de bord** — KPIs en temps réel (CA, dépenses, résultat net, factures impayées), graphiques revenus/dépenses 6 mois, alertes stock faible
- **Facturation** — Création, envoi et suivi des factures avec TVA camerounaise (19,25%), numérotation automatique, export PDF/Excel
- **Dépenses & Recettes** — Enregistrement et catégorisation des flux financiers
- **Trésorerie** — Gestion multi-comptes (Compte courant, Caisse, MTN Money, Orange Money)
- **Rapports fiscaux** — Compte de résultat, bilan simplifié, synthèse TVA et IS conformes OHADA

### Commerce & Ventes
- **Catalogue produits** — Gestion des produits et services, catégories, images, prix/coût, suivi des stocks avec seuils d'alerte
- **Commandes** — Création de commandes, suivi de statut (Pending → Confirmed → Shipped → Delivered), déduction automatique des stocks, conversion en facture
- **Liens de paiement** — Génération de liens de paiement partageables (MTN Money / Orange Money), page publique de paiement sans authentification
- **Clients & Fournisseurs** — Gestion des contacts avec historique complet des factures et transactions

### Plateforme
- **Nkap AI** — Assistant IA basé sur l'API Anthropic pour l'analyse financière
- **Dark / Light mode** — Thème sombre, clair ou automatique (synchronisé avec le système)
- **Multi-devises** — FCFA (XAF), Euro, Dollar US
- **Gestion des abonnements** — Plans Starter (gratuit), Pro (3 000 FCFA/mois), Max (10 000 FCFA/mois) avec Stripe

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| Base de données | PostgreSQL + Prisma ORM |
| Authentification | NextAuth.js v5 (JWT, credentials) |
| UI | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Thème | next-themes (dark/light/system) |
| Animations | Framer Motion |
| Graphiques | Recharts 2 |
| Validation | Zod + React Hook Form |
| IA | Anthropic SDK (@anthropic-ai/sdk) |
| Paiements | Stripe |
| Emails | Resend |
| PDF/Excel | jsPDF + html2canvas + ExcelJS |
| Typage | TypeScript 5 (strict mode) |

---

## Installation

### Prérequis

- Node.js 20+
- PostgreSQL 14+
- Compte Stripe (pour les abonnements)
- Clé API Anthropic (pour Nkap AI)

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
DATABASE_URL="postgresql://user:password@localhost:5432/nkap_control"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-clé-secrète-32-caractères"

ANTHROPIC_API_KEY="sk-ant-..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

RESEND_API_KEY="re_..."
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

## Structure du Projet

```
src/
├── app/
│   ├── (auth)/                # Login, Register
│   ├── (dashboard)/           # Pages protégées (auth requise)
│   │   ├── dashboard/         # Tableau de bord
│   │   ├── invoices/          # Factures
│   │   ├── expenses/          # Dépenses & Recettes
│   │   ├── treasury/          # Trésorerie
│   │   ├── clients/           # Clients
│   │   ├── suppliers/         # Fournisseurs
│   │   ├── products/          # Catalogue produits & Inventaire
│   │   ├── orders/            # Commandes
│   │   ├── payment-links/     # Liens de paiement
│   │   ├── reports/           # Rapports fiscaux
│   │   ├── ai/                # Nkap AI
│   │   └── settings/          # Paramètres entreprise & compte
│   ├── api/                   # Routes API REST
│   │   ├── invoices/
│   │   ├── expenses/
│   │   ├── treasury/
│   │   ├── clients/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── payment-links/
│   │   ├── pay/[slug]/        # Endpoint public lien de paiement
│   │   └── payments/stripe/
│   ├── onboarding/            # Guide de démarrage (page publique)
│   ├── pay/[slug]/            # Page publique de paiement
│   ├── terms/                 # CGU
│   ├── privacy/               # Politique de confidentialité
│   └── help/                  # Centre d'aide
├── components/
│   ├── ui/                    # Composants de base (shadcn/ui + theme-toggle)
│   ├── layout/                # Sidebar, Header
│   ├── dashboard/             # KPICard, RevenueChart, RecentInvoices
│   ├── invoices/              # InvoiceForm, InvoiceTable, InvoiceStatusBadge
│   ├── products/              # ProductCard, ProductTable, StockBadge
│   ├── orders/                # OrderTable, OrderStatusBadge, OrderTimeline
│   └── expenses/              # ExpenseForm, ExpenseTable
├── hooks/                     # Hooks React personnalisés
├── lib/                       # auth, currency, tax, utils
└── types/                     # Types TypeScript (Invoice, Product, Order, …)
prisma/
├── schema.prisma              # Schéma de base de données
└── seed.ts                    # Données de démonstration
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
