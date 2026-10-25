import { prisma } from "@/lib/prisma";
import { displayName } from "@/lib/catalog";
import { formatMoney, pushAdminNotification } from "@/lib/admin-notify";
import * as notify from "@/lib/notifications";
import { pushCustomerNotification } from "@/lib/customer-notify";

// Money back for orders the provider could not deliver.
//
//   CANCELLED → the whole charge
//   PARTIAL   → the share that was never delivered
//
// The amount already given back is stored on the order, so a refund can never
// run twice no matter how often the sync, an admin or a retry calls this.

export type RefundResult =
  | { refunded: false; reason: "not-refundable" | "already-refunded" | "not-found" }
  | { refunded: true; amount: number; balance: number };

/** What is still owed back for this order, rounded to cents. */
export function refundableAmount(order: {
  status: string;
  charge: number;
  quantity: number;
  remains: number;
  refunded: number;
}): number {
  let due = 0;
  if (order.status === "CANCELLED") {
    due = order.charge;
  } else if (order.status === "PARTIAL") {
    const undelivered = Math.min(Math.max(order.remains, 0), order.quantity);
    due = order.quantity > 0 ? (order.charge * undelivered) / order.quantity : 0;
  }
  return Math.max(0, Math.round((due - order.refunded) * 100) / 100);
}

/**
 * Credits the customer's balance for whatever is still owed on this order and
 * tells them by email. Safe to call repeatedly; never throws.
 */
export async function refundOrder(orderId: string): Promise<RefundResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: { select: { name: true } }, user: { select: { email: true, name: true } } },
    });
    if (!order) return { refunded: false, reason: "not-found" };

    const amount = refundableAmount(order);
    if (amount <= 0) {
      return { refunded: false, reason: order.status === "CANCELLED" || order.status === "PARTIAL" ? "already-refunded" : "not-refundable" };
    }

    // One transaction: credit the balance and record what was given back.
    const [user] = await prisma.$transaction([
      prisma.user.update({ where: { id: order.userId }, data: { balance: { increment: amount } } }),
      prisma.order.update({
        where: { id: order.id },
        data: { refunded: { increment: amount }, refundedAt: new Date() },
      }),
    ]);

    const serviceName = displayName(order.service.name);
    await notify.notifyCustomerOrderRefunded({
      customerEmail: order.user.email,
      customerName: order.user.name,
      orderId: order.id,
      serviceName,
      status: order.status,
      quantity: order.quantity,
      delivered: Math.max(0, order.quantity - order.remains),
      amount,
      balance: user.balance,
    });

    await pushCustomerNotification({
      userId: order.userId,
      type: "REFUND",
      title: `${formatMoney(amount)} refunded to your balance`,
      body:
        order.status === "CANCELLED"
          ? `Order ${order.id.slice(0, 8)} (${serviceName}) could not be delivered, so you were charged nothing.`
          : `Order ${order.id.slice(0, 8)} (${serviceName}) was only partly delivered, so you paid for the delivered part only.`,
      href: `/dashboard/orders/${order.id}`,
    });

    await pushAdminNotification({
      type: "ORDER_STATUS",
      title: `Refunded ${formatMoney(amount)} — ${serviceName}`,
      body: `${order.user.email} · order ${order.id.slice(0, 8)} ${order.status === "CANCELLED" ? "was cancelled" : "was partially delivered"}`,
      href: `/admin/orders`,
    });

    return { refunded: true, amount, balance: user.balance };
  } catch (err) {
    console.error("[refunds] failed for order", orderId, err instanceof Error ? err.message : err);
    return { refunded: false, reason: "not-found" };
  }
}
