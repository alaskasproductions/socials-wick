import { prisma } from "@/lib/prisma";
import { reviewFundRequestAction } from "@/lib/actions/admin";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  APPROVED: "bg-green-500/15 text-green-400",
  REJECTED: "bg-red-500/15 text-red-400",
};

export default async function AdminFundsPage() {
  const requests = await prisma.fundRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Fund Requests</h2>
      <div className="mt-4 overflow-x-auto rounded-xl glass">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3">
                  <div className="font-medium text-foreground">{r.user.name}</div>
                  <div className="text-xs text-slate-400">{r.user.email}</div>
                </td>
                <td className="px-5 py-3">€{r.amount.toFixed(2)}</td>
                <td className="px-5 py-3">{r.method}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right space-x-3">
                  {r.status === "PENDING" && (
                    <>
                      <form action={reviewFundRequestAction} className="inline">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="decision" value="APPROVED" />
                        <button className="text-xs font-semibold text-green-400 hover:underline">
                          Approve
                        </button>
                      </form>
                      <form action={reviewFundRequestAction} className="inline">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="decision" value="REJECTED" />
                        <button className="text-xs font-semibold text-red-400 hover:underline">
                          Reject
                        </button>
                      </form>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-500">
                  No fund requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
