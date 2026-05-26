# CLAUDE.md — Nkap Control

Guide de référence pour Claude Code. Toujours lire avant d'intervenir sur ce projet.

---

## Commandes Essentielles

```bash
# Développement
npm run dev

# Prisma (TOUJOURS utiliser le binaire local, pas npx)
./node_modules/.bin/prisma generate      # Régénérer les types TypeScript
./node_modules/.bin/prisma db push       # Synchroniser schéma → BDD
./node_modules/.bin/prisma studio        # GUI BDD

# TypeScript check (sans build)
npx tsc --noEmit
```

> **Critique** : `npx prisma` télécharge la v7 incompatible. Toujours `./node_modules/.bin/prisma`.

---

## Architecture

### Stack
- **Next.js 15** App Router — pages dans `src/app/(dashboard)/`
- **Prisma v5.22** ORM — schéma dans `prisma/schema.prisma`
- **NextAuth.js v5** — session JWT, helper `auth()` dans `src/lib/auth.ts`
- **shadcn/ui** — composants dans `src/components/ui/`

### Pattern d'authentification et permissions
Toutes les API routes protégées utilisent :
```typescript
import { requirePermission, isNextResponse } from "@/lib/auth-permissions";

const result = await requirePermission("invoices", "view");
if (isNextResponse(result)) return result;
const companyId = result.session.user.companyId;
```
**Isolation stricte** : chaque requête Prisma filtre par `companyId`. Ne jamais oublier ce filtre.

### Modules de permissions
Définis dans `src/lib/permissions.ts` :
`dashboard`, `invoices`, `quotes`, `expenses`, `treasury`, `products`, `orders`, `clients`, `suppliers`, `reports`, `payment_links`, `settings`, `team`

---

## Modèle de Données (résumé)

```
Company
  ├── Users (Admin / Accountant / Viewer)
  ├── Positions (permissions granulaires par module)
  ├── Clients
  ├── Suppliers
  ├── Invoices (FAC-YYYY-XXXX) → InvoiceItems
  ├── Quotes   (DEV-YYYY-XXXX) → QuoteItems
  ├── Expenses + Revenues
  ├── BankAccounts (COMPTE_COURANT, MTN_MONEY, ORANGE_MONEY, CAISSE...)
  ├── Categories → Products → StockMovements
  ├── Orders → OrderItems
  ├── PaymentLinks → PaymentLinkTransactions
  └── Subscription
```

**Champs Invoice clés** : `status` (DRAFT/SENT/PAID/OVERDUE/CANCELLED), `reminderSent`, `reminderDate`, `paidAt`

**Champs Quote clés** : `status` (DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED/CONVERTED), `validUntil`, `convertedInvoiceId`

---

## API Routes Importantes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/invoices` | GET, POST | Liste + création |
| `/api/invoices/[id]` | GET, PATCH, DELETE | Détail + mise à jour (supporte `reminderSent`) |
| `/api/invoices/mark-overdue` | POST | Passe SENT → OVERDUE si échéance dépassée |
| `/api/invoices/[id]/duplicate` | POST | Crée un brouillon copie |
| `/api/quotes` | GET, POST | Liste + création |
| `/api/quotes/[id]` | GET, PATCH, DELETE | Détail + mise à jour |
| `/api/quotes/[id]/convert` | POST | Convertit en facture (FAC-YYYY-XXXX) |
| `/api/email/send-invoice` | POST | Envoie la facture par email (Resend) |
| `/api/email/send-quote` | POST | Envoie le devis par email (Resend) |
| `/api/pay/[slug]` | POST | Initie paiement getMIpay (USSD push) |
| `/api/payments/getmipay` | POST | Init abonnement getMIpay |
| `/api/payments/getmipay/callback` | GET | Callback abonnement |
| `/api/payments/getmipay/callback/payment-link` | GET | Callback liens de paiement |
| `/api/webhooks/getmipay` | POST | Webhook getMIpay (abonnements + paiements) |
| `/api/webhooks/payment-links` | POST | Webhook liens de paiement getMIpay |

---

## getMIpay — Points Critiques

```typescript
// Auth: POST /auth/login → Bearer token (à chaque appel)
const token = await getAuthToken(); // dans src/lib/getmipay.ts

// PayIn (USSD push vers le téléphone du client)
await initiatePayIn({ amount, currency, wallet: "237XXXXXXXXX", paymentMethod: "MTN_MONEY", ... });
// → POST /payment/payin avec headers: service, operation: "2"

// PayOut (reversement au marchand)
await initiatePayOut({ amount, currency, wallet, paymentMethod, ... });
// → POST /payout avec headers: service, operation: "4"

// Wallet: format sans "+" — "237670000001" (pas "+237...")

// Variables d'environnement
GETMIPAY_BASE_URL       // URL de base API (ex: https://api.getmipay.com)
GETMIPAY_PUBLIC_KEY     // pour auth + payin
GETMIPAY_PRIVATE_KEY    // pour auth + payout
GETMIPAY_MTN_SERVICE_ID     // ID service MTN
GETMIPAY_ORANGE_SERVICE_ID  // ID service Orange
```

---

## Emails (Resend)

Fonctions dans `src/lib/email.ts` :
- `sendInvoiceEmail` — facture
- `sendQuoteEmail` — devis
- `sendSubscriptionConfirmationEmail` — confirmation abonnement
- `sendVerificationCodeEmail` — vérification email
- `sendWelcomeEmail` — bienvenue
- `sendPaymentRequestNotification` — demande de paiement
- `sendPaymentConfirmedEmail` — confirmation paiement

Si `RESEND_API_KEY` n'est pas configurée, les fonctions retournent `{ success: false }` sans erreur fatale.

---

## Export (src/lib/export.ts)

- `exportInvoicePDF(invoice)` — PDF facture
- `exportQuotePDF(quote)` — PDF devis
- `exportToExcel(data, fileName, sheetName)` — Excel
- `exportToCSV(data, fileName)` — CSV
- `formatInvoicesForExport`, `formatExpensesForExport`, `formatRevenuesForExport`

---

## Pages Principales

| URL | Composant | Description |
|-----|-----------|-------------|
| `/dashboard` | `dashboard/page.tsx` | KPIs + graphiques |
| `/invoices` | `invoices/page.tsx` | Liste factures |
| `/invoices/new` | `invoices/new/page.tsx` | Formulaire (InvoiceForm) |
| `/invoices/[id]` | `invoices/[id]/page.tsx` | Détail + actions |
| `/devis` | `devis/page.tsx` | Liste devis |
| `/devis/new` | `devis/new/page.tsx` | Formulaire (QuoteForm) |
| `/devis/[id]` | `devis/[id]/page.tsx` | Détail + actions |
| `/help` | `help/page.tsx` | Aide & FAQ in-app |
| `/pay/[slug]` | `app/pay/[slug]/page.tsx` | Page publique paiement |

---

## Composants Clés

| Composant | Fichier | Usage |
|-----------|---------|-------|
| `InvoiceForm` | `components/invoices/InvoiceForm.tsx` | Création/édition facture |
| `QuoteForm` | `components/quotes/QuoteForm.tsx` | Création/édition devis |
| `ProductPickerDialog` | `components/ui/product-picker-dialog.tsx` | Sélecteur produit catalogue |
| `Sidebar` | `components/layout/Sidebar.tsx` | Navigation principale |
| `Header` | `components/layout/Header.tsx` | En-tête de page |

---

## Migrations Prisma

En environnement local (remote execution), `DATABASE_URL` n'est pas disponible. La migration est gérée par Vercel au déploiement via le build script :
```
prisma db push --skip-generate --accept-data-loss && prisma generate && next build
```

Pour ajouter un modèle :
1. Modifier `prisma/schema.prisma`
2. Lancer `./node_modules/.bin/prisma generate` pour les types TypeScript
3. Pousser sur `main` — Vercel exécute `db push` automatiquement

---

## Conventions

- **Toast notifications** : toujours `useToast()` — jamais `alert()` ou `confirm()`
- **Confirmations de suppression** : état React inline (`confirmDelete`) + boutons Oui/Annuler — jamais de dialog natif
- **Icônes** : Lucide React — jamais d'emojis dans le code
- **Commentaires** : uniquement si le WHY est non-évident, jamais de commentaires sur le WHAT
- **Companyid** : obligatoire dans chaque requête BDD côté API
- **Prisma** : toujours `./node_modules/.bin/prisma`, jamais `npx prisma`
- **Branch principale** : `main`

---

## Déploiement

- **Hébergement** : Vercel (auto-déploiement sur push `main`)
- **Base de données** : Neon PostgreSQL serverless
- **URL preview** : `nkap-control-git-{branch}-timeoseyapdjes-projects.vercel.app`
