"use server";

import { auth } from "@/lib/auth";
import { setSetting, setSettings } from "@/lib/settings";
import { revalidatePath } from "next/cache";
import * as mail from "@/lib/mail";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

export type ActionState = { error?: string; success?: string } | undefined;

// Secret fields use a "leave blank to keep the current value" convention so
// we never have to print an existing secret back into the HTML form.
function secretOrKeep(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value ? value : undefined;
}

export async function saveVivaSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const enabled = formData.get("enabled") === "on";
  const env = String(formData.get("env") ?? "demo");
  const sourceCode = String(formData.get("sourceCode") ?? "").trim();

  const clientId = secretOrKeep(formData, "clientId");
  const clientSecret = secretOrKeep(formData, "clientSecret");
  const webhookVerificationKey = secretOrKeep(formData, "webhookVerificationKey");

  await setSettings({
    "viva.enabled": enabled ? "true" : "false",
    "viva.env": env === "production" ? "production" : "demo",
    "viva.sourceCode": sourceCode,
    ...(clientId ? { "viva.clientId": clientId } : {}),
    ...(clientSecret ? { "viva.clientSecret": clientSecret } : {}),
    ...(webhookVerificationKey ? { "viva.webhookVerificationKey": webhookVerificationKey } : {}),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/funds");
  return { success: "Viva Wallet settings saved." };
}

export async function saveStripeSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const enabled = formData.get("enabled") === "on";
  const publishableKey = String(formData.get("publishableKey") ?? "").trim();

  const secretKey = secretOrKeep(formData, "secretKey");
  const webhookSecret = secretOrKeep(formData, "webhookSecret");

  await setSettings({
    "stripe.enabled": enabled ? "true" : "false",
    "stripe.publishableKey": publishableKey,
    ...(secretKey ? { "stripe.secretKey": secretKey } : {}),
    ...(webhookSecret ? { "stripe.webhookSecret": webhookSecret } : {}),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/funds");
  return { success: "Stripe settings saved." };
}

// Convenience for a single boolean/text field save, e.g. re-disabling a
// gateway without touching its credentials.
export async function saveSingleSettingAction(key: string, value: string): Promise<void> {
  await requireAdmin();
  await setSetting(key, value);
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/funds");
}

export async function saveEmailSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const host = String(formData.get("host") ?? "").trim();
  const port = String(formData.get("port") ?? "587").trim();
  const secure = formData.get("secure") === "on";
  const username = String(formData.get("username") ?? "").trim();
  const fromName = String(formData.get("fromName") ?? "").trim();
  const fromEmail = String(formData.get("fromEmail") ?? "").trim();
  const adminEmail = String(formData.get("adminEmail") ?? "").trim();

  const password = secretOrKeep(formData, "password");

  await setSettings({
    "smtp.host": host,
    "smtp.port": port,
    "smtp.secure": secure ? "true" : "false",
    "smtp.username": username,
    "smtp.fromName": fromName,
    "smtp.fromEmail": fromEmail,
    "smtp.adminEmail": adminEmail,
    ...(password ? { "smtp.password": password } : {}),
  });

  revalidatePath("/admin/settings");
  return { success: "Email settings saved." };
}

export async function sendTestEmailAction(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const to = await mail.getAdminEmail();
  if (!to) {
    return { error: "Set a From Email or Admin Notification Email first." };
  }

  try {
    await mail.sendMail({
      to,
      subject: "Test email from Socials Wick",
      html: "<p>This is a test email from your Socials Wick admin settings. If you're reading this, SMTP is working. 🎉</p>",
    });
  } catch (err) {
    return { error: err instanceof mail.MailError ? err.message : "Failed to send test email." };
  }

  return { success: `Test email sent to ${to}.` };
}

export async function saveMtpSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const apiUrl = String(formData.get("apiUrl") ?? "").trim();
  const apiKey = secretOrKeep(formData, "apiKey");

  await setSettings({
    "mtp.apiUrl": apiUrl,
    ...(apiKey ? { "mtp.apiKey": apiKey } : {}),
  });

  revalidatePath("/admin/provider");
  return { success: "MoreThanPanel settings saved." };
}

export async function saveSeoSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const siteUrl = String(formData.get("siteUrl") ?? "").trim().replace(/\/$/, "");
  const googleSiteVerification = String(formData.get("googleSiteVerification") ?? "").trim();
  const googleAnalyticsId = String(formData.get("googleAnalyticsId") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const businessAddress = String(formData.get("businessAddress") ?? "").trim();
  const businessCity = String(formData.get("businessCity") ?? "").trim();
  const businessPostalCode = String(formData.get("businessPostalCode") ?? "").trim();
  const businessPhone = String(formData.get("businessPhone") ?? "").trim();

  await setSettings({
    "seo.siteUrl": siteUrl,
    "seo.googleSiteVerification": googleSiteVerification,
    "seo.googleAnalyticsId": googleAnalyticsId,
    "seo.businessName": businessName,
    "seo.businessAddress": businessAddress,
    "seo.businessCity": businessCity,
    "seo.businessPostalCode": businessPostalCode,
    "seo.businessPhone": businessPhone,
  });

  revalidatePath("/", "layout");
  return { success: "SEO settings saved." };
}

export async function saveTawkToSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const enabled = formData.get("enabled") === "on";
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const widgetId = String(formData.get("widgetId") ?? "").trim() || "default";

  await setSettings({
    "tawkto.enabled": enabled ? "true" : "false",
    "tawkto.propertyId": propertyId,
    "tawkto.widgetId": widgetId,
  });

  revalidatePath("/", "layout");
  return { success: "Live chat settings saved." };
}
