import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400",
  COMPLETED: "bg-green-500/15 text-green-400",
  PARTIAL: "bg-orange-500/15 text-orange-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

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
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{o.id.slice(0, 8)}</td>
                <td className="px-5 py-3">
                  {o.service.category.name} — {o.service.name}
                </td>
                <td className="max-w-[200px] truncate px-5 py-3 text-slate-400">
                  <a href={o.link} target="_blank" rel="noreferrer" className="hover:text-brand">
                    {o.link}
                  </a>
                </td>
                <td className="px-5 py-3">{o.quantity}</td>
                <td className="px-5 py-3">€{o.charge.toFixed(2)}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {o.createdAt.toLocaleDateString()}
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
