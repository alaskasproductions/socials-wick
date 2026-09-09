"use client";

import { useMemo, useState } from "react";
import {
  PLATFORMS,
  SERVICE_KINDS,
  TIERS,
  displayName,
  platformOf,
  tierOf,
  type PlatformKey,
  type ServiceKindKey,
  type Tier,
} from "@/lib/catalog";
import CategorizationModal from "./CategorizationModal";
import type { CatalogCategory } from "./NewOrderWorkspace";

type TierTab = "all" | Tier;

const TIER_TABS: { key: TierTab; label: string }[] = [
  { key: "all", label: "All Services" },
  { key: "elite", label: "🔵 Elite" },
  { key: "medium", label: "🟢 Medium" },
  { key: "basic", label: "🟡 Basic" },
  { key: "standard", label: "Standard" },
];

export default function ServiceBrowser({
  categories,
  selectedServiceId,
  onPick,
}: {
  categories: CatalogCategory[];
  selectedServiceId: string;
  onPick: (categoryId: string, serviceId: string) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tier, setTier] = useState<TierTab>("all");
  const [platform, setPlatform] = useState<PlatformKey | "all">("all");
  const [kind, setKind] = useState<ServiceKindKey | "all">("all");
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const decorated = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        tier: tierOf(c.name),
        platform: platformOf(c.name),
        label: displayName(c.name),
      })),
    [categories]
  );

  const platformCounts = useMemo(() => {
    const counts = new Map<PlatformKey, number>();
    for (const c of decorated) counts.set(c.platform, (counts.get(c.platform) ?? 0) + 1);
    return counts;
  }, [decorated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const kindMatcher = kind === "all" ? null : SERVICE_KINDS.find((k) => k.key === kind)?.match;
    return decorated
      .filter((c) => tier === "all" || c.tier === tier)
      .filter((c) => platform === "all" || c.platform === platform)
      .map((c) => {
        const services = c.services.filter((s) => {
          const hay = `${c.label} ${displayName(s.name)} ${s.description ?? ""}`;
          if (kindMatcher && !kindMatcher.test(hay)) return false;
          if (q && !hay.toLowerCase().includes(q)) return false;
          return true;
        });
        return { ...c, services };
      })
      .filter((c) => c.services.length > 0);
  }, [decorated, tier, platform, kind, query]);

  const totalServices = filtered.reduce((n, c) => n + c.services.length, 0);
  const searching = query.trim().length > 0;

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-w-0 space-y-3">
      {/* Legend card */}
      <div className="glass flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand/20 text-sm text-brand">🎨</span>
          SocialsWick Service Color Categorization System
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(["basic", "medium", "elite"] as Tier[]).map((t) => (
            <span key={t} className={`rounded-full px-2.5 py-1 font-semibold ${TIERS[t].className}`}>
              {TIERS[t].dot} {TIERS[t].label}
            </span>
          ))}
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            See Details →
          </button>
        </div>
      </div>

      {/* Tier tabs */}
      <div className="flex flex-wrap gap-2">
        {TIER_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTier(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tier === t.key
                ? "bg-brand text-white"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Platform chips + kind filter + search */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPlatform("all")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            platform === "all" ? "bg-white/15 text-foreground" : "bg-white/5 text-slate-400 hover:text-foreground"
          }`}
        >
          All platforms
        </button>
        {PLATFORMS.filter((p) => platformCounts.get(p.key)).map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPlatform(p.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              platform === p.key ? "bg-white/15 text-foreground" : "bg-white/5 text-slate-400 hover:text-foreground"
            }`}
          >
            {p.icon} {p.label}
            <span className="ml-1 text-slate-500">{platformCounts.get(p.key)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as ServiceKindKey | "all")}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        >
          <option value="all">Filter: any service type</option>
          {SERVICE_KINDS.map((k) => (
            <option key={k.key} value={k.key}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services…"
          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
      </div>

      <p className="text-xs text-slate-500">
        {filtered.length} categor{filtered.length === 1 ? "y" : "ies"} · {totalServices} service
        {totalServices === 1 ? "" : "s"}
      </p>

      {/* Category accordions */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="rounded-lg bg-white/5 px-4 py-6 text-center text-sm text-slate-500">
            Nothing matches these filters.
          </p>
        )}
        {filtered.map((c) => {
          const isOpen = searching || openIds.has(c.id);
          const t = TIERS[c.tier];
          return (
            <div key={c.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-semibold text-slate-100 hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  {t.dot && <span>{t.dot}</span>}
                  <span>{c.label}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                    {c.services.length}
                  </span>
                </span>
                <span className={`text-slate-500 transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
              </button>
              {isOpen && (
                <div className="overflow-x-auto border-t border-white/10">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-black/20 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-2 font-medium">Service</th>
                        <th className="px-4 py-2 font-medium">Rate / 1000</th>
                        <th className="px-4 py-2 font-medium">Min</th>
                        <th className="px-4 py-2 font-medium">Max</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {c.services.map((s) => {
                        const active = s.id === selectedServiceId;
                        return (
                          <tr key={s.id} className={active ? "bg-brand/10" : undefined}>
                            <td className="px-4 py-2.5 text-slate-200">
                              <div>{displayName(s.name)}</div>
                              {s.description && (
                                <details className="mt-1">
                                  <summary className="cursor-pointer text-xs text-brand hover:underline">
                                    Description
                                  </summary>
                                  <p className="mt-1 whitespace-pre-line text-xs text-slate-400">
                                    {displayName(s.description)}
                                  </p>
                                </details>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 font-semibold text-brand">
                              €{s.rate.toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-slate-400">{s.min.toLocaleString("de-DE")}</td>
                            <td className="px-4 py-2.5 text-slate-400">{s.max.toLocaleString("de-DE")}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => onPick(c.id, s.id)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                  active
                                    ? "bg-brand text-white"
                                    : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                                }`}
                              >
                                {active ? "Selected" : "Order"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CategorizationModal open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </div>
  );
}
