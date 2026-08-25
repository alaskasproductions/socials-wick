"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { importProviderServicesAction } from "@/lib/actions/provider";
import type { ProviderService } from "@/lib/providers/morethanpanel";

const PAGE_SIZE = 50;

export default function ImportServicesForm({ services }: { services: ProviderService[] }) {
  const [state, formAction, pending] = useActionState(importProviderServicesAction, undefined);
  const [query, setQuery] = useState("");
  const [markup, setMarkup] = useState(30);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? services.filter(
          (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
        )
      : services;
    // Unfiltered, the provider returns services in a fairly arbitrary order —
    // sort by category then name so browsing without a search term is
    // actually navigable instead of a random slice of 4000+ services.
    return [...matches].sort(
      (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  }, [services, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  // Jump back to page 1 whenever the search term changes, instead of
  // silently landing on an out-of-range page for the new result set.
  useEffect(() => {
    setPage(0);
  }, [query]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services or categories…"
          className="flex-1 min-w-[200px] rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          Markup %
          <input
            name="markupPercent"
            type="number"
            value={markup}
            onChange={(e) => setMarkup(Number(e.target.value))}
            className="w-20 rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-2 py-1 text-sm focus:border-brand focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Importing…" : "Import Selected"}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {filtered.length} service{filtered.length === 1 ? "" : "s"} match
          {filtered.length === 1 ? "es" : ""}
          {filtered.length > 0 && ` — page ${currentPage + 1} of ${pageCount}`}
        </p>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl glass">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-2 text-slate-400">
            <tr>
              <th className="px-4 py-2" />
              <th className="px-4 py-2 font-medium">Service</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Cost / 1000</th>
              <th className="px-4 py-2 font-medium">Sell / 1000</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pageItems.map((s) => {
              const sell = Math.round(Number(s.rate) * (1 + markup / 100) * 100) / 100;
              return (
                <tr key={s.service}>
                  <td className="px-4 py-2">
                    <input type="checkbox" name="service" value={s.service} />
                  </td>
                  <td className="px-4 py-2 text-foreground">{s.name}</td>
                  <td className="px-4 py-2 text-slate-400">{s.category}</td>
                  <td className="px-4 py-2 text-slate-400">€{Number(s.rate).toFixed(2)}</td>
                  <td className="px-4 py-2 font-semibold text-brand">€{sell.toFixed(2)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No services match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-xs text-slate-400">
            Page {currentPage + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </form>
  );
}
