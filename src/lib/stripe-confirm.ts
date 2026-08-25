import { prisma } from "@/lib/prisma";
import * as stripe from "@/lib/providers/stripe";
import * as notify from "@/lib/notifications";

export type ConfirmResult =
  | { status: "confirmed"; amount: number }
  | { status: "already-confirmed"; amount: number }
  | { status: "not-found" }
  | { status: "mismatch" }
  | { status: "unpaid" };

// Verifies a Stripe Checkout session against our records and, if it's a
// genuine paid match, atomically flips the FundRequest to APPROVED and
// credits the user's balance exactly once. Safe to call multiple times for
// the same session (from both the return-callback page and the webhook).
export async function confirmStripePayment(sessionId: string): Promise<ConfirmResult> {
  const fundRequest = await prisma.fundRequest.findUnique({ where: { stripeSessionId: sessionId } });
  if (!fundRequest) return { status: "not-found" };
  if (fundRequest.status === "APPROVED") {
    return { status: "already-confirmed", amount: fundRequest.amount };
  }

  const session = await stripe.retrieveSession(sessionId);

  const amountMatches =
    session.amount_total != null &&
    Math.abs(session.amount_total / 100 - fundRequest.amount) < 0.01;
  if (!amountMatches) return { status: "mismatch" };
  if (session.payment_status !== "paid") return { status: "unpaid" };

  const updated = await prisma.fundRequest.updateMany({
    where: { id: fundRequest.id, status: "PENDING" },
    data: { status: "APPROVED" },
  });

  if (updated.count > 0) {
    const user = await prisma.user.update({
      where: { id: fundRequest.userId },
      data: { balance: { increment: fundRequest.amount } },
    });
    await notify.notifyCustomerPaymentReceipt({
      customerEmail: user.email,
      customerName: user.name,
      amount: fundRequest.amount,
      method: fundRequest.method,
    });
    return { status: "confirmed", amount: fundRequest.amount };
  }

  return { status: "already-confirmed", amount: fundRequest.amount };
}
