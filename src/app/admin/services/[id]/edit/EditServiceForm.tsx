"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateServiceAction } from "@/lib/actions/admin";

type Category = { id: string; name: string };
type Service = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  rate: number;
  min: number;
  max: number;
  providerServiceId: string | null;
};

export default function EditServiceForm({
  service,
  categories,
}: {
  service: Service;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(updateServiceAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={service.id} />

      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}

      {service.providerServiceId && (
        <p className="rounded-lg bg-blue-500/15 px-4 py-2 text-xs text-blue-400">
          Sourced from MoreThanPanel (service #{service.providerServiceId}). Editing the rate here
          overrides the imported price until it's re-imported.
        </p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">Category</label>
        <select
          name="categoryId"
          defaultValue={service.categoryId}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
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
          defaultValue={service.name}
          required
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Description</label>
        <textarea
          name="description"
          defaultValue={service.description}
          rows={2}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-200">Rate / 1000 (€)</label>
          <input
            name="rate"
            type="number"
            step="0.01"
            defaultValue={service.rate}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Min</label>
          <input
            name="min"
            type="number"
            defaultValue={service.min}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Max</label>
          <input
            name="max"
            type="number"
            defaultValue={service.max}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
        <Link
          href="/admin/services"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
