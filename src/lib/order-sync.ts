import { prisma } from "@/lib/prisma";
import * as provider from "@/lib/providers/morethanpanel";

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

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: provider.mapProviderStatus(result.status),
        startCount: Number(result.start_count) || order.startCount,
        remains: Number(result.remains) || order.remains,
      },
    });
    synced++;
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
