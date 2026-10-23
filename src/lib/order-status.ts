// How an order's status is shown to the customer: a readable label plus the
// share already delivered, e.g. "In progress 35%". The numbers come from the
// provider sync (see order-sync.ts), which refreshes start count, remains and
// status every few minutes.

export type OrderLike = { status: string; quantity: number; remains: number };

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  PARTIAL: "Partial",
  CANCELLED: "Cancelled",
};

const CLASSES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400",
  COMPLETED: "bg-green-500/15 text-green-400",
  PARTIAL: "bg-orange-500/15 text-orange-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

/** Delivered share, 0-100. Cancelled orders delivered nothing. */
export function orderProgress(order: OrderLike): number {
  if (order.status === "CANCELLED") return 0;
  if (order.status === "COMPLETED") return 100;
  if (order.quantity <= 0) return 0;
  const delivered = Math.min(order.quantity, Math.max(0, order.quantity - order.remains));
  return Math.min(100, Math.round((delivered / order.quantity) * 100));
}

export function deliveredCount(order: OrderLike): number {
  if (order.status === "CANCELLED") return 0;
  if (order.status === "COMPLETED") return order.quantity;
  return Math.min(order.quantity, Math.max(0, order.quantity - order.remains));
}

/** Label, colour and percentage for a status badge. */
export function orderStatusBadge(order: OrderLike): {
  label: string;
  percent: number;
  /** "In progress 35%" */
  text: string;
  className: string;
  showPercent: boolean;
} {
  const label = LABELS[order.status] ?? order.status;
  const percent = orderProgress(order);
  // A percentage only means something once delivery has started.
  const showPercent = order.status === "IN_PROGRESS" || order.status === "PARTIAL" || (order.status === "PENDING" && percent > 0);
  return {
    label,
    percent,
    text: showPercent ? `${label} ${percent}%` : label,
    className: CLASSES[order.status] ?? "bg-white/10 text-slate-300",
    showPercent,
  };
}
