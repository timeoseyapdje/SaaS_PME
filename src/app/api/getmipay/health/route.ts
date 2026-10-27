import { NextResponse } from "next/server";
import { getMiPayConfigStatus, getAuthToken, checkApiKeyStatus, getAvailableServices, getMerchantBalance, API_BASE } from "@/lib/getmipay";
import { requireSuperAdmin } from "@/lib/admin";

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const config = getMiPayConfigStatus();
  const auth = await getAuthToken();
  const authOk = !("error" in auth);

  const [apiKeyStatus, services, balance] = await Promise.all([
    checkApiKeyStatus(),
    authOk ? getAvailableServices() : null,
    authOk ? getMerchantBalance() : null,
  ]);

  return NextResponse.json({
    config,
    base: API_BASE,
    auth: { ok: authOk, error: "error" in auth ? auth.error : undefined },
    apiKey: apiKeyStatus,
    balance,
    services: services?.allServices || null,
  });
}
