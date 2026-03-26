# FinancePME - Gestion Financière pour PME Camerounaises

Application SaaS de gestion financière complète, conçue spécifiquement pour les PME camerounaises. Conforme au droit OHADA et au Code Général des Impôts du Cameroun.

## Fonctionnalités

- **Tableau de bord** - KPIs financiers, graphiques revenus/dépenses, factures en attente
- **Facturation** - Création, envoi et suivi des factures avec TVA camerounaise (19,25%)
- **Dépenses & Recettes** - Enregistrement et catégorisation des flux financiers
- **Trésorerie** - Gestion multi-comptes (Compte courant, Caisse, MTN Money, Orange Money)
- **Rapports** - Compte de résultat, bilan simplifié, synthèse fiscale (TVA, IS)
- **Clients & Fournisseurs** - Gestion des contacts avec NIU camerounais
- **Multi-devises** - FCFA (XAF), Euro, Dollar US

## Stack technique

- **Framework**: Next.js 14 (App Router)
- **Base de données**: PostgreSQL + Prisma ORM
- **Authentification**: NextAuth.js v5 (JWT)
- **UI**: Tailwind CSS + shadcn/ui
- **Graphiques**: Recharts
- **Validation**: Zod
- **Typage**: TypeScript strict

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+

### Étapes

1. Cloner le projet

```bash
git clone https://github.com/timeoseyapdje/SaaS_PME.git
cd SaaS_PME
```

2. Installer les dépendances

```bash
npm install
```

3. Configurer l'environnement

```bash
cp .env.example .env
```

Modifier `.env` avec vos paramètres :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/saas_pme"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-clé-secrète-de-32-caractères"
```

4. Initialiser la base de données

```bash
npx prisma generate
npx prisma db push
```

5. Peupler avec les données de démo (optionnel)

```bash
npm run db:seed
```

6. Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Compte de démonstration

Après le seeding :

- **Email**: demo@financepme.cm
- **Mot de passe**: demo123456

## Structure du projet

```
src/
├── app/
│   ├── (auth)/          # Pages de connexion / inscription
│   ├── (dashboard)/     # Pages protégées (tableau de bord, factures, etc.)
│   └── api/             # Routes API REST
├── components/
│   ├── ui/              # Composants UI (shadcn/ui)
│   ├── layout/          # Sidebar, Header
│   ├── dashboard/       # KPICard, RevenueChart, RecentInvoices
│   ├── invoices/        # InvoiceForm, InvoiceTable, InvoiceStatusBadge
│   └── expenses/        # ExpenseForm, ExpenseTable
├── hooks/               # Hooks React personnalisés
├── lib/                 # Utilitaires (auth, currency, tax, utils)
└── types/               # Types TypeScript
prisma/
├── schema.prisma        # Schéma de base de données
└── seed.ts              # Données de démonstration
```

## Fiscalité camerounaise

L'application intègre les règles fiscales en vigueur au Cameroun :

| Taxe | Taux | Périodicité |
|------|------|-------------|
| TVA | 19,25% | Mensuelle (15 du mois suivant) |
| IS | 33% | Annuelle (31 mars) |
| Patente | Variable | Trimestrielle |
| Retenue à la source | 5,5% | Sur chaque paiement |
| TSR | 3% | Sur revenus |

## Commandes utiles

```bash
npm run dev          # Démarrer en développement
npm run build        # Build production
npm run db:push      # Synchroniser le schéma
npm run db:seed      # Peupler avec des données demo
npm run db:studio    # Ouvrir Prisma Studio
npm run db:generate  # Générer le client Prisma
```

## Licence

Projet privé - Tous droits réservés.
