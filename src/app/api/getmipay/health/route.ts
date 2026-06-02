import { NextResponse } from "next/server";
import { getMiPayConfigStatus, getAuthToken, checkApiKeyStatus, getAvailableServices, getMerchantBalance } from "@/lib/getmipay";

export async function GET() {
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
    base: "https://getmipay.com/api/v1",
    auth: { ok: authOk, error: "error" in auth ? auth.error : undefined },
    apiKey: apiKeyStatus,
    balance,
    services: services?.allServices || null,
  });
}
