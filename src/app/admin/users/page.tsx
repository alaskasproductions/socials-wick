import { prisma } from "@/lib/prisma";
import { toggleUserStatusAction } from "@/lib/actions/admin";
import AdjustBalanceForm from "./AdjustBalanceForm";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Users</h2>
      <div className="mt-4 overflow-x-auto rounded-xl glass">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Balance</th>
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Adjust Balance</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-5 py-3 text-slate-400">{u.email}</td>
                <td className="px-5 py-3">€{u.balance.toFixed(2)}</td>
                <td className="px-5 py-3">{u._count.orders}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.status === "ACTIVE"
                        ? "bg-green-500/15 text-green-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <AdjustBalanceForm userId={u.id} />
                </td>
                <td className="px-5 py-3 text-right">
                  <form action={toggleUserStatusAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="text-xs font-semibold text-red-400 hover:underline">
                      {u.status === "ACTIVE" ? "Ban" : "Unban"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
