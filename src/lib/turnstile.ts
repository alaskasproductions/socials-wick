import { headers } from "next/headers";
import { getSettings } from "@/lib/settings";

// Cloudflare Turnstile — bot protection on the login, register and
// password-reset forms. Keys are set in Admin → Settings → Security; the
// widget only renders (and tokens are only required) when both keys exist.

export const TURNSTILE_FIELD = "cf-turnstile-response";

export async function getTurnstileConfig(): Promise<{ siteKey: string; secretKey: string; enabled: boolean }> {
  const s = await getSettings(["security.turnstileSiteKey", "security.turnstileSecretKey"]);
  const siteKey = s["security.turnstileSiteKey"] || process.env.TURNSTILE_SITE_KEY || "";
  const secretKey = s["security.turnstileSecretKey"] || process.env.TURNSTILE_SECRET_KEY || "";
  return { siteKey, secretKey, enabled: Boolean(siteKey && secretKey) };
}

export type TurnstileResult = { ok: true } | { ok: false; error: string };

/**
 * Verifies the token a form submitted. Returns ok when Turnstile is not
 * configured, so enabling/disabling it never needs a code change.
 */
export async function verifyTurnstile(formData: FormData): Promise<TurnstileResult> {
  const { secretKey, enabled } = await getTurnstileConfig();
  if (!enabled) return { ok: true };

  const token = String(formData.get(TURNSTILE_FIELD) ?? "").trim();
  if (!token) return { ok: false, error: "Please complete the security check and try again." };

  const h = await headers();
  const ip = (h.get("cf-connecting-ip") || h.get("x-forwarded-for") || "").split(",")[0].trim();

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token, ...(ip ? { remoteip: ip } : {}) }),
      cache: "no-store",
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (data.success) return { ok: true };
    const codes = data["error-codes"] ?? [];
    if (codes.includes("timeout-or-duplicate")) {
      return { ok: false, error: "The security check expired. Please try again." };
    }
    return { ok: false, error: "Security check failed. Please try again." };
  } catch {
    // Cloudflare unreachable: don't lock everyone out, but log it.
    console.error("[turnstile] siteverify request failed");
    return { ok: true };
  }
}
