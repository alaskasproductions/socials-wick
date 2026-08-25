// Client for the MoreThanPanel reseller API (https://morethanpanel.com/api)
// Standard SMM-panel protocol: POST form-encoded requests to a single endpoint,
// with an `action` field selecting the operation.
//
// Credentials are read from the admin-editable Setting table first (see
// /admin/provider), falling back to matching env vars so .env still works
// for a zero-UI setup.

import { getSetting } from "@/lib/settings";

export class ProviderError extends Error {}

async function getConfig() {
  const [apiUrl, apiKey] = await Promise.all([
    getSetting("mtp.apiUrl", "MTP_API_URL"),
    getSetting("mtp.apiKey", "MTP_API_KEY"),
  ]);
  return {
    apiUrl: apiUrl || "https://morethanpanel.com/api/v2",
    apiKey,
  };
}

export async function isConfigured(): Promise<boolean> {
  const config = await getConfig();
  return Boolean(config.apiKey);
}

async function call<T>(params: Record<string, string | number>): Promise<T> {
  const { apiUrl, apiKey } = await getConfig();
  if (!apiKey) {
    throw new ProviderError(
      "MoreThanPanel is not configured. Add your API key under Admin → Provider (MTP)."
    );
  }

  const body = new URLSearchParams({ key: apiKey });
  for (const [k, v] of Object.entries(params)) body.set(k, String(v));

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new ProviderError(`Provider request failed with status ${res.status}`);
  }

  const data = (await res.json()) as unknown;
  if (data && typeof data === "object" && "error" in data) {
    throw new ProviderError(String((data as { error: unknown }).error));
  }

  return data as T;
}

export type ProviderService = {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
};

export function getServices() {
  return call<ProviderService[]>({ action: "services" });
}

export function addOrder(params: {
  serviceId: string;
  link: string;
  quantity: number;
}) {
  return call<{ order: number }>({
    action: "add",
    service: params.serviceId,
    link: params.link,
    quantity: params.quantity,
  });
}

export type ProviderOrderStatus = {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
};

export function getStatus(orderId: string) {
  return call<ProviderOrderStatus>({ action: "status", order: orderId });
}

export function getMultiStatus(orderIds: string[]) {
  return call<Record<string, ProviderOrderStatus | { error: string }>>({
    action: "status",
    orders: orderIds.join(","),
  });
}

export function refill(orderId: string) {
  return call<{ refill: string }>({ action: "refill", order: orderId });
}

export function cancelOrders(orderIds: string[]) {
  return call<Array<{ order: number; cancel: number | { error: string } }>>({
    action: "cancel",
    orders: orderIds.join(","),
  });
}

export function getBalance() {
  return call<{ balance: string; currency: string }>({ action: "balance" });
}

// Maps MoreThanPanel's status strings to our local OrderStatus enum values.
export function mapProviderStatus(
  status: string
): "PENDING" | "IN_PROGRESS" | "COMPLETED" | "PARTIAL" | "CANCELLED" {
  const s = status.toLowerCase();
  if (s === "completed") return "COMPLETED";
  if (s === "partial") return "PARTIAL";
  if (s === "canceled" || s === "cancelled") return "CANCELLED";
  if (s === "in progress" || s === "processing") return "IN_PROGRESS";
  return "PENDING";
}
