import { NextResponse } from "next/server";
import { getMiPayConfigStatus } from "@/lib/getmipay";

const CANDIDATE_AUTH_PATHS = [
  "/api/authenticate",
  "/api/action/auth",
  "/api/auth/login",
  "/api/v1/authenticate",
  "/api/v1/auth/login",
  "/authenticate",
  "/auth/login",
];

async function probeAuth(base: string, publicKey: string, privateKey: string) {
  const body = JSON.stringify({ public_apikey: publicKey, private_secretkey: privateKey });
  const results: Record<string, string> = {};

  for (const path of CANDIDATE_AUTH_PATHS) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const text = await res.text();
      if (res.ok) {
        const data = JSON.parse(text);
        const token = data.access_token || data.token || data.data?.access_token || data.data?.token;
        results[path] = token ? `✅ OK — token found` : `⚠️ HTTP 200 but no token: ${text.slice(0, 150)}`;
      } else {
        results[path] = `❌ HTTP ${res.status}`;
      }
    } catch (e) {
      results[path] = `💥 error: ${String(e).slice(0, 100)}`;
    }
  }
  return results;
}

export async function GET() {
  const config = getMiPayConfigStatus();
  const base = process.env.GETMIPAY_BASE_URL || "https://api.getmipay.com";
  const publicKey = process.env.GETMIPAY_PUBLIC_KEY || "";
  const privateKey = process.env.GETMIPAY_PRIVATE_KEY || "";

  const probe = await probeAuth(base, publicKey, privateKey);

  return NextResponse.json({ config, base, probe });
}
