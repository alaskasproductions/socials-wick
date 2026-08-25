import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateOrderStatusAction } from "@/lib/actions/admin";
import { resendOrderToProviderAction } from "@/lib/actions/provider";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "PARTIAL", "CANCELLED"] as const;

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { service: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">All Orders</h2>
        <Link href="/admin/provider" className="text-sm font-medium text-brand hover:underline">
          Provider sync →
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl glass">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Link</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Charge</th>
              <th className="px-5 py-3 font-medium">Provider</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3">
                  <div className="font-medium text-foreground">{o.user.name}</div>
                  <div className="text-xs text-slate-400">{o.user.email}</div>
                </td>
                <td className="px-5 py-3">{o.service.name}</td>
                <td className="max-w-[180px] truncate px-5 py-3 text-slate-400">{o.link}</td>
                <td className="px-5 py-3">{o.quantity}</td>
                <td className="px-5 py-3">€{o.charge.toFixed(2)}</td>
                <td className="px-5 py-3">
                  {o.providerOrderId ? (
                    <span className="text-xs text-slate-400">#{o.providerOrderId}</span>
                  ) : o.service.providerServiceId ? (
                    <div className="space-y-1">
                      <div className="text-xs text-red-400" title={o.providerError ?? undefined}>
                        {o.providerError ? "Send failed" : "Not sent"}
                      </div>
                      <form action={resendOrderToProviderAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="text-xs font-semibold text-brand hover:underline">
                          Resend
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Manual</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <form action={updateOrderStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <select
                      name="status"
                      defaultValue={o.status}
                      className="rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-dark">
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
