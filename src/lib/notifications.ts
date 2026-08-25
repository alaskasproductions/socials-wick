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
