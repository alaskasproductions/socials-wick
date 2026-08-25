import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [userCount, orderCount, serviceCount, pendingFunds, revenue, recentOrders] =
    await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count(),
      prisma.service.count(),
      prisma.fundRequest.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { charge: true } }),
      prisma.order.findMany({
        include: { service: true, user: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={userCount} />
        <StatCard label="Total Orders" value={orderCount} />
        <StatCard label="Active Services" value={serviceCount} />
        <StatCard label="Total Revenue" value={`€${(revenue._sum.charge ?? 0).toFixed(2)}`} />
      </div>

      {pendingFunds > 0 && (
        <Link
          href="/admin/funds"
          className="block rounded-lg bg-amber-500/15 px-4 py-3 text-sm font-medium text-amber-400 hover:bg-amber-500/25"
        >
          {pendingFunds} fund request(s) awaiting your review →
        </Link>
      )}

      <div className="rounded-xl glass">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Charge</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3">{o.user.name}</td>
                <td className="px-5 py-3">{o.service.name}</td>
                <td className="px-5 py-3">€{o.charge.toFixed(2)}</td>
                <td className="px-5 py-3">{o.status}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl glass p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
