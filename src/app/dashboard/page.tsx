import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400",
  COMPLETED: "bg-green-500/15 text-green-400",
  PARTIAL: "bg-orange-500/15 text-orange-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, orders, orderCount, pendingFunds] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.order.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.count({ where: { userId } }),
    prisma.fundRequest.count({ where: { userId, status: "PENDING" } }),
  ]);

  const totalSpent = await prisma.order.aggregate({
    where: { userId },
    _sum: { charge: true },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl glass p-5">
          <div className="text-sm text-slate-400">Current Balance</div>
          <div className="mt-1 text-2xl font-bold text-brand">
            €{(user?.balance ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl glass p-5">
          <div className="text-sm text-slate-400">Total Orders</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{orderCount}</div>
        </div>
        <div className="rounded-xl glass p-5">
          <div className="text-sm text-slate-400">Total Spent</div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            €{(totalSpent._sum.charge ?? 0).toFixed(2)}
          </div>
        </div>
      </div>

      {pendingFunds > 0 && (
        <div className="rounded-lg bg-amber-500/15 px-4 py-3 text-sm text-amber-400">
          You have {pendingFunds} pending fund request(s) awaiting approval.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/new-order"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New Order
        </Link>
        <Link
          href="/dashboard/funds"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          + Add Funds
        </Link>
      </div>

      <div className="rounded-xl glass">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm font-medium text-brand hover:underline">
            View all →
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Quantity</th>
              <th className="px-5 py-3 font-medium">Charge</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3">{o.service.name}</td>
                <td className="px-5 py-3">{o.quantity}</td>
                <td className="px-5 py-3">€{o.charge.toFixed(2)}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[o.status]}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-slate-500">
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
