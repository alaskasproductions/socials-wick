"use client";

import { useActionState } from "react";
import { saveMtpSettingsAction } from "@/lib/actions/settings";

export default function MtpSettingsForm({
  apiUrl,
  hasApiKey,
}: {
  apiUrl: string;
  hasApiKey: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveMtpSettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
          {state.success}
        </p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">API URL</label>
        <input
          name="apiUrl"
          defaultValue={apiUrl}
          placeholder="https://morethanpanel.com/api/v2"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          API Key {hasApiKey && <span className="text-xs text-green-400">(saved)</span>}
        </label>
        <input
          name="apiKey"
          type="password"
          placeholder={hasApiKey ? "•••••••••••••••• — leave blank to keep" : "Your MoreThanPanel API key"}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          Found in your{" "}
          <a
            href="https://morethanpanel.com/api"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:underline"
          >
            MoreThanPanel account
          </a>{" "}
          under API settings.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save API Settings"}
      </button>
    </form>
  );
}
