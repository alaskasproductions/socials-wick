"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { setSettings } from "@/lib/settings";
import { alertText, getSmsBalance, getSmsConfig, normalisePhone, sendSms, SMS_EVENTS, type SmsEvent } from "@/lib/sms";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export type SmsState = { error?: string; success?: string } | undefined;

export async function saveSmsSettingsAction(_prev: SmsState, formData: FormData): Promise<SmsState> {
  await requireAdmin();

  const raw = String(formData.get("phones") ?? "");
  const entries = raw.split(/[,\n;]/).map((p) => p.trim()).filter(Boolean);
  const normalised: string[] = [];
  for (const entry of entries) {
    const phone = normalisePhone(entry);
    if (!phone) return { error: `"${entry}" is not a valid phone number. Use the country code, for example +357 99 123456.` };
    normalised.push(phone);
  }

  const apiUrl = String(formData.get("apiUrl") ?? "").trim() || "https://dash.smscy.com";
  if (!/^https?:\/\/[^\s]+$/i.test(apiUrl)) return { error: "The API address must start with https://" };

  const senderId = String(formData.get("senderId") ?? "").trim().slice(0, 11);
  const tokenInput = String(formData.get("token") ?? "").trim();
  const enabled = formData.get("enabled") === "on";

  const events = SMS_EVENTS.map((e) => e.key).filter((key) => formData.get(`event.${key}`) === "on");

  const values: Record<string, string> = {
    "sms.enabled": enabled ? "true" : "false",
    "sms.apiUrl": apiUrl,
    "sms.senderId": senderId,
    "sms.phones": normalised.join(", "),
    "sms.events": events.join(","),
  };
  if (tokenInput.toLowerCase() === "clear") values["sms.token"] = "";
  else if (tokenInput) values["sms.token"] = tokenInput;

  await setSettings(values);
  revalidatePath("/admin/settings/sms");

  if (enabled && !normalised.length) return { success: "Saved, but add at least one phone number to receive alerts." };
  return { success: "SMS settings saved." };
}

/** Sends a real message to the saved numbers so the admin can check the setup. */
export async function sendTestSmsAction(_prev: SmsState, _formData: FormData): Promise<SmsState> {
  await requireAdmin();
  const config = await getSmsConfig();
  if (!config.token) return { error: "Save your SMSCY API token first." };
  if (!config.phones.length) return { error: "Add at least one phone number first." };

  const text = alertText("SocialsWick test", "SMS alerts are working.");
  const failures: string[] = [];
  for (const phone of config.phones) {
    const result = await sendSms(config, phone, text);
    if (!result.ok) failures.push(`${phone}: ${result.error}`);
  }
  if (failures.length) return { error: `Could not send to ${failures.join("; ")}` };
  return { success: `Test message sent to ${config.phones.join(", ")}.` };
}

export async function checkSmsBalanceAction(_prev: SmsState, _formData: FormData): Promise<SmsState> {
  await requireAdmin();
  const config = await getSmsConfig();
  const result = await getSmsBalance(config);
  if (result.error) return { error: `Could not read the balance: ${result.error}` };
  return {
    success: `Remaining balance: ${result.balance ?? "unknown"}${result.expires ? ` (expires ${result.expires})` : ""}.`,
  };
}

export type { SmsEvent };
