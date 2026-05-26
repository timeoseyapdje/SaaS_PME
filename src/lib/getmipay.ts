const GETMIPAY_API = process.env.GETMIPAY_BASE_URL || "https://api.getmipay.com";

export const GETMIPAY_FEE_RATE = 0.015;

const SERVICE_IDS: Record<"MTN_MONEY" | "ORANGE_MONEY", string> = {
  MTN_MONEY: process.env.GETMIPAY_MTN_SERVICE_ID || "",
  ORANGE_MONEY: process.env.GETMIPAY_ORANGE_SERVICE_ID || "",
};

export function isGetMiPayConfigured(): boolean {
  return !!(process.env.GETMIPAY_PUBLIC_KEY && process.env.GETMIPAY_PRIVATE_KEY);
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

async function getAuthToken(): Promise<string | null> {
  const publicKey = process.env.GETMIPAY_PUBLIC_KEY;
  const privateKey = process.env.GETMIPAY_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;

  try {
    const res = await fetch(`${GETMIPAY_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_apikey: publicKey, private_secretkey: privateKey }),
    });
    if (!res.ok) {
      console.error("getMIpay auth failed:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.access_token || data.token || null;
  } catch (err) {
    console.error("getMIpay auth error:", err);
    return null;
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
}): Promise<{ transactionReference: string } | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const serviceId = SERVICE_IDS[paymentMethod];
  if (!serviceId) {
    console.error("getMIpay: service ID not configured for", paymentMethod);
    return null;
  }

  try {
    const res = await fetch(`${GETMIPAY_API}/payment/payin`, {
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

    if (!res.ok) {
      console.error("getMIpay payin failed:", await res.text());
      return null;
    }

    const data = await res.json();
    if (!data.success) {
      console.error("getMIpay payin error:", data.message);
      return null;
    }

    return { transactionReference: data.data?.transaction_reference };
  } catch (err) {
    console.error("getMIpay payin error:", err);
    return null;
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
  const token = await getAuthToken();
  if (!token) return null;

  const serviceId = SERVICE_IDS[paymentMethod];
  if (!serviceId) return null;

  try {
    const res = await fetch(`${GETMIPAY_API}/payout`, {
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
      console.error("getMIpay payout failed:", await res.text());
      return null;
    }

    const data = await res.json();
    if (!data.success) {
      console.error("getMIpay payout error:", data.message);
      return null;
    }

    return { transactionReference: data.data?.transaction_reference };
  } catch (err) {
    console.error("getMIpay payout error:", err);
    return null;
  }
}

export async function checkPaymentStatus(reference: string): Promise<{ status: string; amount?: number; netAmount?: number } | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${GETMIPAY_API}/payment/status/${reference}`, {
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
