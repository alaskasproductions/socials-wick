import { prisma } from "@/lib/prisma";
import * as viva from "@/lib/providers/viva";
import * as notify from "@/lib/notifications";

export type ConfirmResult =
  | { status: "confirmed"; amount: number }
  | { status: "already-confirmed"; amount: number }
  | { status: "not-found" }
  | { status: "mismatch" }
  | { status: "unpaid" };

// Verifies a Viva transaction against our records and, if it's a genuine
// paid match, atomically flips the FundRequest to APPROVED and credits the
// user's balance exactly once. Safe to call multiple times for the same
// order (from both the return-callback page and the webhook).
export async function confirmVivaPayment(
  orderCode: string,
  transactionId: string
): Promise<ConfirmResult> {
  const fundRequest = await prisma.fundRequest.findUnique({ where: { vivaOrderCode: orderCode } });
  if (!fundRequest) return { status: "not-found" };
  if (fundRequest.status === "APPROVED") {
    return { status: "already-confirmed", amount: fundRequest.amount };
  }

  const txn = await viva.retrieveTransaction(transactionId);

  // Note: unlike the order-creation request (which takes cents), Viva's
  // Retrieve Transaction response returns `amount` in major currency units.
  const orderMatches = String(txn.orderCode) === orderCode;
  const amountMatches = Math.abs(txn.amount - fundRequest.amount) < 0.01;
  if (!orderMatches || !amountMatches) return { status: "mismatch" };
  if (txn.statusId !== "F") return { status: "unpaid" };

  const updated = await prisma.fundRequest.updateMany({
    where: { id: fundRequest.id, status: "PENDING" },
    data: { status: "APPROVED", vivaTransactionId: transactionId },
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
