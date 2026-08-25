"use client";

import { useActionState } from "react";
import { requestFundsAction } from "@/lib/actions/customer";

const METHODS = ["Bank Transfer", "PayPal", "UPI", "Crypto"];

export default function AddFundsForm() {
  const [state, formAction, pending] = useActionState(requestFundsAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">Amount (€)</label>
        <input
          name="amount"
          type="number"
          min={1}
          step="0.01"
          required
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Payment Method</label>
        <select
          name="method"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Fund Request"}
      </button>
      <p className="text-xs text-slate-500">
        For alternative payment methods. An admin reviews and approves these manually, so it can
        take a little longer than paying by card.
      </p>
    </form>
  );
}
