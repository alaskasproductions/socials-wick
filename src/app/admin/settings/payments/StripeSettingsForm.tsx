"use client";

import { useActionState } from "react";
import { saveStripeSettingsAction } from "@/lib/actions/settings";

export default function StripeSettingsForm({
  enabled,
  publishableKey,
  hasSecretKey,
  hasWebhookSecret,
}: {
  enabled: boolean;
  publishableKey: string;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveStripeSettingsAction, undefined);

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
        Enabled — show "Pay with Card via Stripe" on the Add Funds page
      </label>

      <div>
        <label className="text-sm font-medium text-slate-200">Publishable Key</label>
        <input
          name="publishableKey"
          defaultValue={publishableKey}
          placeholder="pk_test_… or pk_live_…"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Secret Key {hasSecretKey && <span className="text-xs text-green-400">(saved)</span>}
        </label>
        <input
          name="secretKey"
          type="password"
          placeholder={hasSecretKey ? "•••••••••••••••• — leave blank to keep" : "sk_test_… or sk_live_…"}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">
          Webhook Signing Secret {hasWebhookSecret && <span className="text-xs text-green-400">(saved)</span>}
        </label>
        <input
          name="webhookSecret"
          type="password"
          placeholder={hasWebhookSecret ? "•••••••••••••••• — leave blank to keep" : "whsec_…"}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          Webhook endpoint to register in Stripe:{" "}
          <code className="font-mono text-slate-400">/api/webhooks/stripe</code> — subscribe to
          the <code className="font-mono text-slate-400">checkout.session.completed</code> event.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Stripe Settings"}
      </button>
    </form>
  );
}
