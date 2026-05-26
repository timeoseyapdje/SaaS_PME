import { NextResponse } from "next/server";
import { getMiPayConfigStatus } from "@/lib/getmipay";

// Re-export internal for health check only
async function testAuth(): Promise<{ ok: boolean; error?: string }> {
  const publicKey = process.env.GETMIPAY_PUBLIC_KEY;
  const privateKey = process.env.GETMIPAY_PRIVATE_KEY;
  const base = process.env.GETMIPAY_BASE_URL || "https://api.getmipay.com";
  if (!publicKey || !privateKey) return { ok: false, error: "missing credentials" };
  try {
    const res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_apikey: publicKey, private_secretkey: privateKey }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    const data = JSON.parse(text);
    const token = data.access_token || data.token || data.data?.access_token || data.data?.token || null;
    if (!token) return { ok: false, error: `No token found in: ${JSON.stringify(data).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function GET() {
  const config = getMiPayConfigStatus();
  const auth = await testAuth();
  return NextResponse.json({
    config,
    auth,
    baseUrl: process.env.GETMIPAY_BASE_URL || "(not set — defaults to https://api.getmipay.com)",
  });
}
