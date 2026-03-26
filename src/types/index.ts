/**
 * TypeScript types for PME Finance SaaS
 */

// ============================================================
// USER & AUTH
// ============================================================

export type UserRole = "ADMIN" | "ACCOUNTANT" | "VIEWER";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  companyId: string | null;
  createdAt: Date;
}

export interface AuthSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    companyId?: string;
  };
  expires: string;
}

// ============================================================
// COMPANY
// ============================================================

export interface Company {
  id: string;
  name: string;
  legalName?: string;
  registrationNo?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  currency: string;
  fiscalYearStart: number;
  createdAt: Date;
}

// ============================================================
// CLIENTS & SUPPLIERS
// ============================================================

export type ClientType = "PARTICULIER" | "ENTREPRISE" | "ONG" | "ADMINISTRATION";

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  taxId?: string;
  type: ClientType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Computed
  totalInvoiced?: number;
  totalPaid?: number;
  balance?: number;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  taxId?: string;
  type: ClientType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// INVOICES
// ============================================================

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  client?: Client;
  number: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  currency: string;
  subtotal: number;
  tvaRate: number;
  tvaAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  applyTVA: boolean;
  paidAt?: Date;
  reminderSent: boolean;
  reminderDate?: Date;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceInput {
  clientId: string;
  dueDate: string;
  currency: string;
  applyTVA: boolean;
  notes?: string;
  terms?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

// ============================================================
// EXPENSES & REVENUES
// ============================================================

export type ExpenseCategory =
  | "SALAIRES"
  | "LOYER"
  | "FOURNITURES"
  | "TRANSPORT"
  | "COMMUNICATION"
  | "MARKETING"
  | "TAXES"
  | "ASSURANCE"
  | "MAINTENANCE"
  | "FORMATION"
  | "SOUS_TRAITANCE"
  | "AUTRES";

export type RevenueCategory =
  | "VENTES_PRODUITS"
  | "PRESTATIONS_SERVICES"
  | "INTERETS"
  | "SUBVENTIONS"
  | "AUTRES";

export type PaymentMethod =
  | "ESPECES"
  | "VIREMENT"
  | "CHEQUE"
  | "MTN_MONEY"
  | "ORANGE_MONEY"
  | "CARTE_BANCAIRE";

export interface Expense {
  id: string;
  companyId: string;
  supplierId?: string;
  supplier?: Supplier;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  paymentMethod: PaymentMethod;
  receipt?: string;
  notes?: string;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Revenue {
  id: string;
  companyId: string;
  category: RevenueCategory;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// TREASURY & BANK ACCOUNTS
// ============================================================

export type AccountType =
  | "COMPTE_COURANT"
  | "COMPTE_EPARGNE"
  | "MTN_MONEY"
  | "ORANGE_MONEY"
  | "CAISSE";

export interface BankAccount {
  id: string;
  companyId: string;
  name: string;
  type: AccountType;
  bankName?: string;
  accountNumber?: string;
  balance: number;
  currency: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// TAX DECLARATIONS
// ============================================================

export type TaxType = "TVA" | "IS" | "PATENTE" | "RETENUE_SOURCE" | "TSR" | "IRPP";
export type TaxStatus = "PENDING" | "FILED" | "PAID" | "OVERDUE";

export interface TaxDeclaration {
  id: string;
  companyId: string;
  type: TaxType;
  period: string;
  amount: number;
  dueDate: Date;
  paidAt?: Date;
  status: TaxStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// DASHBOARD
// ============================================================

export interface DashboardKPIs {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  expenses: {
    current: number;
    previous: number;
    change: number;
  };
  netResult: {
    current: number;
    previous: number;
    change: number;
  };
  treasury: {
    total: number;
    byAccount: { name: string; balance: number; type: string }[];
  };
  invoices: {
    pending: number;
    pendingAmount: number;
    overdue: number;
    overdueAmount: number;
    recoveryRate: number;
  };
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface TopClient {
  id: string;
  name: string;
  total: number;
  invoiceCount: number;
}

// ============================================================
// REPORTS
// ============================================================

export interface IncomeStatement {
  period: string;
  revenue: {
    sales: number;
    services: number;
    other: number;
    total: number;
  };
  expenses: {
    salaries: number;
    rent: number;
    supplies: number;
    marketing: number;
    taxes: number;
    other: number;
    total: number;
  };
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
  tva: number;
  is: number;
}

export interface BalanceSheet {
  period: string;
  assets: {
    cash: number;
    receivables: number;
    inventory: number;
    fixed: number;
    total: number;
  };
  liabilities: {
    payables: number;
    loans: number;
    taxDue: number;
    total: number;
  };
  equity: number;
}

// ============================================================
// CURRENCY
// ============================================================

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export interface CurrencyRate {
  fromCode: string;
  toCode: string;
  rate: number;
  date: Date;
}

// ============================================================
// API RESPONSES
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
