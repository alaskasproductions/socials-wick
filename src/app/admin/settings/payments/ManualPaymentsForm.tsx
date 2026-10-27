"use client";

import { useActionState } from "react";
import { saveManualPaymentsAction } from "@/lib/actions/settings";

const input =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none";
const label = "text-sm font-medium text-slate-200";

export default function ManualPaymentsForm({ values }: { values: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveManualPaymentsAction, undefined);
  const v = (key: string) => values[key] ?? "";

  return (
    <form action={formAction} className="space-y-6" autoComplete="off">
      {state?.error && <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <p className="text-xs text-slate-400">
        Bank transfer is settled by hand: the customer sees these details and a payment reference, sends
        the money, and you approve the request in Fund Requests once it arrives. Without an IBAN saved it
        is never offered.
      </p>

      {/* ---------- bank transfer ---------- */}
      <div className="space-y-3 rounded-xl border border-white/10 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <input type="checkbox" name="bankEnabled" defaultChecked={v("manual.bank.enabled") === "true"} className="h-4 w-4" />
          Bank transfer
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Account holder</label>
            <input name="accountHolder" defaultValue={v("manual.bank.accountHolder")} autoComplete="off" placeholder="TKOCY LTD" className={input} />
          </div>
          <div>
            <label className={label}>Bank name</label>
            <input name="bankName" defaultValue={v("manual.bank.bankName")} autoComplete="off" placeholder="Bank of Cyprus" className={input} />
          </div>
          <div>
            <label className={label}>IBAN</label>
            <input name="iban" defaultValue={v("manual.bank.iban")} autoComplete="off" placeholder="CY00 0000 0000 0000 0000 0000 0000" className={input} />
          </div>
          <div>
            <label className={label}>BIC / SWIFT</label>
            <input name="bic" defaultValue={v("manual.bank.bic")} autoComplete="off" placeholder="BCYPCY2N" className={input} />
          </div>
        </div>
        <div>
          <label className={label}>Extra instructions</label>
          <textarea
            name="bankNotes"
            rows={2}
            defaultValue={v("manual.bank.notes")}
            className={input}
            placeholder="Transfers usually arrive within 1 working day. Your balance is credited as soon as we see the payment."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Bank Transfer Details"}
      </button>
    </form>
  );
}
