import crypto from "crypto";

const NOTCHPAY_API = "https://api.notchpay.co";

export const NOTCHPAY_FEE_RATE = 0.025;

const MOBILE_CHANNELS: Record<string, "cm.mtn" | "cm.orange"> = {
  MTN_MONEY: "cm.mtn",
  ORANGE_MONEY: "cm.orange",
};

function formatCameroonPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("237")) return `+${digits}`;
  return `+237${digits}`;
}

export function isNotchPayConfigured() {
  return !!process.env.NOTCHPAY_PUBLIC_KEY;
}

export function calculateGrossAmount(netAmount: number): { grossAmount: number; feeAmount: number } {
  const grossAmount = Math.ceil(netAmount / (1 - NOTCHPAY_FEE_RATE));
  const feeAmount = grossAmount - netAmount;
  return { grossAmount, feeAmount };
}

export async function initializePayment({
  email,
  amount,
  currency = "XAF",
  reference,
  description,
  callbackUrl,
  phone,
}: {
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  description: string;
  callbackUrl: string;
  phone?: string;
}): Promise<{ checkoutUrl: string; reference: string } | null> {
  const key = process.env.NOTCHPAY_PUBLIC_KEY;
  if (!key) return null;

  const res = await fetch(`${NOTCHPAY_API}/payments/initialize`, {
    method: "POST",
    headers: {
      Authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, amount, currency, reference, description, callback: callbackUrl, phone }),
  });

  if (!res.ok) {
    console.error("NotchPay init failed:", await res.text());
    return null;
  }

  const data = await res.json();
  const authUrl = data.authorization_url || data.transaction?.authorization_url;
  if (!authUrl) {
    console.error("NotchPay init: no authorization_url in response", JSON.stringify(data));
    return null;
  }

  return { checkoutUrl: authUrl, reference: data.transaction?.reference ?? reference };
}

/**
 * Directly charge a mobile money wallet after initialization.
 * This pushes a payment request to the user's phone — no checkout page needed.
 */
export async function chargePayment({
  reference,
  phone,
  paymentMethod,
}: {
  reference: string;
  phone: string;
  paymentMethod: "MTN_MONEY" | "ORANGE_MONEY";
}): Promise<boolean> {
  const key = process.env.NOTCHPAY_PUBLIC_KEY;
  if (!key) return false;

  const channel = MOBILE_CHANNELS[paymentMethod];
  if (!channel) return false;

  const formattedPhone = formatCameroonPhone(phone);

  try {
    const res = await fetch(`${NOTCHPAY_API}/payments/${reference}/charge`, {
      method: "POST",
      headers: {
        Authorization: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        data: { phone: formattedPhone },
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("NotchPay direct charge failed:", text);
      return false;
    }

    const data = JSON.parse(text);
    const status = data.transaction?.status || data.status;
    return status === "pending" || status === "processing" || res.ok;
  } catch (err) {
    console.error("NotchPay charge error:", err);
    return false;
  }
}

export async function verifyPayment(reference: string): Promise<{ status: string; transaction?: { reference: string; status: string; amount: number } }> {
  const key = process.env.NOTCHPAY_PUBLIC_KEY;
  if (!key) return { status: "error" };

  const res = await fetch(`${NOTCHPAY_API}/payments/${reference}`, {
    method: "GET",
    headers: { Authorization: key },
  });

  if (!res.ok) return { status: "error" };
  return res.json();
}

export async function initiateTransfer({
  amount,
  currency = "XAF",
  phoneNumber,
  channel,
  description,
  reference,
}: {
  amount: number;
  currency?: string;
  phoneNumber: string;
  channel: "cm.mtn" | "cm.orange";
  description: string;
  reference: string;
}): Promise<{ reference: string } | null> {
  const key = process.env.NOTCHPAY_PRIVATE_KEY;
  if (!key) return null;

  const res = await fetch(`${NOTCHPAY_API}/transfers`, {
    method: "POST",
    headers: {
      Authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency, to: phoneNumber, channel, description, reference }),
  });

  if (!res.ok) {
    console.error("NotchPay transfer failed:", await res.text());
    return null;
  }

  const data = await res.json();
  return { reference: data.transfer?.reference ?? reference };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.NOTCHPAY_PRIVATE_KEY;
  if (!secret || !signature) return false;
  try {
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (expected.length !== signature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function generateReference(prefix: string = "NK"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
