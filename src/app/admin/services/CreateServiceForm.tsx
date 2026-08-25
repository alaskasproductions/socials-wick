"use client";

import { useActionState } from "react";
import { createServiceAction } from "@/lib/actions/admin";

type Category = { id: string; name: string };

export default function CreateServiceForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createServiceAction, undefined);

  if (categories.length === 0) {
    return (
      <p className="text-sm text-slate-400">Create a category first before adding services.</p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">Category</label>
        <select
          name="categoryId"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Service Name</label>
        <input
          name="name"
          required
          placeholder="e.g. Instagram Followers [Real]"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Description</label>
        <textarea
          name="description"
          rows={2}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-200">Rate / 1000</label>
          <input
            name="rate"
            type="number"
            step="0.01"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Min</label>
          <input
            name="min"
            type="number"
            defaultValue={100}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Max</label>
          <input
            name="max"
            type="number"
            defaultValue={100000}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create Service"}
      </button>
    </form>
  );
}
