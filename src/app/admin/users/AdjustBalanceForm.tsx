"use client";

import { useActionState } from "react";
import { adjustUserBalanceAction } from "@/lib/actions/admin";

export default function AdjustBalanceForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(adjustUserBalanceAction, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={userId} />
      <input
        name="amount"
        type="number"
        step="0.01"
        placeholder="+/- amount"
        required
        className="w-28 rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        Apply
      </button>
      {state?.error && <span className="text-xs text-red-400">{state.error}</span>}
    </form>
  );
}
