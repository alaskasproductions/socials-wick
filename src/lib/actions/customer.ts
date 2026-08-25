"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as provider from "@/lib/providers/morethanpanel";
import * as viva from "@/lib/providers/viva";
import * as stripe from "@/lib/providers/stripe";
import * as notify from "@/lib/notifications";

export type ActionState = { error?: string; success?: string } | undefined;

export async function placeOrderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const serviceId = String(formData.get("serviceId") ?? "");
  const link = String(formData.get("link") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 0);

  if (!serviceId || !link || !quantity) {
    return { error: "All fields are required." };
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) return { error: "Service not found." };

  if (quantity < service.min || quantity > service.max) {
    return {
      error: `Quantity must be between ${service.min} and ${service.max}.`,
    };
  }

  const charge = Math.round((quantity / 1000) * service.rate * 100) / 100;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };
  if (user.balance < charge) {
    return { error: "Insufficient balance. Please add funds first." };
  }

  const [, order] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: charge } },
    }),
    prisma.order.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        link,
        quantity,
        charge,
        remains: quantity,
        status: "PENDING",
      },
    }),
  ]);

  // Forward to the MoreThanPanel provider for fulfillment, if this service is
  // sourced from them. Failures don't block the order — the customer has
  // already paid, so an admin can retry delivery from /admin/orders.
  if (service.providerServiceId) {
    try {
      const result = await provider.addOrder({
        serviceId: service.providerServiceId,
        link,
        quantity,
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { providerOrderId: String(result.order), providerError: null },
      });
    } catch (err) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          providerError: err instanceof Error ? err.message : "Unknown provider error",
        },
      });
    }
  }

  await Promise.all([
    notify.notifyAdminNewOrder({
      customerName: user.name,
      customerEmail: user.email,
      serviceName: service.name,
      quantity,
      charge,
      link,
    }),
    notify.notifyCustomerOrderConfirmation({
      customerEmail: user.email,
      customerName: user.name,
      serviceName: service.name,
      quantity,
      charge,
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  return { success: "Order placed successfully." };
}

export async function requestFundsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "");

  if (!amount || amount <= 0) return { error: "Enter a valid amount." };
  if (!method) return { error: "Select a payment method." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  await prisma.fundRequest.create({
    data: { userId: user.id, amount, method, status: "PENDING" },
  });

  await notify.notifyAdminNewFundRequest({
    customerName: user.name,
    customerEmail: user.email,
    amount,
    method,
  });

  revalidatePath("/dashboard/funds");
  return { success: "Fund request submitted. It will be reviewed shortly." };
}

// Starts a Viva Wallet Smart Checkout payment: creates a payment order with
// Viva, records a matching PENDING FundRequest, then redirects the customer
// to Viva's hosted checkout page to pay by card. Balance is credited once
// the payment is confirmed, via the /dashboard/funds/callback return page
// and/or the Viva webhook — never at this step.
export async function startVivaPaymentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const amount = Number(formData.get("amount") ?? 0);
  if (!amount || amount < 1) return { error: "Enter a valid amount (minimum €1)." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  let order: { orderCode: string; checkoutUrl: string };
  try {
    order = await viva.createPaymentOrder({
      amount,
      email: user.email,
      fullName: user.name,
      customerTrns: "Add funds to Socials Wick balance",
      merchantTrns: user.id,
    });
  } catch (err) {
    return { error: err instanceof viva.VivaError ? err.message : "Could not start payment." };
  }

  await prisma.fundRequest.create({
    data: {
      userId: user.id,
      amount,
      method: "Viva Wallet (Card)",
      status: "PENDING",
      vivaOrderCode: order.orderCode,
    },
  });

  redirect(order.checkoutUrl);
}

// Starts a Stripe Checkout payment: creates a Checkout Session with Stripe,
// records a matching PENDING FundRequest, then redirects the customer to
// Stripe's hosted checkout page to pay by card. Balance is credited once the
// payment is confirmed, via the /dashboard/funds/stripe-callback return page
// and/or the Stripe webhook — never at this step.
export async function startStripePaymentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const amount = Number(formData.get("amount") ?? 0);
  if (!amount || amount < 1) return { error: "Enter a valid amount (minimum €1)." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  let checkoutSession: { sessionId: string; url: string };
  try {
    checkoutSession = await stripe.createCheckoutSession({
      amount,
      email: user.email,
      userId: user.id,
    });
  } catch (err) {
    return { error: err instanceof stripe.StripeError ? err.message : "Could not start payment." };
  }

  await prisma.fundRequest.create({
    data: {
      userId: user.id,
      amount,
      method: "Stripe (Card)",
      status: "PENDING",
      stripeSessionId: checkoutSession.sessionId,
    },
  });

  redirect(checkoutSession.url);
}
