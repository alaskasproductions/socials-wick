"use client";

import { useActionState, useState } from "react";
import { startVivaPaymentAction } from "@/lib/actions/customer";

const PRESETS = [10, 25, 50, 100];

export default function VivaPaymentForm() {
  const [state, formAction, pending] = useActionState(startVivaPaymentAction, undefined);
  const [amount, setAmount] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
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
          placeholder="25.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:border-brand hover:text-brand"
            >
              €{p}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Redirecting to checkout…" : "Pay with Card — via Viva Wallet"}
      </button>
      <p className="text-xs text-slate-500">
        You'll be redirected to Viva Wallet's secure checkout. Your balance is credited
        automatically the moment payment is confirmed.
      </p>
    </form>
  );
}
