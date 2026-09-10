"use client";

import { useMemo, useState, useActionState, useTransition } from "react";
import { importProviderServicesAction, saveMarkupAction } from "@/lib/actions/provider";
import type { ProviderService } from "@/lib/providers/morethanpanel";
import { PLATFORMS, platformOf, type PlatformKey } from "@/lib/catalog";

const PAGE_SIZE = 50;

export default function ImportServicesForm({
  services,
  defaultMarkup,
  importedIds,
}: {
  services: ProviderService[];
  defaultMarkup: number;
  importedIds: string[];
}) {
  const imported = useMemo(() => new Set(importedIds), [importedIds]);
  const [showImported, setShowImported] = useState(false);
  const [platform, setPlatform] = useState<PlatformKey | "all">("all");
  const [category, setCategory] = useState("all");

  // Platform of each provider service, from its category + name keywords.
  const platformById = useMemo(() => {
    const m = new Map<string, PlatformKey>();
    for (const s of services) m.set(String(s.service), platformOf(`${s.category} ${s.name}`));
    return m;
  }, [services]);
  const platformCounts = useMemo(() => {
    const counts = new Map<PlatformKey, number>();
    for (const s of services) {
      const p = platformById.get(String(s.service)) ?? "other";
      counts.set(p, (counts.get(p) ?? 0) + 1);
    }
    return counts;
  }, [services, platformById]);
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      if (platform === "all" || platformById.get(String(s.service)) === platform) set.add(s.category);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [services, platform, platformById]);
  const [state, formAction, pending] = useActionState(importProviderServicesAction, undefined);
  const [query, setQuery] = useState("");
  // Prefilled with the saved markup; only changes when the admin edits it.
  const [markup, setMarkup] = useState(defaultMarkup);
  const [savedMarkup, setSavedMarkup] = useState(defaultMarkup);
  const [markupMsg, setMarkupMsg] = useState<string | null>(null);
  const [savingMarkup, startSavingMarkup] = useTransition();
  const markupDirty = markup !== savedMarkup;

  function saveMarkup() {
    startSavingMarkup(async () => {
      const fd = new FormData();
      fd.set("markupPercent", String(markup));
      const result = await saveMarkupAction(undefined, fd);
      if (result?.error) {
        setMarkupMsg(result.error);
      } else {
        setSavedMarkup(markup);
        setMarkupMsg(result?.success ?? "Saved.");
      }
    });
  }
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Services already in the catalog leave the import list; the toggle brings
    // them back (re-importing one refreshes its provider rate and price).
    const pool = services
      .filter((s) => showImported || !imported.has(String(s.service)))
      .filter((s) => platform === "all" || platformById.get(String(s.service)) === platform)
      .filter((s) => category === "all" || s.category === category);
    const matches = q
      ? pool.filter(
          (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
        )
      : pool;
    // Unfiltered, the provider returns services in a fairly arbitrary order —
    // sort by category then name so browsing without a search term is
    // actually navigable instead of a random slice of 4000+ services.
    return [...matches].sort(
      (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  }, [services, query, showImported, imported, platform, category, platformById]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);


  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setPlatform("all");
            setCategory("all");
            setPage(0);
          }}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            platform === "all" ? "bg-brand text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          All platforms
        </button>
        {PLATFORMS.filter((p) => platformCounts.get(p.key)).map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              setPlatform(p.key);
              setCategory("all");
              setPage(0);
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              platform === p.key ? "bg-brand text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {p.icon} {p.label}
            <span className="ml-1 opacity-70">{platformCounts.get(p.key)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="max-w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none sm:max-w-md"
        >
          <option value="all">All categories ({categoryOptions.length})</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Jump back to page 1 whenever the search term changes, instead of
            // silently landing on an out-of-range page for the new result set.
            setPage(0);
          }}
          placeholder="Search services or categories…"
          className="flex-1 min-w-[200px] rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          Markup %
          <input
            name="markupPercent"
            type="number"
            min={0}
            max={1000}
            step="0.5"
            value={markup}
            onChange={(e) => {
              setMarkup(Number(e.target.value));
              setMarkupMsg(null);
            }}
            className="w-20 rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-2 py-1 text-sm focus:border-brand focus:outline-none"
          />
          <button
            type="button"
            onClick={saveMarkup}
            disabled={savingMarkup || !markupDirty}
            title={markupDirty ? "Remember this markup for next time" : "Markup is saved"}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
          >
            {savingMarkup ? "Saving…" : markupDirty ? "Save" : "Saved"}
          </button>
          {markupMsg && <span className="text-xs text-slate-400">{markupMsg}</span>}
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-500">
            {filtered.length} service{filtered.length === 1 ? "" : "s"} match
            {filtered.length === 1 ? "es" : ""}
            {filtered.length > 0 && ` — page ${currentPage + 1} of ${pageCount}`}
          </p>
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={showImported}
              onChange={(e) => setShowImported(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Show already imported ({imported.size})
          </label>
        </div>
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
                    {imported.has(String(s.service)) && (
                      <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        Imported
                      </span>
                    )}
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
