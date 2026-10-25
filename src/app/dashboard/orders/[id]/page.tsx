import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayName, serviceTier, TIERS } from "@/lib/catalog";
import { buildServiceGuide } from "@/lib/service-guide";
import ServiceGuidePanel from "@/components/ServiceGuidePanel";
import { orderStatusBadge } from "@/lib/order-status";
import { refundableAmount } from "@/lib/refunds";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { what: string }> = {
  PENDING: {
    what: "We have received your order and it is queued with our provider. Most services start within minutes.",
  },
  IN_PROGRESS: {
    what: "Delivery has started. The remaining amount below updates as it runs.",
  },
  COMPLETED: {
    what: "The full quantity has been delivered.",
  },
  PARTIAL: {
    what: "Only part of the order could be delivered, so the rest was refunded to your balance.",
  },
  CANCELLED: {
    what:
      "The provider could not deliver this order, so it was cancelled and the amount went back to your balance. " +
      "The usual cause is a link the service cannot accept, so check the link rules below before ordering again.",
  },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 py-3 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-40 shrink-0 text-sm text-slate-400">{label}</span>
      <span className="min-w-0 break-words text-sm text-slate-100">{children}</span>
    </div>
  );
}

export default async function OrderDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const [{ id }, sp, session] = await Promise.all([params, searchParams, auth()]);

  const order = await prisma.order.findFirst({
    where: { id, userId: session!.user.id },
    include: { service: { include: { category: true } } },
  });
  if (!order) notFound();

  const status = STATUS[order.status] ?? STATUS.PENDING;
  const badge = orderStatusBadge(order);
  const owed = refundableAmount(order);
  const tier = TIERS[serviceTier(order.service.name, order.service.category.name)];
  const delivered = Math.max(0, order.quantity - order.remains);
  const guide = buildServiceGuide({
    name: order.service.name,
    categoryName: order.service.category.name,
    min: order.service.min,
    max: order.service.max,
  });

  return (
    <div className="max-w-3xl">
      {sp.placed && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-lg font-bold text-emerald-400">✅ Your order is placed</p>
          <p className="mt-1 text-sm text-slate-300">
            Order <span className="font-mono">{order.id.slice(0, 8)}</span> has been sent for delivery. You can
            follow its progress on this page, and we will email you when it is done.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/new-order"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Place another order
            </Link>
            <Link
              href="/dashboard/orders"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              All my orders
            </Link>
          </div>
        </div>
      )}

      {order.refunded > 0 && !sp.placed && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
          <p className="font-semibold text-emerald-400">
            €{order.refunded.toFixed(2)} was refunded to your balance
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {order.status === "CANCELLED"
              ? "Nothing was delivered for this order, so you were charged nothing in the end."
              : "You only paid for the part that was delivered."}{" "}
            The money is in your balance and can be spent on any service.
          </p>
        </div>
      )}

      <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
        <Link href="/dashboard/orders" className="hover:text-brand">
          Order history
        </Link>{" "}
        / <span className="text-slate-300">Order {order.id.slice(0, 8)}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">
          {displayName(order.service.category.name)} — {displayName(order.service.name)}
        </h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.text}</span>
      </div>
      <p className="mt-2 text-sm text-slate-400">{status.what}</p>

      {badge.showPercent && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-brand" style={{ width: `${badge.percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {delivered.toLocaleString("en-GB")} of {order.quantity.toLocaleString("en-GB")} delivered ({badge.percent}%)
          </p>
        </div>
      )}

      <div className="glass mt-6 rounded-xl p-5">
        <Row label="Order ID">
          <span className="font-mono">{order.id}</span>
        </Row>
        <Row label="Service">
          {tier.dot && (
            <span className={`mr-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tier.className}`}>
              {tier.dot} {tier.label}
            </span>
          )}
          {displayName(order.service.name)}
        </Row>
        <Row label={guide.link.label}>
          <a href={order.link} target="_blank" rel="noreferrer" className="text-brand hover:underline">
            {order.link}
          </a>
        </Row>
        <Row label="Quantity">{order.quantity.toLocaleString("en-GB")}</Row>
        {order.startCount > 0 && <Row label="Start count">{order.startCount.toLocaleString("en-GB")}</Row>}
        {order.status !== "COMPLETED" && order.remains > 0 && (
          <Row label="Remaining">{order.remains.toLocaleString("en-GB")}</Row>
        )}
        <Row label="Charged">€{order.charge.toFixed(2)}</Row>
        {order.refunded > 0 && (
          <Row label="Refunded">
            <span className="font-semibold text-emerald-400">€{order.refunded.toFixed(2)}</span>
            <span className="text-slate-400">
              {" "}
              back in your balance
              {order.refundedAt
                ? ` on ${order.refundedAt.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}`
                : ""}
            </span>
          </Row>
        )}
        {owed > 0 && (
          <Row label="Refund">
            <span className="text-amber-300">
              €{owed.toFixed(2)} is being refunded to your balance. Contact support if you do not see it shortly.
            </span>
          </Row>
        )}
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
          <span className="w-40 shrink-0 text-sm text-slate-400">Placed</span>
          <span className="text-sm text-slate-100">
            {order.createdAt.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground">About this service</h3>
        <div className="mt-2">
          <ServiceGuidePanel
            compact
            guide={guide}
            adminText={order.service.description ? displayName(order.service.description) : undefined}
          />
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-400">
        Something not right?{" "}
        <Link href="/contact" className="text-brand hover:underline">
          Contact support
        </Link>{" "}
        with your order ID and we will look into it.
      </p>
    </div>
  );
}
