import { NextResponse } from "next/server";
import { getMiPayConfigStatus } from "@/lib/getmipay";

async function testAuth(): Promise<{ ok: boolean; token?: string; error?: string }> {
  const publicKey = process.env.GETMIPAY_PUBLIC_KEY;
  const privateKey = process.env.GETMIPAY_PRIVATE_KEY;
  const base = process.env.GETMIPAY_BASE_URL || "https://api.getmipay.com";
  if (!publicKey || !privateKey) return { ok: false, error: "missing credentials" };
  try {
    const res = await fetch(`${base}/api/action/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_apikey: publicKey, private_secretkey: privateKey }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
    const data = JSON.parse(text);
    const token = data.access_token || data.token || data.data?.access_token || data.data?.token || null;
    if (!token) return { ok: false, error: `No token found in: ${JSON.stringify(data).slice(0, 300)}` };
    return { ok: true, token };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function fetchMe(token: string) {
  const base = process.env.GETMIPAY_BASE_URL || "https://api.getmipay.com";
  try {
    const res = await fetch(`${base}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return await res.json();
  } catch (e) {
    return { error: String(e) };
  }
}

async function fetchServices(token: string) {
  const base = process.env.GETMIPAY_BASE_URL || "https://api.getmipay.com";
  try {
    const res = await fetch(`${base}/api/services`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return await res.json();
  } catch (e) {
    return { error: String(e) };
  }
}

export async function GET() {
  const config = getMiPayConfigStatus();
  const base = process.env.GETMIPAY_BASE_URL || "https://api.getmipay.com";
  const auth = await testAuth();
  const me = auth.ok && auth.token ? await fetchMe(auth.token) : null;
  const services = auth.ok && auth.token ? await fetchServices(auth.token) : null;
  return NextResponse.json({
    config,
    base,
    auth: { ok: auth.ok, error: auth.error },
    me,
    services,
  });
}
