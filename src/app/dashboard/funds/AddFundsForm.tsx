"use client";

import { useActionState, useState } from "react";
import { requestFundsAction } from "@/lib/actions/customer";

// Manual top-ups: the customer picks a method you have set up, gets the
// payment details with a reference, sends the money, and an admin approves it.

export default function AddFundsForm({
  methods,
  suggestedAmount,
}: {
  methods: { key: string; label: string }[];
  suggestedAmount?: number;
}) {
  const [state, formAction, pending] = useActionState(requestFundsAction, undefined);
  const [copied, setCopied] = useState(false);

  if (methods.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No other payment methods are available at the moment. Please pay by card, or contact support.
      </p>
    );
  }

  if (state && "success" in state) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>

        <div className="rounded-xl border border-brand/30 bg-brand/5 p-4">
          <p className="text-sm font-semibold text-foreground">{state.method} details</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2">
              <dt className="text-slate-400">Amount</dt>
              <dd className="font-semibold text-foreground">€{state.amount.toFixed(2)}</dd>
            </div>
            {state.lines.map((l) => (
              <div key={l.label} className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2">
                <dt className="text-slate-400">{l.label}</dt>
                <dd className="break-all font-medium text-foreground">{l.value}</dd>
              </div>
            ))}
            {state.needsReference && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <dt className="text-slate-400">Payment reference</dt>
                <dd className="flex items-center gap-2">
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-sm font-semibold text-brand">
                    {state.reference}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(state.reference).then(
                        () => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        },
                        () => setCopied(false)
                      );
                    }}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </dd>
              </div>
            )}
          </dl>

          {state.notes && <p className="mt-3 whitespace-pre-line text-xs text-slate-300">{state.notes}</p>}

          {state.needsReference && (
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              ⚠️ Put the reference {state.reference} in the payment description. It is how we match your
              payment to your account.
            </p>
          )}

          <p className="mt-3 text-xs text-slate-400">
            Transfers usually take 1 to 3 working days, depending on your bank. Your balance is credited
            as soon as the money arrives, and you will get an email and a notification then. The request
            stays listed below as waiting in the meantime. Need the funds now? Pay by card instead, which
            is credited straight away.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">Amount (€)</label>
        <input
          name="amount"
          type="number"
          min={1}
          step="0.01"
          required
          defaultValue={suggestedAmount ? suggestedAmount.toFixed(2) : undefined}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-400 focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Payment Method</label>
        <select
          name="method"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        >
          {methods.map((m) => (
            <option key={m.key} value={m.label}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Creating…" : "Get payment details"}
      </button>
      <p className="text-xs text-slate-500">
        You will see where to send the money and a reference to quote. Transfers usually arrive in 1 to 3
        working days, depending on your bank, and your balance is credited as soon as we see the payment.
        Paying by card is instant.
      </p>
    </form>
  );
}
