"use client";

import { useMemo, useState, useActionState } from "react";
import { placeOrderAction } from "@/lib/actions/customer";
import { TIERS, categoryTier, displayName, serviceTier } from "@/lib/catalog";
import { linkRuleFor } from "@/lib/link-rules";
import { buildServiceGuide } from "@/lib/service-guide";
import ServiceGuidePanel from "@/components/ServiceGuidePanel";
import type { CatalogCategory } from "./NewOrderWorkspace";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none";

export default function NewOrderForm({
  categories,
  categoryId,
  serviceId,
  onChange,
}: {
  categories: CatalogCategory[];
  categoryId: string;
  serviceId: string;
  onChange: (categoryId: string, serviceId: string) => void;
}) {
  const [state, formAction, pending] = useActionState(placeOrderAction, undefined);
  const [quantity, setQuantity] = useState(0);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const category = categories.find((c) => c.id === categoryId);
  const services = useMemo(() => category?.services ?? [], [category]);
  const service = services.find((s) => s.id === serviceId);
  const charge = service ? ((quantity || 0) / 1000) * service.rate : 0;
  const tier = category
    ? TIERS[categoryTier(category.name, category.services.map((s) => s.name))]
    : null;
  const selectedTier = service && category ? TIERS[serviceTier(service.name, category.name)] : null;
  const linkRule = service && category ? linkRuleFor(service.name, category.name) : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const problem = linkRule ? linkRule.check(link.trim()) : null;
        if (problem) {
          e.preventDefault();
          setLinkError(problem);
        }
      }}
      className="space-y-4"
    >
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">Category</label>
        <select
          value={categoryId}
          onChange={(e) => {
            const next = categories.find((c) => c.id === e.target.value);
            onChange(e.target.value, next?.services[0]?.id ?? "");
          }}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {displayName(c.name)}
            </option>
          ))}
        </select>
        {tier && tier.dot && (
          <p className="mt-1 text-xs text-slate-400">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${tier.className}`}>
              {tier.dot} {tier.label}
            </span>{" "}
            {tier.description}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Service</label>
        <select
          name="serviceId"
          value={serviceId}
          onChange={(e) => onChange(categoryId, e.target.value)}
          className={inputClass}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id} title={displayName(s.name)}>
              {TIERS[serviceTier(s.name, category?.name ?? "")].dot} €{s.rate.toFixed(2)} · {displayName(s.name)}
            </option>
          ))}
        </select>
        {service && (
          <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-sm font-medium leading-snug text-slate-100">
              {selectedTier?.dot && (
                <span className={`mr-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${selectedTier.className}`}>
                  {selectedTier.dot} {selectedTier.label}
                </span>
              )}
              {displayName(service.name)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              <span className="font-semibold text-brand">€{service.rate.toFixed(2)}</span> per 1000 · Min{" "}
              {service.min.toLocaleString("de-DE")} · Max {service.max.toLocaleString("de-DE")}
            </p>
          </div>
        )}
        {service && category && (
          <div className="mt-3">
            <ServiceGuidePanel
              guide={buildServiceGuide({
                name: service.name,
                categoryName: category.name,
                min: service.min,
                max: service.max,
              })}
              adminText={service.description ? displayName(service.description) : undefined}
            />
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          {linkRule?.target ?? "Link"}
          {linkRule && (
            <span
              title={linkRule.hint}
              className="grid h-4 w-4 cursor-help place-items-center rounded-full bg-amber-400 text-[10px] font-bold text-black"
            >
              i
            </span>
          )}
        </label>
        <input
          name="link"
          type="url"
          required
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setLinkError(null);
          }}
          placeholder={linkRule?.placeholder ?? "https://…"}
          className={inputClass}
        />
        {linkRule && (
          <p className={`mt-1 text-xs ${linkRule.level === "post" ? "text-amber-300" : "text-slate-400"}`}>
            {linkRule.level === "post" ? "⚠️ " : ""}
            {linkRule.hint}
          </p>
        )}
        {linkError && (
          <p className="mt-1 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-400">{linkError}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Quantity</label>
        <input
          name="quantity"
          type="number"
          required
          min={service?.min}
          max={service?.max}
          value={quantity || ""}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={inputClass}
        />
      </div>

      <div className="rounded-lg bg-brand/10 px-4 py-3 text-sm font-semibold text-brand">
        Estimated Charge: €{charge.toFixed(2)}
      </div>

      <button
        type="submit"
        disabled={pending || !service}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Placing order…" : "Place Order"}
      </button>
    </form>
  );
}
