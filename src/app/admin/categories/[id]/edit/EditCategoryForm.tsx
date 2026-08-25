"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateCategoryAction } from "@/lib/actions/admin";

export default function EditCategoryForm({
  category,
}: {
  category: { id: string; name: string; slug: string };
}) {
  const [state, formAction, pending] = useActionState(updateCategoryAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={category.id} />

      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">Category Name</label>
        <input
          name="name"
          defaultValue={category.name}
          required
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Slug</label>
        <input
          name="slug"
          defaultValue={category.slug}
          required
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">Used in the public services page URL anchors.</p>
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
          href="/admin/categories"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
