"use client";

import { useActionState } from "react";
import { saveVivaSettingsAction } from "@/lib/actions/settings";

export default function VivaSettingsForm({
  enabled,
  env,
  sourceCode,
  hasClientId,
  hasClientSecret,
  hasWebhookKey,
}: {
  enabled: boolean;
  env: "demo" | "production";
  sourceCode: string;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasWebhookKey: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveVivaSettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4" />
        Enabled — show "Pay with Card via Viva Wallet" on the Add Funds page
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">Environment</label>
          <select
            name="env"
            defaultValue={env}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          >
            <option value="demo">Demo / Sandbox</option>
            <option value="production">Production / Live</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Source Code</label>
          <input
            name="sourceCode"
            defaultValue={sourceCode}
            placeholder="4-digit payment source code"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Client ID {hasClientId && <span className="text-xs text-green-400">(saved)</span>}
        </label>
        <input
          name="clientId"
          placeholder={hasClientId ? "•••••••••••••••• — leave blank to keep" : "Smart Checkout Client ID"}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Client Secret {hasClientSecret && <span className="text-xs text-green-400">(saved)</span>}
        </label>
        <input
          name="clientSecret"
          type="password"
          placeholder={hasClientSecret ? "•••••••••••••••• — leave blank to keep" : "Smart Checkout Client Secret"}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Webhook Verification Key {hasWebhookKey && <span className="text-xs text-green-400">(saved)</span>}
        </label>
        <input
          name="webhookVerificationKey"
          type="password"
          placeholder={hasWebhookKey ? "•••••••••••••••• — leave blank to keep" : "From Viva's 'Retrieve webhook key' API"}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          Webhook endpoint to register in Viva:{" "}
          <code className="font-mono text-slate-400">/api/webhooks/viva</code>
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Viva Wallet Settings"}
      </button>
    </form>
  );
}
