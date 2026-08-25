// Next.js runs register() once when the server process starts. We use it to
// kick off the in-process order-status auto-sync timer (see
// /lib/order-sync.ts) so orders stay current without any manual action,
// for as long as this process keeps running (e.g. `next start` on a VPS).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startOrderSyncScheduler } = await import("@/lib/order-sync");
    startOrderSyncScheduler(5);
  }
}
