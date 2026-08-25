"use client";

import { useActionState } from "react";
import { createCategoryAction } from "@/lib/actions/admin";

export default function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}
      <div>
        <label className="text-sm font-medium text-slate-200">Category Name</label>
        <input
          name="name"
          required
          placeholder="e.g. Instagram"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create Category"}
      </button>
    </form>
  );
}
