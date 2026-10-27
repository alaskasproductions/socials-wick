"use server";

import { prisma } from "@/lib/prisma";
import { OrderError, orderCharge, placeOrder } from "@/lib/orders";
import { linkRuleFor } from "@/lib/link-rules";
import { findManualMethod, getManualMethods, makePaymentReference } from "@/lib/manual-payments";
import { displayName } from "@/lib/catalog";
import { formatMoney, pushAdminNotification } from "@/lib/admin-notify";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

  let placed;
  try {
    placed = await placeOrder({
      userId: session.user.id,
      serviceId: String(formData.get("serviceId") ?? ""),
      link: String(formData.get("link") ?? "").trim(),
      quantity: Number(formData.get("quantity") ?? 0),
    });
  } catch (err) {
    if (err instanceof OrderError) return { error: err.message };
    throw err;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  // Show the customer the order itself, with its status and what happens next.
  redirect(`/dashboard/orders/${placed.orderId}?placed=1`);
}

export type FundRequestState =
  | { error: string }
  | {
      success: string;
      method: string;
      amount: number;
      reference: string;
      lines: { label: string; value: string }[];
      notes: string;
      needsReference: boolean;
    }
  | undefined;

export async function requestFundsAction(
  _prevState: FundRequestState,
  formData: FormData
): Promise<FundRequestState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const amount = Number(formData.get("amount") ?? 0);
  const methodLabel = String(formData.get("method") ?? "");

  if (!amount || amount <= 0) return { error: "Enter a valid amount." };

  // Only a method you have actually set up can be chosen.
  const methods = await getManualMethods();
  const method = findManualMethod(methods, methodLabel);
  if (!method) return { error: "That payment method is not available. Please pick another one." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  // Collisions are vanishingly unlikely, but the column is unique, so retry.
  let request: { reference: string | null } | null = null;
  for (let attempt = 0; attempt < 5 && !request; attempt++) {
    const reference = makePaymentReference();
    try {
      request = await prisma.fundRequest.create({
        data: { userId: user.id, amount, method: method.label, status: "PENDING", reference },
      });
    } catch {
      request = null;
    }
  }
  if (!request?.reference) return { error: "Could not create the request. Please try again." };

  await notify.notifyCustomerPaymentInstructions({
    customerEmail: user.email,
    customerName: user.name,
    amount,
    method,
    reference: request.reference,
  });

  await notify.notifyAdminNewFundRequest({
    customerName: user.name,
    customerEmail: user.email,
    amount,
    method: method.label,
  });
  await pushAdminNotification({
    type: "FUND_REQUEST",
    title: `Fund request — ${formatMoney(amount)} via ${method.label}`,
    body: `${user.name} (${user.email}) · reference ${request.reference} · waiting for the payment to arrive.`,
    href: "/admin/funds",
  });

  revalidatePath("/dashboard/funds");
  return {
    success: "Request created. Send the payment using the details below.",
    method: method.label,
    amount,
    reference: request.reference,
    lines: method.lines,
    notes: method.notes,
    needsReference: method.needsReference,
  };
}

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

/**
 * Not enough balance for an order: charge the difference on a card and place
 * the order automatically once the payment clears (the same mechanism the
 * landing-page checkout uses). The customer never has to come back and
 * re-enter the order.
 */
export async function payAndPlaceOrderAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const serviceId = String(formData.get("serviceId") ?? "");
  const link = String(formData.get("link") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 0);
  const gateway = String(formData.get("gateway") ?? "viva");

  const [user, service] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.service.findUnique({ where: { id: serviceId }, include: { category: { select: { name: true } } } }),
  ]);
  if (!user) return { error: "User not found." };
  if (!service || !service.active) return { error: "Service not found." };
  if (!quantity || quantity < service.min || quantity > service.max) {
    return { error: `Quantity must be between ${service.min} and ${service.max}.` };
  }
  const linkProblem = linkRuleFor(service.name, service.category.name).check(link);
  if (linkProblem) return { error: linkProblem };

  const charge = orderCharge(service.rate, quantity);
  const shortfall = Math.max(0, Math.round((charge - user.balance) * 100) / 100);
  if (shortfall <= 0) {
    return { error: "Your balance already covers this order — press Place Order." };
  }
  // Card gateways will not take a few cents, so top up at least €1; anything
  // above the shortfall simply stays in the balance.
  const amount = Math.max(1, shortfall);

  if (gateway === "stripe") {
    let checkoutSession: { sessionId: string; url: string };
    try {
      checkoutSession = await stripe.createCheckoutSession({ amount, email: user.email, userId: user.id });
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
        checkoutServiceId: service.id,
        checkoutQuantity: quantity,
        checkoutLink: link,
      },
    });
    redirect(checkoutSession.url);
  }

  let order: { orderCode: string; checkoutUrl: string };
  try {
    order = await viva.createPaymentOrder({
      amount,
      email: user.email,
      fullName: user.name,
      customerTrns: `${quantity} × ${displayName(service.name)}`,
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
      checkoutServiceId: service.id,
      checkoutQuantity: quantity,
      checkoutLink: link,
    },
  });

  redirect(order.checkoutUrl);
}
