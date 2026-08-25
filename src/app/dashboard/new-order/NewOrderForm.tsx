"use client";

import { useMemo, useState, useActionState } from "react";
import { placeOrderAction } from "@/lib/actions/customer";

type Service = {
  id: string;
  name: string;
  rate: number;
  min: number;
  max: number;
};

type Category = {
  id: string;
  name: string;
  services: Service[];
};

export default function NewOrderForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(placeOrderAction, undefined);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(categories[0]?.services[0]?.id ?? "");
  const [quantity, setQuantity] = useState(0);

  const services = useMemo(
    () => categories.find((c) => c.id === categoryId)?.services ?? [],
    [categories, categoryId]
  );
  const service = services.find((s) => s.id === serviceId);
  const charge = service ? ((quantity || 0) / 1000) * service.rate : 0;

  if (categories.length === 0) {
    return <p className="text-slate-400">No services are available yet. Please check back later.</p>;
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
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            const first = categories.find((c) => c.id === e.target.value)?.services[0];
            setServiceId(first?.id ?? "");
          }}
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
        <label className="text-sm font-medium text-slate-200">Service</label>
        <select
          name="serviceId"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — €{s.rate.toFixed(2)} / 1000
            </option>
          ))}
        </select>
        {service && (
          <p className="mt-1 text-xs text-slate-400">
            Min: {service.min} · Max: {service.max}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200">Link</label>
        <input
          name="link"
          type="url"
          required
          placeholder="https://instagram.com/yourprofile"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
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
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div className="rounded-lg bg-brand/10 px-4 py-3 text-sm font-semibold text-brand">
        Estimated Charge: €{charge.toFixed(2)}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Placing order…" : "Place Order"}
      </button>
    </form>
  );
}
