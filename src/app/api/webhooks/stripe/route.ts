import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, StripeError } from "@/lib/providers/stripe";
import { confirmStripePayment } from "@/lib/stripe-confirm";

// Stripe POSTs events here, signed with the webhook secret. We verify the
// signature against the raw body before trusting anything in it.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event;
  try {
    event = await constructWebhookEvent(rawBody, signature);
  } catch (err) {
    const message = err instanceof StripeError ? err.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string };
    try {
      await confirmStripePayment(session.id);
    } catch {
      // Stripe retries on non-2xx; swallow transient errors here since the
      // /dashboard/funds/stripe-callback page is a second confirmation path.
    }
  }

  return NextResponse.json({ received: true });
}
