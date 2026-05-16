import crypto from "crypto";

const NOTCHPAY_API = "https://api.notchpay.co";

// NotchPay collection fee: 2.5%
// Gross-up formula: client pays grossAmount so that after fees company receives netAmount exactly
export const NOTCHPAY_FEE_RATE = 0.025;

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
}: {
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  description: string;
  callbackUrl: string;
}): Promise<{ checkoutUrl: string; reference: string } | null> {
  const key = process.env.NOTCHPAY_PUBLIC_KEY;
  if (!key) return null;

  const res = await fetch(`${NOTCHPAY_API}/payments/initialize`, {
    method: "POST",
    headers: {
      Authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, amount, currency, reference, description, callback: callbackUrl }),
  });

  if (!res.ok) {
    console.error("NotchPay init failed:", await res.text());
    return null;
  }

  const data = await res.json();
  const tx = data.transaction;
  if (!tx?.authorization_url) return null;

  return { checkoutUrl: tx.authorization_url, reference: tx.reference ?? reference };
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
  if (!secret) return true; // skip verification if not configured
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
