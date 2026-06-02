// getMIPay API v1 — Production integration
// Base URL: https://getmipay.com/api/v1
// Auth: JWT bearer token via POST /action/auth (expires 24h)
// Services: 1=MTN CM, 3=OM CI, 4=OM SN, 5=OM BF

export const GETMIPAY_FEE_RATE = 0.03; // 3% payin fee (source: /api/services)

const API_BASE = "https://getmipay.com/api/v1";

// Service IDs per the production API docs
const SERVICE_IDS: Record<string, string> = {
  MTN_MONEY: "1",      // MTN Mobile Money Cameroon
  ORANGE_MONEY_CI: "3", // Orange Money Côte d'Ivoire (OTP required)
  ORANGE_MONEY_SN: "4", // Orange Money Senegal (OTP required)
  ORANGE_MONEY_BF: "5", // Orange Money Burkina Faso (OTP required)
};

function getServiceId(paymentMethod: "MTN_MONEY" | "ORANGE_MONEY"): string {
  if (paymentMethod === "MTN_MONEY") {
    return process.env.GETMIPAY_MTN_SERVICE_ID || SERVICE_IDS.MTN_MONEY;
  }
  return process.env.GETMIPAY_ORANGE_SERVICE_ID || SERVICE_IDS.ORANGE_MONEY_CI;
}

export function isGetMiPayConfigured(): boolean {
  return !!(
    process.env.GETMIPAY_PUBLIC_KEY &&
    process.env.GETMIPAY_PRIVATE_KEY
  );
}

export function getMiPayConfigStatus(): Record<string, boolean> {
  return {
    GETMIPAY_PUBLIC_KEY: !!process.env.GETMIPAY_PUBLIC_KEY,
    GETMIPAY_PRIVATE_KEY: !!process.env.GETMIPAY_PRIVATE_KEY,
    GETMIPAY_MTN_SERVICE_ID: !!process.env.GETMIPAY_MTN_SERVICE_ID,
    GETMIPAY_ORANGE_SERVICE_ID: !!process.env.GETMIPAY_ORANGE_SERVICE_ID,
  };
}

export function calculateGrossAmount(netAmount: number): { grossAmount: number; feeAmount: number } {
  const grossAmount = Math.ceil(netAmount / (1 - GETMIPAY_FEE_RATE));
  const feeAmount = grossAmount - netAmount;
  return { grossAmount, feeAmount };
}

export function generateReference(prefix: string = "GM"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function formatWallet(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("237") ? digits : `237${digits}`;
}

// Token cache to avoid re-authenticating on every call (token lives 24h)
let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getAuthToken(): Promise<{ token: string } | { error: string }> {
  // Return cached token if still valid (with 5min safety margin)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 5 * 60 * 1000) {
    return { token: tokenCache.token };
  }

  const publicKey = process.env.GETMIPAY_PUBLIC_KEY;
  const privateKey = process.env.GETMIPAY_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return { error: "credentials_missing: GETMIPAY_PUBLIC_KEY ou GETMIPAY_PRIVATE_KEY non configuré" };
  }

  let rawBody = "";
  try {
    const res = await fetch(`${API_BASE}/action/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_apikey: publicKey, private_secretkey: privateKey }),
    });
    rawBody = await res.text();
    if (!res.ok) {
      return { error: `auth_http_${res.status}: ${rawBody.slice(0, 300)}` };
    }
    const data = JSON.parse(rawBody);
    if (!data.success || !data.data?.token) {
      return { error: `auth_no_token: ${rawBody.slice(0, 200)}` };
    }
    const token = data.data.token;

    // Cache for 24h (or until expires_at if provided)
    const expiresAt = data.data.expires_at
      ? new Date(data.data.expires_at).getTime()
      : Date.now() + 24 * 60 * 60 * 1000;
    tokenCache = { token, expiresAt };

    return { token };
  } catch (err) {
    return { error: `auth_exception: ${String(err)} — body: ${rawBody.slice(0, 100)}` };
  }
}

export interface PayInResult {
  transactionReference: string;
  soleaspayReference: string | null;
  feeAmount: number | null;
  netAmount: number | null;
  otpRequired: boolean;
}

export async function initiatePayIn({
  amount,
  currency = "XAF",
  wallet,
  description,
  customerName,
  customerEmail,
  callbackUrl,
  paymentMethod,
  reference,
  otp,
}: {
  amount: number;
  currency?: string;
  wallet: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  callbackUrl?: string;
  paymentMethod: "MTN_MONEY" | "ORANGE_MONEY";
  reference: string;
  otp?: string;
}): Promise<PayInResult | { error: string }> {
  const authResult = await getAuthToken();
  if ("error" in authResult) return { error: authResult.error };
  const token = authResult.token;

  const serviceId = getServiceId(paymentMethod);

  let rawBody = "";
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      service: serviceId,
      operation: "2",
    };
    // OTP required only for Orange Money CI/SN/BF
    if (otp) headers.otp = otp;

    const res = await fetch(`${API_BASE}/payins`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        amount,
        currency,
        wallet: formatWallet(wallet),
        description,
        customer_name: customerName || "Client",
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
      }),
    });

    rawBody = await res.text();
    if (!res.ok) {
      return { error: `payin_http_${res.status}: ${rawBody.slice(0, 300)}` };
    }

    const data = JSON.parse(rawBody);
    if (!data.success) {
      return { error: `payin_rejected: ${data.message || rawBody.slice(0, 200)}` };
    }

    const txRef = data.data?.transaction_reference || null;
    if (!txRef) {
      return { error: `payin_no_ref: ${rawBody.slice(0, 200)}` };
    }

    return {
      transactionReference: txRef,
      soleaspayReference: data.data?.soleaspay_reference || null,
      feeAmount: data.data?.fee_amount ?? null,
      netAmount: data.data?.net_amount ?? null,
      otpRequired: data.data?.otp_required ?? false,
    };
  } catch (err) {
    return { error: `payin_exception: ${String(err)} — body: ${rawBody.slice(0, 200)}` };
  }
}

export async function initiatePayOut({
  amount,
  currency = "XAF",
  wallet,
  description,
  customerName,
  paymentMethod,
}: {
  amount: number;
  currency?: string;
  wallet: string;
  description: string;
  customerName?: string;
  paymentMethod: "MTN_MONEY" | "ORANGE_MONEY";
  reference?: string;
}): Promise<{ transactionReference: string; soleaspayReference: string | null } | null> {
  const authResult = await getAuthToken();
  if ("error" in authResult) { console.error("getMIpay payout auth failed:", authResult.error); return null; }
  const token = authResult.token;

  const serviceId = getServiceId(paymentMethod);

  try {
    const res = await fetch(`${API_BASE}/payouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        service: serviceId,
        operation: "4",
      },
      body: JSON.stringify({
        amount,
        currency,
        wallet: formatWallet(wallet),
        description,
        customer_name: customerName || "Marchand",
      }),
    });

    if (!res.ok) {
      console.error("getMIpay payout failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    if (!data.success) {
      console.error("getMIpay payout error:", data.message, JSON.stringify(data));
      return null;
    }

    const txRef = data.data?.transaction_reference || null;
    if (!txRef) {
      console.error("getMIpay payout: no transaction reference in response", JSON.stringify(data));
      return null;
    }
    return {
      transactionReference: txRef,
      soleaspayReference: data.data?.soleaspay_reference || null,
    };
  } catch (err) {
    console.error("getMIpay payout error:", err);
    return null;
  }
}

// Direct transaction status check via POST /transaction-check
// Uses both order_id and pay_id (soleaspay_reference) for reliable lookup
export async function checkPaymentStatus(
  orderId: string,
  payId?: string,
): Promise<{ status: string; amount?: number; currency?: string } | null> {
  const authResult = await getAuthToken();
  if ("error" in authResult) { console.error("getMIpay checkStatus auth failed:", authResult.error); return null; }
  const token = authResult.token;

  try {
    const res = await fetch(`${API_BASE}/transaction-check`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderId,
        pay_id: payId || orderId,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    return {
      status: data.data?.status || "UNKNOWN",
      amount: data.data?.amount,
      currency: data.data?.currency,
    };
  } catch (err) {
    console.error("getMIpay status error:", err);
    return null;
  }
}

// ──────────────────────────────────────────────
// Utils — Balance, Services, Currency Converter
// ──────────────────────────────────────────────

export async function getMerchantBalance(): Promise<{ balance: number; currency: string; merchantName: string } | null> {
  const authResult = await getAuthToken();
  if ("error" in authResult) return null;

  try {
    const res = await fetch(`${API_BASE}/balance`, {
      headers: { Authorization: `Bearer ${authResult.token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    return {
      balance: data.data.balance,
      currency: data.data.currency,
      merchantName: data.data.merchant_name,
    };
  } catch {
    return null;
  }
}

export async function getAvailableServices(): Promise<{
  allServices: Array<{
    id: string;
    name: string;
    description: string;
    countryCode: string;
    countryName: string;
    withdrawable: boolean;
    depositable: boolean;
    currency: string;
    minAmount: number;
    maxAmount: number;
  }>;
} | null> {
  const authResult = await getAuthToken();
  if ("error" in authResult) return null;

  try {
    const res = await fetch(`${API_BASE}/services`, {
      headers: { Authorization: `Bearer ${authResult.token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    return {
      allServices: (data.data.all_services || []).map((s: Record<string, unknown>) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        countryCode: s.country_code,
        countryName: s.country_name,
        withdrawable: s.withdrawable,
        depositable: s.depositable,
        currency: s.currency,
        minAmount: s.min_amount,
        maxAmount: s.max_amount,
      })),
    };
  } catch {
    return null;
  }
}

export async function convertCurrency(
  amount: number,
  from: "XAF" | "XOF" | "USD" | "EUR",
  to: "XAF" | "XOF" | "USD" | "EUR",
): Promise<{ amount: number; currency: string } | null> {
  const authResult = await getAuthToken();
  if ("error" in authResult) return null;

  try {
    const params = new URLSearchParams({ amount: String(amount), from, to });
    const res = await fetch(`${API_BASE}/convert-currency?${params}`, {
      headers: { Authorization: `Bearer ${authResult.token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    return { amount: data.data.amount, currency: data.data.currency };
  } catch {
    return null;
  }
}

export async function checkApiKeyStatus(): Promise<{
  isActive: boolean;
  status: string;
  merchant?: { id: number; businessName: string };
} | null> {
  const secretKey = process.env.GETMIPAY_PRIVATE_KEY;
  if (!secretKey) return null;

  try {
    const res = await fetch(`${API_BASE}/action/check-api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret_apikey: secretKey }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    return {
      isActive: data.data.api_key?.is_active ?? false,
      status: data.data.api_key?.status ?? "unknown",
      merchant: data.data.merchant ? {
        id: data.data.merchant.id,
        businessName: data.data.merchant.business_name,
      } : undefined,
    };
  } catch {
    return null;
  }
}
