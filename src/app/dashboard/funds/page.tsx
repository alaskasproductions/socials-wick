import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddFundsForm from "./AddFundsForm";
import VivaPaymentForm from "./VivaPaymentForm";
import StripePaymentForm from "./StripePaymentForm";
import * as viva from "@/lib/providers/viva";
import * as stripe from "@/lib/providers/stripe";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  APPROVED: "bg-green-500/15 text-green-400",
  REJECTED: "bg-red-500/15 text-red-400",
};

export default async function FundsPage() {
  const session = await auth();
  const [requests, vivaEnabled, stripeEnabled] = await Promise.all([
    prisma.fundRequest.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
    }),
    viva.isEnabled(),
    stripe.isEnabled(),
  ]);

  const noGatewaysEnabled = !vivaEnabled && !stripeEnabled;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Add Funds</h2>

          {noGatewaysEnabled && (
            <div className="mt-6 rounded-lg bg-amber-500/15 px-4 py-3 text-sm text-amber-400">
              Card payments aren't set up yet. Use the manual request form below, or ask an admin
              to enable a payment gateway.
            </div>
          )}

          {vivaEnabled && (
            <div className="mt-6 rounded-xl glass p-6">
              <VivaPaymentForm />
            </div>
          )}

          {stripeEnabled && (
            <div className="mt-6 rounded-xl glass p-6">
              <StripePaymentForm />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300">Other Payment Methods</h3>
          <div className="mt-3 rounded-xl glass p-6">
            <AddFundsForm />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground">Request History</h2>
        <div className="mt-6 overflow-hidden rounded-xl glass">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3">€{r.amount.toFixed(2)}</td>
                  <td className="px-5 py-3">{r.method}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-slate-500">
                    No fund requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
