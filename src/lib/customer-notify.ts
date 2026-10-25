import { prisma } from "@/lib/prisma";

// In-app notifications for customers (the bell in the dashboard). Every
// producer calls pushCustomerNotification(); it never throws, so a failed
// notification can never break the order, payment or refund behind it.

export type CustomerNotificationType =
  | "ORDER" // order placed
  | "ORDER_STATUS" // delivery finished, partial or cancelled
  | "REFUND" // money back in the balance
  | "FUNDS" // balance topped up or a top-up request reviewed
  | "ACCOUNT" // password, two-factor, email verification
  | "SYSTEM";

export const CUSTOMER_NOTIFICATION_META: Record<
  CustomerNotificationType,
  { icon: string; label: string; className: string }
> = {
  ORDER: { icon: "🛒", label: "Order", className: "bg-brand/15 text-brand" },
  ORDER_STATUS: { icon: "📦", label: "Delivery", className: "bg-sky-500/15 text-sky-300" },
  REFUND: { icon: "💶", label: "Refund", className: "bg-emerald-500/15 text-emerald-400" },
  FUNDS: { icon: "💳", label: "Balance", className: "bg-amber-500/15 text-amber-300" },
  ACCOUNT: { icon: "🔐", label: "Account", className: "bg-violet-500/15 text-violet-300" },
  SYSTEM: { icon: "🔔", label: "Notice", className: "bg-white/10 text-slate-300" },
};

export async function pushCustomerNotification(params: {
  userId: string;
  type: CustomerNotificationType;
  title: string;
  body?: string;
  href?: string;
}): Promise<void> {
  try {
    if (!params.userId) return;
    await prisma.customerNotification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title.slice(0, 200),
        body: (params.body ?? "").slice(0, 1000),
        href: params.href ?? null,
      },
    });
  } catch (err) {
    console.error("[customer-notify] failed to store notification:", err instanceof Error ? err.message : err);
  }
}

export type CustomerNotificationItem = {
  id: string;
  type: CustomerNotificationType;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string; // ISO
};

/** Row → the shape the bell and the page render. */
export function serializeCustomerNotification(n: {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
}): CustomerNotificationItem {
  return {
    id: n.id,
    type: n.type as CustomerNotificationType,
    title: n.title,
    body: n.body,
    href: n.href,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  };
}


export function formatMoney(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
