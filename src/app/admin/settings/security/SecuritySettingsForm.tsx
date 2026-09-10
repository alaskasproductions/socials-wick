"use client";

import { useActionState } from "react";
import { saveSecuritySettingsAction } from "@/lib/actions/settings";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none";

export default function SecuritySettingsForm({
  siteKey,
  hasSecretKey,
}: {
  siteKey: string;
  hasSecretKey: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveSecuritySettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-4" autoComplete="off">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">Turnstile Site Key</label>
        <input
          name="turnstileSiteKey"
          defaultValue={siteKey}
          placeholder="0x4AAAAAAA…"
          autoComplete="off"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">Public key — rendered in the widget on the page.</p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Turnstile Secret Key {hasSecretKey && <span className="text-xs text-green-400">(saved)</span>}
        </label>
        <input
          name="turnstileSecretKey"
          type="password"
          autoComplete="new-password"
          placeholder={hasSecretKey ? "•••••••••••••••• — leave blank to keep" : "0x4AAAAAAA…"}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">
          Used server-side only, never sent to the browser. Leave blank to keep the saved key; type
          <code className="mx-1 text-slate-400">clear</code> to remove it and switch Turnstile off.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Security Settings"}
      </button>
    </form>
  );
}
