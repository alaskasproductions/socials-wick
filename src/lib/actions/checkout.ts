"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as mail from "@/lib/mail";
import * as viva from "@/lib/providers/viva";
import { OrderError, orderCharge, placeOrder } from "@/lib/orders";
import { displayName } from "@/lib/catalog";
import { MIN_ORDER_EUR } from "@/lib/packages";

export type CheckoutInput = {
  serviceId: string;
  quantity: number;
  link: string;
  email?: string; // required when not signed in
  acceptTerms?: boolean; // required when creating a guest account
};

export type CheckoutResult =
  | { status: "placed"; orderId: string; charge: number }
  | { status: "redirect"; url: string; charge: number }
  | { status: "error"; error: string };

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Existing account, or a fresh guest account that gets a "set your password" email. */
async function findOrCreateGuestUser(email: string, origin: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.status === "BANNED") throw new OrderError("This account is suspended.");
    return existing;
  }

  const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Customer";
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CUSTOMER",
      balance: 0,
      // The only way into this account is the password link sent to this
      // address, so the email is effectively verified once they use it.
      emailVerifiedAt: new Date(),
      termsAcceptedAt: new Date(),
      passwordResetTokens: {
        create: { tokenHash, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
    },
  });

  const setPasswordUrl = `${origin}/reset-password?token=${rawToken}`;
  try {
    await mail.sendMail({
      to: email,
      subject: "Your Socials Wick account",
      html: `<p>Hi ${user.name},</p><p>We created a Socials Wick account for you so you can track your order. Set a password with the link below (valid for 7 days) to log in any time:</p><p><a href="${setPasswordUrl}">${setPasswordUrl}</a></p><p>Order confirmations and receipts will be sent to this address.</p>`,
    });
  } catch {
    // Not fatal — they can use "Forgot password" later.
  }
  return user;
}

/**
 * Storefront checkout. Signed-in users with enough balance get the order
 * placed immediately; everyone else is sent to Viva to pay the outstanding
 * amount, and the order is placed automatically when the payment confirms.
 */
export async function startCheckoutAction(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const quantity = Math.floor(Number(input.quantity));
    const link = String(input.link ?? "").trim();
    if (!input.serviceId || !link || !Number.isFinite(quantity) || quantity <= 0) {
      return { status: "error", error: "Please choose a service, quantity and link." };
    }
    if (!/^https?:\/\/\S+$/i.test(link)) {
      return { status: "error", error: "Enter a valid profile or post link." };
    }

    const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
    if (!service || !service.active) return { status: "error", error: "Service not found." };
    if (quantity < service.min || quantity > service.max) {
      return { status: "error", error: `Quantity must be between ${service.min} and ${service.max}.` };
    }

    const origin = await getOrigin();
    const session = await auth();
    let user;
    if (session?.user?.id) {
      user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user) return { status: "error", error: "Please sign in again." };
    } else {
      const email = String(input.email ?? "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { status: "error", error: "Enter a valid email address." };
      }
      const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (!exists && !input.acceptTerms) {
        return { status: "error", error: "Please accept the Terms, Privacy and Refund Policy." };
      }
      user = await findOrCreateGuestUser(email, origin);
    }

    const charge = orderCharge(service.rate, quantity);
    if (charge < MIN_ORDER_EUR) {
      return { status: "error", error: `The minimum order is €${MIN_ORDER_EUR.toFixed(2)}.` };
    }

    if (user.balance >= charge) {
      const placed = await placeOrder({ userId: user.id, serviceId: service.id, quantity, link });
      return { status: "placed", orderId: placed.orderId, charge: placed.charge };
    }

    const amount = Math.round((charge - Math.max(0, user.balance)) * 100) / 100;
    const label = `${quantity.toLocaleString("en-US")} × ${displayName(service.name)}`;
    const order = await viva.createPaymentOrder({
      amount,
      email: user.email,
      fullName: user.name,
      customerTrns: `Socials Wick order: ${label}`.slice(0, 250),
      merchantTrns: `checkout ${service.id} x${quantity} for ${user.email}`.slice(0, 250),
    });

    await prisma.fundRequest.create({
      data: {
        userId: user.id,
        amount,
        method: "Viva Wallet (Card)",
        status: "PENDING",
        vivaOrderCode: order.orderCode,
        checkoutServiceId: service.id,
        checkoutQuantity: quantity,
        checkoutLink: link,
      },
    });

    return { status: "redirect", url: order.checkoutUrl, charge };
  } catch (err) {
    if (err instanceof OrderError) return { status: "error", error: err.message };
    if (err instanceof viva.VivaError) return { status: "error", error: err.message };
    return { status: "error", error: "Something went wrong. Please try again." };
  }
}
