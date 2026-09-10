import { prisma } from "@/lib/prisma";

// In-app notification centre for admins (the bell in the admin header).
// Every producer calls pushAdminNotification(); it never throws, so a
// notification failure can never break the order/payment flow behind it.

export type AdminNotificationType =
  | "ORDER" // new order placed
  | "ORDER_FAILED" // order could not be forwarded to the provider
  | "ORDER_STATUS" // provider changed an order's status (completed / partial / canceled)
  | "PAYMENT" // card payment confirmed
  | "FUND_REQUEST" // manual top-up request awaiting review
  | "USER" // new registration or guest checkout account
  | "SYSTEM";

export const NOTIFICATION_META: Record<AdminNotificationType, { icon: string; label: string; className: string }> = {
  ORDER: { icon: "🛒", label: "New order", className: "bg-brand/15 text-brand" },
  ORDER_FAILED: { icon: "⚠️", label: "Order needs attention", className: "bg-red-500/15 text-red-400" },
  ORDER_STATUS: { icon: "📦", label: "Order update", className: "bg-sky-500/15 text-sky-300" },
  PAYMENT: { icon: "💶", label: "Payment received", className: "bg-emerald-500/15 text-emerald-400" },
  FUND_REQUEST: { icon: "💳", label: "Fund request", className: "bg-amber-500/15 text-amber-300" },
  USER: { icon: "👤", label: "New customer", className: "bg-violet-500/15 text-violet-300" },
  SYSTEM: { icon: "🔔", label: "System", className: "bg-white/10 text-slate-300" },
};

export async function pushAdminNotification(params: {
  type: AdminNotificationType;
  title: string;
  body?: string;
  href?: string;
}): Promise<void> {
  try {
    await prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title.slice(0, 200),
        body: (params.body ?? "").slice(0, 1000),
        href: params.href ?? null,
      },
    });
  } catch (err) {
    console.error("[admin-notify] failed to store notification:", err instanceof Error ? err.message : err);
  }
}

export function formatMoney(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
