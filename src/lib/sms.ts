import { getSettings } from "@/lib/settings";

// SMS alerts through SMSCY (the Ultimate SMS v3 API on dash.smscy.com), the
// same service the Ubucy shop uses.
//
// Configured in Admin → Settings → SMS. Nothing here throws: an SMS must never
// break an order, so every failure is logged and swallowed.

export type SmsEvent = "ORDER" | "ORDER_FAILED" | "ORDER_STATUS" | "PAYMENT" | "FUND_REQUEST" | "USER" | "SYSTEM";

export const SMS_EVENTS: { key: SmsEvent; label: string; hint: string }[] = [
  { key: "ORDER", label: "New order", hint: "A customer placed an order." },
  { key: "PAYMENT", label: "Payment received", hint: "A card payment was confirmed." },
  { key: "ORDER_FAILED", label: "Order needs attention", hint: "An order could not be sent to the provider." },
  { key: "ORDER_STATUS", label: "Order completed or cancelled", hint: "The provider finished or cancelled an order." },
  { key: "FUND_REQUEST", label: "Manual top-up request", hint: "A customer asked to add funds by bank transfer or similar." },
  { key: "USER", label: "New customer", hint: "Someone registered or checked out as a guest." },
];

const DEFAULT_EVENTS: SmsEvent[] = ["ORDER", "ORDER_FAILED", "FUND_REQUEST"];

export type SmsConfig = {
  enabled: boolean;
  apiUrl: string;
  senderId: string;
  token: string;
  /** Where the alerts go. */
  phones: string[];
  events: SmsEvent[];
  configured: boolean;
};

const KEYS = ["sms.enabled", "sms.apiUrl", "sms.senderId", "sms.token", "sms.phones", "sms.events"];

export async function getSmsConfig(): Promise<SmsConfig> {
  const s = await getSettings(KEYS);
  const token = s["sms.token"] || process.env.SMSCY_TOKEN || "";
  const phones = (s["sms.phones"] ?? "")
    .split(/[,\n;]/)
    .map((p) => normalisePhone(p))
    .filter((p): p is string => Boolean(p));
  const events = (s["sms.events"] ?? "").trim()
    ? (s["sms.events"].split(",").filter(Boolean) as SmsEvent[])
    : DEFAULT_EVENTS;

  return {
    enabled: s["sms.enabled"] === "true",
    apiUrl: s["sms.apiUrl"] || "https://dash.smscy.com",
    senderId: s["sms.senderId"] || "SocialsWick",
    token,
    phones,
    events,
    configured: Boolean(token && phones.length),
  };
}

/** "99 123456", "+357 99123456", "0035799123456" → "35799123456". Cyprus numbers may come without the country code. */
export function normalisePhone(raw: string): string | null {
  let d = raw.trim().replace(/[^\d+]/g, "");
  if (!d) return null;
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (/^[29]\d{7}$/.test(d)) d = `357${d}`; // bare Cyprus mobile/landline
  d = d.replace(/\D/g, "");
  return /^\d{8,15}$/.test(d) ? d : null;
}

// GSM 03.38: anything outside it (Greek, emoji, …) must be sent as unicode.
const GSM = new Set([
  ...'@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà^{}\\[~]|€\f',
]);

export const smsType = (text: string): "plain" | "unicode" =>
  [...text].every((c) => GSM.has(c)) ? "plain" : "unicode";

export type SmsResult = { ok: boolean; error?: string };

/** One message to one number. Never throws. */
export async function sendSms(config: SmsConfig, to: string, text: string): Promise<SmsResult> {
  if (!config.token) return { ok: false, error: "No SMSCY API token saved." };
  const base = config.apiUrl.replace(/\/+$/, "").replace(/\/api\/v\d+$/, "");
  try {
    const res = await fetch(`${base}/api/v3/sms/send`, {
      method: "POST",
      signal: AbortSignal.timeout(20_000),
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: to,
        sender_id: config.senderId,
        type: smsType(text),
        message: text,
      }),
      cache: "no-store",
    });
    if (res.status === 401) return { ok: false, error: "SMSCY refused the API token." };
    const data = (await res.json().catch(() => null)) as
      | { status?: string; message?: string; errors?: Record<string, string[]> }
      | null;
    if (res.ok && data?.status === "success") return { ok: true };
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    return { ok: false, error: (firstError || data?.message || `HTTP ${res.status}`).slice(0, 300) };
  } catch (err) {
    return { ok: false, error: (err as Error).message.slice(0, 300) };
  }
}

/** Remaining SMS credit on the account, for the settings page. */
export async function getSmsBalance(config: SmsConfig): Promise<{ balance?: string; expires?: string; error?: string }> {
  if (!config.token) return { error: "No SMSCY API token saved." };
  const base = config.apiUrl.replace(/\/+$/, "").replace(/\/api\/v\d+$/, "");
  try {
    const res = await fetch(`${base}/api/v3/balance`, {
      signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${config.token}`, Accept: "application/json" },
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as
      | { data?: { remaining_balance?: string | number; expired_on?: string }; message?: string }
      | null;
    if (!res.ok) return { error: data?.message || `HTTP ${res.status}` };
    return {
      balance: data?.data?.remaining_balance != null ? String(data.data.remaining_balance) : undefined,
      expires: data?.data?.expired_on,
    };
  } catch (err) {
    return { error: (err as Error).message.slice(0, 200) };
  }
}

// Typographic characters cost money: one of them turns the whole message into
// a unicode SMS (70 characters per part instead of 160).
const GSM_SAFE: Record<string, string> = {
  "—": "-", "–": "-", "·": "-", "•": "-",
  "…": "...", "‘": "'", "’": "'", "“": '"', "”": '"',
  " ": " ", "→": ">", "×": "x",
};

export function gsmSafe(text: string): string {
  return text.replace(/[—–·•…‘’“” →×]/g, (c) => GSM_SAFE[c] ?? c);
}

/** Text for an admin alert; SMS is charged per 160 characters, so keep it tight. */
export function alertText(title: string, body?: string): string {
  const clean = gsmSafe(body ? `${title} - ${body}` : title).replace(/\s+/g, " ").trim();
  return clean.length > 300 ? `${clean.slice(0, 297)}...` : clean;
}

/**
 * Sends one admin alert to every configured number. Called from
 * pushAdminNotification, so it covers every event in the notification centre.
 */
export async function notifyAdminBySms(event: SmsEvent, title: string, body?: string): Promise<void> {
  try {
    const config = await getSmsConfig();
    if (!config.enabled || !config.configured || !config.events.includes(event)) return;
    const text = alertText(title, body);
    for (const phone of config.phones) {
      const result = await sendSms(config, phone, text);
      if (!result.ok) console.error(`[sms] ${event} to ${phone} failed: ${result.error}`);
    }
  } catch (err) {
    console.error("[sms] alert failed:", err instanceof Error ? err.message : err);
  }
}
