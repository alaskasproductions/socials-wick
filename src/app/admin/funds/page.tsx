import { prisma } from "@/lib/prisma";
import { resendPaymentInstructionsAction, reviewFundRequestAction } from "@/lib/actions/admin";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  APPROVED: "bg-green-500/15 text-green-400",
  REJECTED: "bg-red-500/15 text-red-400",
};

// Cyprus time, so these dates line up with the Viva and Stripe portals.
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Nicosia",
});
const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Nicosia",
});

/**
 * What to quote when checking a request against the provider: the card
 * transaction for Viva or Stripe, the SW- code for a bank transfer.
 */
function referenceLines(r: {
  vivaTransactionId: string | null;
  vivaOrderCode: string | null;
  stripeSessionId: string | null;
  reference: string | null;
}): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  if (r.vivaTransactionId) lines.push({ label: "Transaction", value: r.vivaTransactionId });
  if (r.vivaOrderCode) lines.push({ label: "Viva order", value: r.vivaOrderCode });
  if (r.stripeSessionId) lines.push({ label: "Stripe session", value: r.stripeSessionId });
  if (r.reference) lines.push({ label: "Bank reference", value: r.reference });
  return lines;
}

export default async function AdminFundsPage() {
  const requests = await prisma.fundRequest.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">Fund Requests</h2>
      <div className="mt-4 overflow-x-auto rounded-xl glass">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Reference</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.map((r) => {
              const refs = referenceLines(r);
              return (
              <tr key={r.id}>
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="text-foreground">{DATE_FMT.format(r.createdAt)}</div>
                  <div className="text-xs text-slate-400">{TIME_FMT.format(r.createdAt)}</div>
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium text-foreground">{r.user.name}</div>
                  <div className="text-xs text-slate-400">{r.user.email}</div>
                </td>
                <td className="px-5 py-3">€{r.amount.toFixed(2)}</td>
                <td className="px-5 py-3">{r.method}</td>
                <td className="px-5 py-3">
                  {refs.map((l) => (
                    <div key={l.label} className="text-xs">
                      <span className="text-slate-500">{l.label} </span>
                      <span className="select-all break-all font-mono text-brand">{l.value}</span>
                    </div>
                  ))}
                  {refs.length === 0 && <span className="text-xs text-slate-500">—</span>}
                </td>
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
                      {!r.vivaOrderCode && !r.stripeSessionId && (
                        <form action={resendPaymentInstructionsAction} className="inline">
                          <input type="hidden" name="id" value={r.id} />
                          <button className="text-xs font-semibold text-brand hover:underline">
                            {r.reference ? "Resend details" : "Send details"}
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </td>
              </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-500">
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
