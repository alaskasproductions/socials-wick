import { NextRequest, NextResponse } from "next/server";
import { syncPendingOrders } from "@/lib/order-sync";

// For serverless hosts (e.g. Vercel), the in-process auto-sync timer in
// instrumentation.ts won't stay alive between requests — point an external
// scheduler (Vercel Cron, system cron via curl, GitHub Actions, etc.) at
// this endpoint instead, e.g. every 5 minutes:
//   curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/sync-orders
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await syncPendingOrders();
  return NextResponse.json(result);
}
