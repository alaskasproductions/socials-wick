import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayName } from "@/lib/catalog";
import { deliveredCount, orderStatusBadge } from "@/lib/order-status";

export default async function OrderHistoryPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    include: { service: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Order History</h2>
      <div className="mt-6 overflow-x-auto rounded-xl glass">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Order ID</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Link</th>
              <th className="px-5 py-3 font-medium">Quantity</th>
              <th className="px-5 py-3 font-medium">Charge</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => {
              const badge = orderStatusBadge(o);
              return (
              <tr key={o.id}>
                <td className="px-5 py-3 font-mono text-xs">
                  <Link href={`/dashboard/orders/${o.id}`} className="text-brand hover:underline">
                    {o.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/dashboard/orders/${o.id}`} className="hover:text-brand">
                    {displayName(o.service.category.name)} — {displayName(o.service.name)}
                  </Link>
                </td>
                <td className="max-w-[200px] truncate px-5 py-3 text-slate-400">
                  <a href={o.link} target="_blank" rel="noreferrer" className="hover:text-brand">
                    {o.link}
                  </a>
                </td>
                <td className="px-5 py-3">
                  {o.quantity.toLocaleString("en-GB")}
                  {badge.showPercent && (
                    <span className="block text-xs text-slate-500">
                      {deliveredCount(o).toLocaleString("en-GB")} delivered
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  €{o.charge.toFixed(2)}
                  {o.refunded > 0 && (
                    <span className="block text-xs text-emerald-400">€{o.refunded.toFixed(2)} refunded</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                    {badge.text}
                  </span>
                  {badge.showPercent && (
                    <span className="mt-1.5 block h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${badge.percent}%` }} />
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {o.createdAt.toLocaleDateString("en-GB")}
                </td>
              </tr>
              );
            })}
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
