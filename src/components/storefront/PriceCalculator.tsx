"use client";

import { useMemo, useState } from "react";
import { priceFor, type PlatformSection, type StoreService } from "@/lib/packages";
import QualityPicker from "./QualityPicker";
import type { PlatformKey } from "@/lib/catalog";
import type { CheckoutRequest } from "./CheckoutModal";

export default function PriceCalculator({
  sections,
  onPurchase,
}: {
  sections: PlatformSection[];
  onPurchase: (req: CheckoutRequest) => void;
}) {
  const [platform, setPlatform] = useState<PlatformKey>(sections[0]?.key ?? "instagram");
  const section = useMemo(() => sections.find((s) => s.key === platform) ?? sections[0], [sections, platform]);
  const [typeKey, setTypeKey] = useState(section?.types[0]?.key ?? "");
  const type = section?.types.find((t) => t.key === typeKey) ?? section?.types[0];
  const [chosen, setChosen] = useState<Record<string, string>>({}); // "platform:type" -> serviceId
  const chosenKey = section && type ? `${section.key}:${type.key}` : "";
  const service: StoreService | undefined =
    type?.options.find((o) => o.id === chosen[chosenKey]) ?? type?.service;

  if (!section || !type || !service) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16" id="price-calculator">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          <span className="text-brand">Price Calculator</span> for SMM Services
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
          Find out the cost of the service you need in seconds — fast, practical and transparent.
        </p>
      </div>

      <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
        <p className="text-sm font-semibold text-foreground">Platform</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sections.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setPlatform(s.key)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                s.key === section.key
                  ? "border-brand bg-brand text-white"
                  : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm font-semibold text-foreground">Services</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {section.types.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTypeKey(t.key)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                t.key === type.key
                  ? "border-brand bg-brand text-white"
                  : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {type.options.length > 1 && (
          <>
            <p className="mt-6 text-sm font-semibold text-foreground">Quality</p>
            <div className="mt-3">
              <QualityPicker
                options={type.options}
                selectedId={service.id}
                onSelect={(s) => setChosen((c) => ({ ...c, [chosenKey]: s.id }))}
                compact
              />
            </div>
          </>
        )}

        <QuantityPicker
          key={service.id}
          service={service}
          onPurchase={(quantity) =>
            onPurchase({ platform: section.key, typeKey: type.key, quantity, serviceId: service.id })
          }
        />
      </div>
    </section>
  );
}

function QuantityPicker({
  service,
  onPurchase,
}: {
  service: StoreService;
  onPurchase: (quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(
    service.min >= 1000 ? service.min : Math.min(service.max, 1000)
  );
  const step = service.min >= 1000 ? 1000 : Math.max(10, Math.min(100, service.min));
  const sliderMax = Math.min(service.max, Math.max(service.min * 100, 100000));
  const price = priceFor(service.rate, quantity);
  const percent = sliderMax > service.min ? ((quantity - service.min) / (sliderMax - service.min)) * 100 : 0;

  return (
    <>
      <div className="mt-10">
        <div className="relative h-8">
          <div
            className="absolute -top-1 -translate-x-1/2 rounded-lg bg-red-500 px-3 py-1 text-sm font-bold text-white shadow"
            style={{ left: `calc(${percent}% + ${12 - percent * 0.24}px)` }}
          >
            {quantity.toLocaleString("en-US")}
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-red-500" />
          </div>
        </div>
        <input
          type="range"
          min={service.min}
          max={sliderMax}
          step={step}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--brand)]"
          aria-label="Quantity"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>{service.min.toLocaleString("en-US")}</span>
          <span>{sliderMax.toLocaleString("en-US")}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4">
        <span className="text-sm font-semibold text-slate-200">Price:</span>
        <span className="text-2xl font-extrabold text-red-400">€{price.toFixed(2)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {service.name} · €{service.rate.toFixed(2)} per 1000
      </p>

      <button
        type="button"
        onClick={() => onPurchase(quantity)}
        className="mt-4 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white hover:bg-brand-dark"
      >
        Purchase
      </button>
    </>
  );
}
