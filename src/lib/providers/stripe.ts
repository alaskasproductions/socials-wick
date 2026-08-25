// Client for Stripe Checkout (https://docs.stripe.com/payments/checkout).
//
// Credentials are read from the admin-editable Setting table first (see
// /admin/settings), falling back to matching env vars so .env still works
// for a zero-UI setup.

import Stripe from "stripe";
import { headers } from "next/headers";
import { getSetting } from "@/lib/settings";

export class StripeError extends Error {}

async function getConfig() {
  const [enabled, secretKey, webhookSecret] = await Promise.all([
    getSetting("stripe.enabled", "STRIPE_ENABLED"),
    getSetting("stripe.secretKey", "STRIPE_SECRET_KEY"),
    getSetting("stripe.webhookSecret", "STRIPE_WEBHOOK_SECRET"),
  ]);

  return {
    enabled: enabled === "true" || enabled === "1",
    secretKey,
    webhookSecret,
  };
}

export async function isConfigured(): Promise<boolean> {
  const config = await getConfig();
  return Boolean(config.secretKey);
}

export async function isEnabled(): Promise<boolean> {
  const config = await getConfig();
  return config.enabled && Boolean(config.secretKey);
}

async function getClient(): Promise<Stripe> {
  const config = await getConfig();
  if (!config.secretKey) {
    throw new StripeError(
      "Stripe is not configured. Fill in the credentials under Admin → Settings → Payment Gateways."
    );
  }
  return new Stripe(config.secretKey);
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function createCheckoutSession(params: {
  amount: number; // major currency units, e.g. euros
  email: string;
  userId: string;
}): Promise<{ sessionId: string; url: string }> {
  const stripe = await getClient();
  const origin = await getOrigin();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.email,
    client_reference_id: params.userId,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: "Socials Wick — Add Funds" },
          unit_amount: Math.round(params.amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/dashboard/funds/stripe-callback?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/funds`,
  });

  if (!session.url) {
    throw new StripeError("Stripe did not return a checkout URL.");
  }

  return { sessionId: session.id, url: session.url };
}

export async function retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = await getClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function constructWebhookEvent(
  rawBody: string,
  signature: string
): Promise<Stripe.Event> {
  const config = await getConfig();
  if (!config.secretKey || !config.webhookSecret) {
    throw new StripeError("Stripe webhook secret is not configured.");
  }
  const stripe = new Stripe(config.secretKey);
  return stripe.webhooks.constructEvent(rawBody, signature, config.webhookSecret);
}
