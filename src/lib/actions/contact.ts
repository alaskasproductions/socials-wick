"use server";

import { headers } from "next/headers";
import * as mail from "@/lib/mail";
import { pushAdminNotification } from "@/lib/admin-notify";
import { verifyTurnstile } from "@/lib/turnstile";
import { COMPANY } from "@/lib/company";

export type ContactState = { error?: string; success?: string } | undefined;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

export async function contactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 150);
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
  const orderId = String(formData.get("orderId") ?? "").trim().slice(0, 60);

  if (!name || !email || !message) return { error: "Please fill in your name, email and message." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (message.length < 10) return { error: "Please tell us a little more so we can help (at least 10 characters)." };

  const captcha = await verifyTurnstile(formData);
  if (!captcha.ok) return { error: captcha.error };

  const h = await headers();
  const ip = (h.get("cf-connecting-ip") || h.get("x-forwarded-for") || "").split(",")[0].trim();
  const title = subject || "Contact form message";

  await pushAdminNotification({
    type: "SYSTEM",
    title: `Support message from ${name}`,
    body: `${title}${orderId ? ` (order ${orderId})` : ""} - ${email}: ${message.slice(0, 300)}`,
    href: "/admin/notifications",
  });

  try {
    if (await mail.isConfigured()) {
      const to = await mail.getAdminEmail();
      await mail.sendMail({
        to: to || COMPANY.supportEmail,
        subject: `[Contact] ${title} - ${name}`,
        html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
${orderId ? `<p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>` : ""}
<p><strong>Subject:</strong> ${escapeHtml(title)}</p>
<p style="white-space:pre-wrap">${escapeHtml(message)}</p>
<p style="color:#888;font-size:12px">IP: ${escapeHtml(ip || "unknown")}</p>`,
      });
    }
  } catch (err) {
    console.error("[contact] mail failed:", err instanceof Error ? err.message : err);
  }

  return { success: "Thanks! Your message has been received. We usually reply within 24 hours." };
}
