"use client";

import { useActionState } from "react";
import { saveTawkToSettingsAction } from "@/lib/actions/settings";

export default function TawkToSettingsForm({
  enabled,
  propertyId,
  widgetId,
}: {
  enabled: boolean;
  propertyId: string;
  widgetId: string;
}) {
  const [state, formAction, pending] = useActionState(saveTawkToSettingsAction, undefined);

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

      <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4" />
        Enabled — show the live chat widget on the site
      </label>

      <div>
        <label className="text-sm font-medium text-slate-200">Property ID</label>
        <input
          name="propertyId"
          defaultValue={propertyId}
          placeholder="e.g. 60f1a2b3c4d5e6f7a8b9c0d1"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Widget ID</label>
        <input
          name="widgetId"
          defaultValue={widgetId}
          placeholder="default"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Live Chat Settings"}
      </button>
    </form>
  );
}
