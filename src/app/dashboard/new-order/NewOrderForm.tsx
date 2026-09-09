"use client";

import { useMemo, useState, useActionState } from "react";
import { placeOrderAction } from "@/lib/actions/customer";
import { TIERS, displayName, tierOf } from "@/lib/catalog";
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

  const category = categories.find((c) => c.id === categoryId);
  const services = useMemo(() => category?.services ?? [], [category]);
  const service = services.find((s) => s.id === serviceId);
  const charge = service ? ((quantity || 0) / 1000) * service.rate : 0;
  const tier = category ? TIERS[tierOf(category.name)] : null;

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
            <option key={s.id} value={s.id}>
              {displayName(s.name)} — €{s.rate.toFixed(2)} / 1000
            </option>
          ))}
        </select>
        {service && (
          <p className="mt-1 text-xs text-slate-400">
            Min: {service.min.toLocaleString("de-DE")} · Max: {service.max.toLocaleString("de-DE")}
          </p>
        )}
        {service?.description && (
          <details className="mt-1">
            <summary className="cursor-pointer text-xs text-brand hover:underline">Service description</summary>
            <p className="mt-1 whitespace-pre-line text-xs text-slate-400">{displayName(service.description)}</p>
          </details>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Link</label>
        <input
          name="link"
          type="url"
          required
          placeholder="https://instagram.com/yourprofile"
          className={inputClass}
        />
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
