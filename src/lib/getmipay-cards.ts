// getMIPay Virtual Cards API v1
// Base URL: https://getmipay.com/api/v1/virtual-cards
// All endpoints require JWT Bearer token from getAuthToken()

import { getAuthToken } from "./getmipay";

const API_BASE = "https://getmipay.com/api/v1";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CardUser {
  id: number;
  merchantId: number;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  dob: string;
  countryCode: string;
  billingName: string;
  isBusiness: boolean;
  businessName: string | null;
  billingAddress: string;
  billingCity: string;
  billingCountry: string;
  billingState: string;
  billingPostalCode: string;
  idNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualCard {
  cardId: string;
  userId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  currency: string;
  cardType: string;
  status: string;
  createdAt: string;
}

export interface CardOperationResult {
  operation: string;
  cardId: string;
  newBalance: number;
  currency: string;
  status: string;
  transactions?: CardTransaction[];
}

export interface CardTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface CardFeeConfig {
  id: number;
  cardGrade: string;
  cardType: string;
  currency: string;
  creationFee: number;
  monthlyFee: number;
  topUpFee: number;
  withdrawalFee: number;
  rejectBalanceFee: number;
  isActive: boolean;
}

export interface CardCreationFees {
  cardGrade: string;
  cardType: string;
  currency: string;
  initialBalance: number;
  creationFee: number;
  totalAmountRequired: number;
  otherFees: {
    monthlyFee: number;
    topUpFee: number;
    withdrawalFee: number;
    rejectBalanceFee: number;
  };
  fundingLimits: {
    min: number;
    max: number;
    currency: string;
  };
}

type ApiResult<T> = { data: T } | { error: string };

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function authenticatedFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const authResult = await getAuthToken();
  if ("error" in authResult) return { error: authResult.error };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${authResult.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const text = await res.text();
    if (!res.ok) {
      return { error: `http_${res.status}: ${text.slice(0, 300)}` };
    }

    const json = JSON.parse(text);
    if (!json.success) {
      return { error: json.message || text.slice(0, 200) };
    }

    return { data: json.data };
  } catch (err) {
    return { error: `exception: ${String(err)}` };
  }
}

function mapCardUser(raw: Record<string, unknown>): CardUser {
  return {
    id: raw.id as number,
    merchantId: raw.merchant_id as number,
    reference: raw.reference as string,
    firstName: raw.first_name as string,
    lastName: raw.last_name as string,
    email: raw.email as string,
    contact: raw.contact as string,
    dob: raw.dob as string,
    countryCode: raw.country_code as string,
    billingName: raw.billing_name as string,
    isBusiness: raw.is_business as boolean,
    businessName: raw.business_name as string | null,
    billingAddress: raw.billing_address as string,
    billingCity: raw.billing_city as string,
    billingCountry: raw.billing_country as string,
    billingState: raw.billing_state as string,
    billingPostalCode: raw.billing_postal_code as string,
    idNumber: raw.id_number as string,
    status: raw.status as string,
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
  };
}

function mapCard(raw: Record<string, unknown>): VirtualCard {
  return {
    cardId: raw.card_id as string,
    userId: raw.user_id as string,
    cardNumber: raw.card_number as string,
    expiryDate: raw.expiry_date as string,
    cvv: raw.cvv as string,
    balance: raw.balance as number,
    currency: raw.currency as string,
    cardType: raw.card_type as string,
    status: raw.status as string,
    createdAt: raw.created_at as string,
  };
}

function mapCardOperation(raw: Record<string, unknown>): CardOperationResult {
  return {
    operation: raw.operation as string,
    cardId: raw.card_id as string,
    newBalance: raw.new_balance as number,
    currency: raw.currency as string,
    status: raw.status as string,
    transactions: (raw.transactions as Record<string, unknown>[] | undefined)?.map((t) => ({
      id: t.id as string,
      amount: t.amount as number,
      currency: t.currency as string,
      type: t.type as string,
      status: t.status as string,
      createdAt: t.created_at as string,
    })),
  };
}

// ──────────────────────────────────────────────
// Card Users
// ──────────────────────────────────────────────

export async function createCardUser(params: {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  contact: string;
  dob: string;
  billingAddress: string;
  billingCity: string;
  billingCountry: string;
  billingState: string;
  billingPostalCode: string;
  idNumber: string;
  isBusiness?: boolean;
  businessName?: string | null;
}): Promise<ApiResult<CardUser>> {
  const result = await authenticatedFetch<{ data: Record<string, unknown> }>("/virtual-cards/users", {
    method: "POST",
    body: JSON.stringify({
      first_name: params.firstName,
      last_name: params.lastName,
      email: params.email,
      country_code: params.countryCode,
      contact: params.contact,
      dob: params.dob,
      billing_address: params.billingAddress,
      billing_city: params.billingCity,
      billing_country: params.billingCountry,
      billing_state: params.billingState,
      billing_postal_code: params.billingPostalCode,
      id_number: params.idNumber,
      is_business: params.isBusiness ?? false,
      business_name: params.businessName ?? null,
    }),
  });
  if ("error" in result) return result;
  const raw = (result.data as unknown as Record<string, unknown>);
  return { data: mapCardUser(raw) };
}

export async function updateCardUser(
  userReference: string,
  params: {
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    contact: string;
    dob: string;
    billingAddress: string;
    billingCity: string;
    billingCountry: string;
    billingState: string;
    billingPostalCode: string;
    idNumber: string;
    isBusiness?: boolean;
    businessName?: string | null;
  },
): Promise<ApiResult<CardUser>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/users/${userReference}`, {
    method: "PUT",
    body: JSON.stringify({
      first_name: params.firstName,
      last_name: params.lastName,
      email: params.email,
      country_code: params.countryCode,
      contact: params.contact,
      dob: params.dob,
      billing_address: params.billingAddress,
      billing_city: params.billingCity,
      billing_country: params.billingCountry,
      billing_state: params.billingState,
      billing_postal_code: params.billingPostalCode,
      id_number: params.idNumber,
      is_business: params.isBusiness ?? false,
      business_name: params.businessName ?? null,
    }),
  });
  if ("error" in result) return result;
  return { data: mapCardUser(result.data) };
}

export async function getAllCardUsers(): Promise<ApiResult<{ users: CardUser[]; totalCount: number }>> {
  const result = await authenticatedFetch<{ users: Array<{ data: Record<string, unknown> }>; total_count: number }>("/virtual-cards/users");
  if ("error" in result) return result;
  return {
    data: {
      users: result.data.users.map((u) => mapCardUser(u.data)),
      totalCount: result.data.total_count,
    },
  };
}

export async function getCardUser(reference: string): Promise<ApiResult<CardUser>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/users/${reference}`);
  if ("error" in result) return result;
  return { data: mapCardUser(result.data) };
}

export async function getCardUserDetails(userReference: string): Promise<ApiResult<CardUser>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/users/${userReference}/details`);
  if ("error" in result) return result;
  return { data: mapCardUser(result.data) };
}

// ──────────────────────────────────────────────
// Virtual Cards CRUD
// ──────────────────────────────────────────────

export async function createCard(params: {
  userId: string;
  balance: number;
  currency: "USD" | "EUR" | "XAF";
  cardType: "VISA" | "MASTERCARD";
  category: "PERSONAL" | "BUSINESS";
  grade: "BASIC" | "PREMIUM";
}): Promise<ApiResult<VirtualCard>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/users/${params.userId}/cards`, {
    method: "POST",
    body: JSON.stringify({
      balance: params.balance,
      currency: params.currency,
      card_type: params.cardType,
      category: params.category,
      grade: params.grade,
    }),
  });
  if ("error" in result) return result;
  return { data: mapCard(result.data) };
}

export async function listVirtualCards(): Promise<ApiResult<VirtualCard[]>> {
  const result = await authenticatedFetch<unknown[]>("/virtual-cards");
  if ("error" in result) return result;
  return { data: (result.data as Record<string, unknown>[]).map(mapCard) };
}

export async function getCardDetails(cardId: string): Promise<ApiResult<VirtualCard>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/${cardId}`);
  if ("error" in result) return result;
  return { data: mapCard(result.data) };
}

export async function getCardBalance(cardId: string): Promise<ApiResult<{ cardId: string; balance: number; currency: string }>> {
  const result = await authenticatedFetch<{ card_id: string; balance: number; currency: string }>(`/virtual-cards/${cardId}/balance`);
  if ("error" in result) return result;
  return { data: { cardId: result.data.card_id, balance: result.data.balance, currency: result.data.currency } };
}

export async function getCardTransactions(cardId: string): Promise<ApiResult<CardOperationResult>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/${cardId}/transactions`);
  if ("error" in result) return result;
  return { data: mapCardOperation(result.data) };
}

// ──────────────────────────────────────────────
// Card Operations
// ──────────────────────────────────────────────

export async function topUpCard(
  cardId: string,
  amount: number,
  currency: "USD" | "EUR" | "XAF",
): Promise<ApiResult<CardOperationResult>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/${cardId}/topup`, {
    method: "POST",
    body: JSON.stringify({ amount, currency }),
  });
  if ("error" in result) return result;
  return { data: mapCardOperation(result.data) };
}

export async function withdrawFromCard(
  cardId: string,
  amount: number,
  currency: "USD" | "EUR" | "XAF",
): Promise<ApiResult<CardOperationResult>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/${cardId}/withdraw`, {
    method: "POST",
    body: JSON.stringify({ amount, currency }),
  });
  if ("error" in result) return result;
  return { data: mapCardOperation(result.data) };
}

export async function enableCard(cardId: string): Promise<ApiResult<CardOperationResult>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/${cardId}/enable`, {
    method: "POST",
  });
  if ("error" in result) return result;
  return { data: mapCardOperation(result.data) };
}

export async function disableCard(cardId: string): Promise<ApiResult<CardOperationResult>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/${cardId}/disable`, {
    method: "POST",
  });
  if ("error" in result) return result;
  return { data: mapCardOperation(result.data) };
}

export async function terminateCard(cardId: string): Promise<ApiResult<CardOperationResult>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/${cardId}`, {
    method: "DELETE",
  });
  if ("error" in result) return result;
  return { data: mapCardOperation(result.data) };
}

// Generic card operation (alternative endpoint)
export async function cardOperation(
  cardId: string,
  action: "topup" | "withdraw" | "enable" | "disable" | "get_balance" | "get_transactions",
  amount?: number,
  currency?: "USD" | "EUR" | "XAF",
): Promise<ApiResult<CardOperationResult>> {
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/${cardId}/operation`, {
    method: "POST",
    body: JSON.stringify({
      action,
      ...(amount !== undefined ? { amount } : {}),
      ...(currency ? { currency } : {}),
    }),
  });
  if ("error" in result) return result;
  return { data: mapCardOperation(result.data) };
}

// ──────────────────────────────────────────────
// Fee Configurations
// ──────────────────────────────────────────────

export async function getAllCardFeeConfigs(): Promise<ApiResult<{
  fees: CardFeeConfig[];
  totalFeeConfigurations: number;
  currenciesAvailable: string[];
  cardTypesAvailable: string[];
  cardGradesAvailable: string[];
}>> {
  const result = await authenticatedFetch<{
    fees: Array<Record<string, unknown>>;
    total_fee_configurations: number;
    currencies_available: string[];
    card_types_available: string[];
    card_grades_available: string[];
  }>("/virtual-cards/fees");
  if ("error" in result) return result;
  return {
    data: {
      fees: result.data.fees.map((f) => ({
        id: f.id as number,
        cardGrade: f.card_grade as string,
        cardType: f.card_type as string,
        currency: f.currency as string,
        creationFee: f.creation_fee as number,
        monthlyFee: f.monthly_fee as number,
        topUpFee: f.top_up_fee as number,
        withdrawalFee: f.withdrawal_fee as number,
        rejectBalanceFee: f.reject_balance_fee as number,
        isActive: f.is_active as boolean,
      })),
      totalFeeConfigurations: result.data.total_fee_configurations,
      currenciesAvailable: result.data.currencies_available,
      cardTypesAvailable: result.data.card_types_available,
      cardGradesAvailable: result.data.card_grades_available,
    },
  };
}

export async function calculateCardCreationFees(params: {
  cardGrade: "BASIC" | "PREMIUM";
  cardType: "VISA" | "MASTERCARD";
  initialBalance: number;
}): Promise<ApiResult<CardCreationFees>> {
  const qs = new URLSearchParams({
    card_grade: params.cardGrade,
    card_type: params.cardType,
    initial_balance: String(params.initialBalance),
  });
  const result = await authenticatedFetch<Record<string, unknown>>(`/virtual-cards/fees/calculate?${qs}`);
  if ("error" in result) return result;
  const d = result.data;
  const otherFees = d.other_fees as Record<string, number>;
  const limits = d.funding_limits as Record<string, unknown>;
  return {
    data: {
      cardGrade: d.card_grade as string,
      cardType: d.card_type as string,
      currency: d.currency as string,
      initialBalance: d.initial_balance as number,
      creationFee: d.creation_fee as number,
      totalAmountRequired: d.total_amount_required as number,
      otherFees: {
        monthlyFee: otherFees.monthly_fee,
        topUpFee: otherFees.top_up_fee,
        withdrawalFee: otherFees.withdrawal_fee,
        rejectBalanceFee: otherFees.reject_balance_fee,
      },
      fundingLimits: {
        min: limits.min as number,
        max: limits.max as number,
        currency: limits.currency as string,
      },
    },
  };
}
