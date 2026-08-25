"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/provider";

export default function SyncButton({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex items-center gap-3">
      {state?.success && <span className="text-sm text-green-400">{state.success}</span>}
      {state?.error && <span className="text-sm text-red-400">{state.error}</span>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Syncing…" : "Sync Pending Orders"}
      </button>
    </form>
  );
}
