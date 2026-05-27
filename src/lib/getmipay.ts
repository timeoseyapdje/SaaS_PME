export const GETMIPAY_FEE_RATE = 0.015;

function getApiBase(): string {
  return process.env.GETMIPAY_BASE_URL || "https://api.getmipay.com";
}

function getServiceId(paymentMethod: "MTN_MONEY" | "ORANGE_MONEY"): string {
  return paymentMethod === "MTN_MONEY"
    ? process.env.GETMIPAY_MTN_SERVICE_ID || ""
    : process.env.GETMIPAY_ORANGE_SERVICE_ID || "";
}

export function isGetMiPayConfigured(): boolean {
  return !!(
    process.env.GETMIPAY_PUBLIC_KEY &&
    process.env.GETMIPAY_PRIVATE_KEY &&
    (process.env.GETMIPAY_MTN_SERVICE_ID || process.env.GETMIPAY_ORANGE_SERVICE_ID)
  );
}

export function getMiPayConfigStatus(): Record<string, boolean> {
  return {
    GETMIPAY_PUBLIC_KEY: !!process.env.GETMIPAY_PUBLIC_KEY,
    GETMIPAY_PRIVATE_KEY: !!process.env.GETMIPAY_PRIVATE_KEY,
    GETMIPAY_BASE_URL: !!process.env.GETMIPAY_BASE_URL,
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

async function getAuthToken(): Promise<{ token: string } | { error: string }> {
  const publicKey = process.env.GETMIPAY_PUBLIC_KEY;
  const privateKey = process.env.GETMIPAY_PRIVATE_KEY;
  const base = getApiBase();

  if (!publicKey || !privateKey) {
    return { error: `credentials_missing (base: ${base})` };
  }

  let rawBody = "";
  try {
    const res = await fetch(`${base}/action/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_apikey: publicKey, private_secretkey: privateKey }),
    });
    rawBody = await res.text();
    if (!res.ok) {
      return { error: `auth_http_${res.status} (base: ${base}): ${rawBody.slice(0, 300)}` };
    }
    const data = JSON.parse(rawBody);
    const token =
      data.access_token ||
      data.token ||
      data.data?.access_token ||
      data.data?.token ||
      data.result?.access_token ||
      data.result?.token ||
      null;
    if (!token) {
      return { error: `auth_no_token (base: ${base}): ${rawBody.slice(0, 200)}` };
    }
    return { token };
  } catch (err) {
    return { error: `auth_exception (base: ${base}): ${String(err)} — body: ${rawBody.slice(0, 100)}` };
  }
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
}: {
  amount: number;
  currency?: string;
  wallet: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  callbackUrl: string;
  paymentMethod: "MTN_MONEY" | "ORANGE_MONEY";
  reference: string;
}): Promise<{ transactionReference: string } | { error: string }> {
  const authResult = await getAuthToken();
  if ("error" in authResult) return { error: authResult.error };
  const token = authResult.token;

  const serviceId = getServiceId(paymentMethod);
  if (!serviceId) {
    return { error: `service_id_missing: GETMIPAY_${paymentMethod}_SERVICE_ID non configuré` };
  }

  let rawBody = "";
  try {
    const res = await fetch(`${getApiBase()}/payment/payin`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        service: serviceId,
        operation: "2",
      },
      body: JSON.stringify({
        amount,
        currency,
        wallet: formatWallet(wallet),
        description,
        customer_name: customerName || "Client",
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        callback_url: callbackUrl,
        external_reference: reference,
      }),
    });

    rawBody = await res.text();
    if (!res.ok) {
      return { error: `payin_http_${res.status}: ${rawBody.slice(0, 300)}` };
    }

    const data = JSON.parse(rawBody);
    const isSuccess = data.success === true || data.status === "success" || data.code === 200 || String(data.code) === "200";
    if (!isSuccess) {
      return { error: `payin_rejected: ${data.message || data.error || rawBody.slice(0, 200)}` };
    }

    const txRef =
      data.data?.transaction_reference ||
      data.transaction_reference ||
      data.data?.reference ||
      data.reference ||
      null;
    if (!txRef) {
      return { error: `payin_no_ref: ${rawBody.slice(0, 200)}` };
    }
    return { transactionReference: txRef };
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
  callbackUrl,
  paymentMethod,
  reference,
}: {
  amount: number;
  currency?: string;
  wallet: string;
  description: string;
  customerName?: string;
  callbackUrl?: string;
  paymentMethod: "MTN_MONEY" | "ORANGE_MONEY";
  reference: string;
}): Promise<{ transactionReference: string } | null> {
  const authResult = await getAuthToken();
  if ("error" in authResult) { console.error("getMIpay payout auth failed:", authResult.error); return null; }
  const token = authResult.token;

  const serviceId = getServiceId(paymentMethod);
  if (!serviceId) return null;

  try {
    const res = await fetch(`${getApiBase()}/payout`, {
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
        callback_url: callbackUrl || "",
        external_reference: reference,
      }),
    });

    if (!res.ok) {
      console.error("getMIpay payout failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const isSuccess = data.success === true || data.status === "success" || data.code === 200 || String(data.code) === "200";
    if (!isSuccess) {
      console.error("getMIpay payout error:", data.message || data.error, JSON.stringify(data));
      return null;
    }

    const txRef =
      data.data?.transaction_reference ||
      data.transaction_reference ||
      data.data?.reference ||
      data.reference ||
      null;
    if (!txRef) {
      console.error("getMIpay payout: no transaction reference in response", JSON.stringify(data));
      return null;
    }
    return { transactionReference: txRef };
  } catch (err) {
    console.error("getMIpay payout error:", err);
    return null;
  }
}

export async function checkPaymentStatus(reference: string): Promise<{ status: string; amount?: number; netAmount?: number } | null> {
  const authResult = await getAuthToken();
  if ("error" in authResult) { console.error("getMIpay checkStatus auth failed:", authResult.error); return null; }
  const token = authResult.token;

  try {
    const res = await fetch(`${getApiBase()}/payment/status/${reference}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      status: data.data?.status || data.status || "UNKNOWN",
      amount: data.data?.amount,
      netAmount: data.data?.net_amount,
    };
  } catch (err) {
    console.error("getMIpay status error:", err);
    return null;
  }
}
