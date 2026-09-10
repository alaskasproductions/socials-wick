"use client";

import { TIERS } from "@/lib/catalog";
import type { StoreService } from "@/lib/packages";

/** Pills to choose between the services (quality tiers) offered for one type. */
export default function QualityPicker({
  options,
  selectedId,
  onSelect,
  compact = false,
}: {
  options: StoreService[];
  selectedId: string;
  onSelect: (service: StoreService) => void;
  compact?: boolean;
}) {
  if (options.length <= 1) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "justify-center"}`}>
      {options.map((s) => {
        const t = TIERS[s.tier];
        const active = s.id === selectedId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            title={s.name}
            className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
              active
                ? "border-brand bg-brand/15 text-foreground"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <span className={`rounded-full px-2 py-0.5 font-semibold ${t.className}`}>
              {t.dot ? `${t.dot} ${t.label}` : t.label}
            </span>
            <span className="ml-2 font-semibold text-emerald-400">€{s.rate.toFixed(2)}</span>
            <span className="text-slate-500"> / 1000</span>
            {!compact && (
              <span className="mt-1 block max-w-[260px] truncate text-[11px] text-slate-400">{s.name}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
