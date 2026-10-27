// Transactional/notification emails, built on top of the SMTP client in
// mail.ts. Every function here swallows its own send errors — a missing or
// misconfigured mailer must never break the order/payment flow that
// triggered the notification.

import { headers } from "next/headers";
import * as mail from "@/lib/mail";

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function safeSend(params: { to: string; subject: string; html: string }): Promise<void> {
  try {
    await mail.sendMail(params);
  } catch (err) {
    console.error(
      "[notifications] failed to send email:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function notifyAdminNewOrder(params: {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  quantity: number;
  charge: number;
  link: string;
}): Promise<void> {
  const adminEmail = await mail.getAdminEmail();
  if (!adminEmail) return;

  const origin = await getOrigin();
  await safeSend({
    to: adminEmail,
    subject: `New order — ${params.serviceName}`,
    html: `
      <p>A new order was placed on Socials Wick.</p>
      <ul>
        <li><strong>Customer:</strong> ${params.customerName} (${params.customerEmail})</li>
        <li><strong>Service:</strong> ${params.serviceName}</li>
        <li><strong>Quantity:</strong> ${params.quantity}</li>
        <li><strong>Charge:</strong> €${params.charge.toFixed(2)}</li>
        <li><strong>Link:</strong> ${params.link}</li>
      </ul>
      <p><a href="${origin}/admin/orders">View in Admin Orders →</a></p>
    `,
  });
}

export async function notifyCustomerOrderConfirmation(params: {
  customerEmail: string;
  customerName: string;
  serviceName: string;
  quantity: number;
  charge: number;
}): Promise<void> {
  const origin = await getOrigin();
  await safeSend({
    to: params.customerEmail,
    subject: "Your order has been placed",
    html: `
      <p>Hi ${params.customerName},</p>
      <p>Your order has been placed and is now being processed:</p>
      <ul>
        <li><strong>Service:</strong> ${params.serviceName}</li>
        <li><strong>Quantity:</strong> ${params.quantity}</li>
        <li><strong>Charge:</strong> €${params.charge.toFixed(2)}</li>
      </ul>
      <p><a href="${origin}/dashboard/orders">Track your order →</a></p>
    `,
  });
}

export async function notifyAdminNewFundRequest(params: {
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
}): Promise<void> {
  const adminEmail = await mail.getAdminEmail();
  if (!adminEmail) return;

  const origin = await getOrigin();
  await safeSend({
    to: adminEmail,
    subject: `Fund request awaiting review — €${params.amount.toFixed(2)}`,
    html: `
      <p>A customer submitted a fund request that needs manual review.</p>
      <ul>
        <li><strong>Customer:</strong> ${params.customerName} (${params.customerEmail})</li>
        <li><strong>Amount:</strong> €${params.amount.toFixed(2)}</li>
        <li><strong>Method:</strong> ${params.method}</li>
      </ul>
      <p><a href="${origin}/admin/funds">Review in Admin →</a></p>
    `,
  });
}

export async function notifyCustomerPaymentReceipt(params: {
  customerEmail: string;
  customerName: string;
  amount: number;
  method: string;
}): Promise<void> {
  const origin = await getOrigin();
  await safeSend({
    to: params.customerEmail,
    subject: `Payment received — €${params.amount.toFixed(2)}`,
    html: `
      <p>Hi ${params.customerName},</p>
      <p>We've received your payment of <strong>€${params.amount.toFixed(2)}</strong> via ${params.method}, and it's been added to your balance.</p>
      <p><a href="${origin}/dashboard">Go to your dashboard →</a></p>
    `,
  });
}

export async function notifyCustomerFundRequestReviewed(params: {
  customerEmail: string;
  customerName: string;
  amount: number;
  approved: boolean;
}): Promise<void> {
  const origin = await getOrigin();
  await safeSend({
    to: params.customerEmail,
    subject: params.approved
      ? `Fund request approved — €${params.amount.toFixed(2)}`
      : "Fund request declined",
    html: params.approved
      ? `
        <p>Hi ${params.customerName},</p>
        <p>Your fund request for <strong>€${params.amount.toFixed(2)}</strong> has been approved and added to your balance.</p>
        <p><a href="${origin}/dashboard">Go to your dashboard →</a></p>
      `
      : `
        <p>Hi ${params.customerName},</p>
        <p>Your fund request for €${params.amount.toFixed(2)} could not be approved. Contact support if you have questions.</p>
      `,
  });
}

/**
 * Money back for an order the provider could not deliver. Sent from the
 * background sync as well as from the admin panel, so the site address comes
 * from the SEO settings rather than the request headers.
 */
export async function notifyCustomerOrderRefunded(params: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  serviceName: string;
  status: string;
  quantity: number;
  delivered: number;
  amount: number;
  balance: number;
}): Promise<void> {
  const { getSiteUrl } = await import("@/lib/seo-settings");
  const siteUrl = await getSiteUrl();
  const cancelled = params.status === "CANCELLED";
  const headline = cancelled
    ? "Your order could not be delivered, so we have refunded it."
    : "Part of your order could not be delivered, so we have refunded that part.";

  await safeSend({
    to: params.customerEmail,
    subject: cancelled
      ? `Order cancelled and refunded — €${params.amount.toFixed(2)}`
      : `Order partly delivered, €${params.amount.toFixed(2)} refunded`,
    html: `
      <p>Hi ${params.customerName},</p>
      <p>${headline}</p>
      <ul>
        <li><strong>Order:</strong> ${params.orderId.slice(0, 8)}</li>
        <li><strong>Service:</strong> ${params.serviceName}</li>
        <li><strong>Ordered:</strong> ${params.quantity.toLocaleString("en-GB")}</li>
        ${cancelled ? "" : `<li><strong>Delivered:</strong> ${params.delivered.toLocaleString("en-GB")}</li>`}
        <li><strong>Refunded to your balance:</strong> €${params.amount.toFixed(2)}</li>
        <li><strong>New balance:</strong> €${params.balance.toFixed(2)}</li>
      </ul>
      <p>The money is back in your SocialsWick balance and can be spent on any service right away.</p>
      <p><a href="${siteUrl}/dashboard/orders/${params.orderId}">See the order →</a></p>
      <p>A common reason for a cancellation is a link the service cannot accept, for example a profile
      link where a post link is needed. The order page shows which link that service expects.</p>
      <p>Questions? Just reply to this email or use <a href="${siteUrl}/contact">our contact page</a>.</p>
    `,
  });
}

/** How to pay for a manual top-up (bank transfer, PayPal, crypto …). */
export async function notifyCustomerPaymentInstructions(params: {
  customerEmail: string;
  customerName: string;
  amount: number;
  method: { label: string; lines: { label: string; value: string }[]; notes: string; needsReference: boolean };
  reference: string;
}): Promise<void> {
  const { getSiteUrl } = await import("@/lib/seo-settings");
  const siteUrl = await getSiteUrl();
  const rows = [
    `<li><strong>Amount:</strong> €${params.amount.toFixed(2)}</li>`,
    ...params.method.lines.map((l) => `<li><strong>${l.label}:</strong> ${l.value}</li>`),
    ...(params.method.needsReference
      ? [`<li><strong>Payment reference:</strong> <code>${params.reference}</code></li>`]
      : []),
  ].join("");

  await safeSend({
    to: params.customerEmail,
    subject: `How to pay €${params.amount.toFixed(2)} — reference ${params.reference}`,
    html: `
      <p>Hi ${params.customerName},</p>
      <p>Here is how to send your ${params.method.label.toLowerCase()} payment.</p>
      <ul>${rows}</ul>
      ${params.method.notes ? `<p style="white-space:pre-line">${params.method.notes}</p>` : ""}
      ${
        params.method.needsReference
          ? "<p><strong>Please put the payment reference in the transfer description.</strong> It is how we match your payment to your account.</p>"
          : ""
      }
      <p>Transfers usually take 1 to 3 working days to reach us, depending on your bank. Your balance is
      credited as soon as the money arrives, and you will get another email then. If you need the funds
      straight away, you can pay by card instead, which is credited within seconds.</p>
      <p><a href="${siteUrl}/dashboard/funds">See your top-up requests →</a></p>
    `,
  });
}
