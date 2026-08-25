// Client for Viva Wallet's Smart Checkout (https://developer.viva.com/apis-for-payments/)
// OAuth2 client-credentials auth + hosted checkout redirect flow.
//
// Credentials are read from the admin-editable Setting table first (see
// /admin/settings), falling back to matching env vars so .env still works
// for a zero-UI setup.

import { getSetting } from "@/lib/settings";

export class VivaError extends Error {}

async function getConfig() {
  const [enabled, env, clientId, clientSecret, sourceCode] = await Promise.all([
    getSetting("viva.enabled", "VIVA_ENABLED"),
    getSetting("viva.env", "VIVA_ENV"),
    getSetting("viva.clientId", "VIVA_CLIENT_ID"),
    getSetting("viva.clientSecret", "VIVA_CLIENT_SECRET"),
    getSetting("viva.sourceCode", "VIVA_SOURCE_CODE"),
  ]);

  const isProduction = env === "production";
  return {
    enabled: enabled === "true" || enabled === "1",
    clientId,
    clientSecret,
    sourceCode,
    accountsUrl: isProduction
      ? "https://accounts.vivapayments.com"
      : "https://demo-accounts.vivapayments.com",
    apiUrl: isProduction ? "https://api.vivapayments.com" : "https://demo-api.vivapayments.com",
    checkoutUrl: isProduction ? "https://www.vivapayments.com" : "https://demo.vivapayments.com",
  };
}

export async function isConfigured(): Promise<boolean> {
  const config = await getConfig();
  return Boolean(config.clientId && config.clientSecret);
}

export async function isEnabled(): Promise<boolean> {
  const config = await getConfig();
  return config.enabled && Boolean(config.clientId && config.clientSecret);
}

let cachedToken: { token: string; expiresAt: number; forClientId: string } | null = null;

async function getAccessToken(): Promise<{ token: string; apiUrl: string; checkoutUrl: string; sourceCode: string }> {
  const config = await getConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new VivaError(
      "Viva Wallet is not configured. Fill in the credentials under Admin → Settings → Payment Gateways."
    );
  }

  if (
    cachedToken &&
    cachedToken.forClientId === config.clientId &&
    cachedToken.expiresAt > Date.now() + 30_000
  ) {
    return { token: cachedToken.token, apiUrl: config.apiUrl, checkoutUrl: config.checkoutUrl, sourceCode: config.sourceCode };
  }

  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const res = await fetch(`${config.accountsUrl}/connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new VivaError(`Failed to authenticate with Viva Wallet (status ${res.status}).`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    forClientId: config.clientId,
  };
  return { token: cachedToken.token, apiUrl: config.apiUrl, checkoutUrl: config.checkoutUrl, sourceCode: config.sourceCode };
}

export async function createPaymentOrder(params: {
  amount: number; // major currency units, e.g. euros
  email: string;
  fullName: string;
  customerTrns: string;
  merchantTrns?: string;
}): Promise<{ orderCode: string; checkoutUrl: string }> {
  const { token, apiUrl, checkoutUrl, sourceCode } = await getAccessToken();

  const res = await fetch(`${apiUrl}/checkout/v2/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(params.amount * 100), // Viva expects the amount in cents
      customerTrns: params.customerTrns,
      merchantTrns: params.merchantTrns,
      sourceCode: sourceCode || undefined,
      customer: {
        email: params.email,
        fullName: params.fullName,
        requestLang: "en-GB",
      },
    }),
  });

  if (!res.ok) {
    throw new VivaError(`Failed to create Viva payment order (status ${res.status}).`);
  }

  const data = (await res.json()) as { orderCode: number | string };
  const orderCode = String(data.orderCode);
  return { orderCode, checkoutUrl: `${checkoutUrl}/web/checkout?ref=${orderCode}` };
}

export type VivaTransaction = {
  email: string;
  amount: number;
  orderCode: number;
  statusId: string; // F = Finished (paid), see Viva status codes
  fullName: string;
  transactionTypeId: number;
};

export async function retrieveTransaction(transactionId: string): Promise<VivaTransaction> {
  const { token, apiUrl } = await getAccessToken();
  const res = await fetch(`${apiUrl}/checkout/v2/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new VivaError(`Failed to retrieve Viva transaction (status ${res.status}).`);
  }
  return (await res.json()) as VivaTransaction;
}

// Echoed back on the GET verification handshake when registering the webhook
// URL in the Viva banking app (Settings > API Access > Webhooks).
export async function getWebhookVerificationKey(): Promise<string | undefined> {
  const key = await getSetting("viva.webhookVerificationKey", "VIVA_WEBHOOK_VERIFICATION_KEY");
  return key || undefined;
}
