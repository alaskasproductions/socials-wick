// SMTP mail sender, configured from Admin -> Settings -> Email (stored in
// the Setting table), falling back to env vars for a zero-UI setup.

import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";

export class MailError extends Error {}

async function getConfig() {
  const s = await getSettings([
    "smtp.host",
    "smtp.port",
    "smtp.secure",
    "smtp.username",
    "smtp.password",
    "smtp.fromName",
    "smtp.fromEmail",
    "smtp.adminEmail",
  ]);

  return {
    host: s["smtp.host"] || process.env.SMTP_HOST || "",
    port: Number(s["smtp.port"] || process.env.SMTP_PORT || 587),
    secure: (s["smtp.secure"] || process.env.SMTP_SECURE) === "true",
    username: s["smtp.username"] || process.env.SMTP_USERNAME || "",
    password: s["smtp.password"] || process.env.SMTP_PASSWORD || "",
    fromName: s["smtp.fromName"] || process.env.SMTP_FROM_NAME || "Socials Wick",
    fromEmail: s["smtp.fromEmail"] || process.env.SMTP_FROM_EMAIL || "",
    adminEmail: s["smtp.adminEmail"] || process.env.SMTP_ADMIN_EMAIL || "",
  };
}

export async function isConfigured(): Promise<boolean> {
  const config = await getConfig();
  return Boolean(config.host && config.username && config.password && config.fromEmail);
}

export async function getAdminEmail(): Promise<string> {
  const config = await getConfig();
  return config.adminEmail || config.fromEmail;
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const config = await getConfig();
  if (!config.host || !config.username || !config.password || !config.fromEmail) {
    throw new MailError(
      "SMTP is not configured. Fill in the details under Admin → Settings → Email."
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.username, pass: config.password },
  });

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
