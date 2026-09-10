import { prisma } from "@/lib/prisma";
import * as provider from "@/lib/providers/morethanpanel";
import { pushAdminNotification } from "@/lib/admin-notify";
import { displayName } from "@/lib/catalog";

export type SyncResult = { synced: number; total: number; error?: string };

// Pulls fresh status/start_count/remains for every order that has a
// providerOrderId and isn't already in a terminal state, in one batched
// call. Used by the manual "Sync Now" admin action, the /api/cron/sync-orders
// endpoint (for external schedulers), and the in-process auto-sync timer.
export async function syncPendingOrders(): Promise<SyncResult> {
  const pending = await prisma.order.findMany({
    where: {
      providerOrderId: { not: null },
      status: { in: ["PENDING", "IN_PROGRESS", "PARTIAL"] },
    },
    include: { service: { select: { name: true } }, user: { select: { email: true } } },
  });

  if (pending.length === 0) return { synced: 0, total: 0 };

  const ids = pending.map((o) => o.providerOrderId as string);
  let results: Record<string, provider.ProviderOrderStatus | { error: string }>;
  try {
    results = await provider.getMultiStatus(ids);
  } catch (err) {
    return {
      synced: 0,
      total: pending.length,
      error: err instanceof Error ? err.message : "Failed to reach provider.",
    };
  }

  let synced = 0;
  for (const order of pending) {
    const result = results[order.providerOrderId as string];
    if (!result || "error" in result) continue;

    const nextStatus = provider.mapProviderStatus(result.status);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        startCount: Number(result.start_count) || order.startCount,
        remains: Number(result.remains) || order.remains,
      },
    });
    synced++;

    // Tell the admin when an order finishes or goes wrong (not for every progress tick).
    if (nextStatus !== order.status && ["COMPLETED", "PARTIAL", "CANCELLED"].includes(nextStatus)) {
      const label = nextStatus === "COMPLETED" ? "completed" : nextStatus === "PARTIAL" ? "partially delivered" : "canceled by the provider";
      await pushAdminNotification({
        type: "ORDER_STATUS",
        title: `Order ${label} — ${order.quantity.toLocaleString("en-US")} × ${displayName(order.service.name)}`,
        body: `${order.user.email} · remains ${Number(result.remains) || 0}${nextStatus === "CANCELLED" ? "\nCheck the link/format and refund the customer if needed." : ""}`,
        href: "/admin/orders",
      });
    }
  }

  return { synced, total: pending.length };
}

// Starts an in-process timer that calls syncPendingOrders() on an interval,
// so orders stay up to date automatically as long as the server process is
// running (e.g. `next start` on a VPS). On serverless hosts where the
// process doesn't stay alive between requests, use /api/cron/sync-orders
// with an external scheduler instead — this timer simply won't fire there.
declare global {
  // eslint-disable-next-line no-var
  var __orderSyncInterval: NodeJS.Timeout | undefined;
}

export function startOrderSyncScheduler(intervalMinutes = 5): void {
  if (globalThis.__orderSyncInterval) return;

  globalThis.__orderSyncInterval = setInterval(
    () => {
      syncPendingOrders().catch((err) => {
        console.error("[order-sync] scheduled sync failed:", err);
      });
    },
    intervalMinutes * 60 * 1000
  );

  console.log(`[order-sync] auto-sync scheduler started (every ${intervalMinutes} min)`);
}
