"use client";

import { useState } from "react";
import type { PlatformSection } from "@/lib/packages";
import type { CheckoutRequest } from "./CheckoutModal";

export default function PlatformShowcase({
  section,
  onBuy,
}: {
  section: PlatformSection;
  onBuy: (req: CheckoutRequest) => void;
}) {
  const [typeKey, setTypeKey] = useState(section.types[0]?.key ?? "");
  const type = section.types.find((t) => t.key === typeKey) ?? section.types[0];
  if (!type) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16" id={`store-${section.key}`}>
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-3xl">
          {section.icon}
        </div>
        <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          Best <span className="text-brand">{section.label}</span> Panel Services
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
          Grow your {section.label} presence with real, gradual delivery. Pick a service, choose a
          package and pay by card — no account needed.
        </p>
      </div>

      {section.types.length > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            {section.types.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTypeKey(t.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  t.key === type.key ? "bg-brand text-white shadow" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="mr-1.5">{t.icon}</span>
                {section.label} {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <h3 className="mt-10 text-center text-xl font-semibold text-foreground">
        Buy {section.label} <span className="underline decoration-brand decoration-2 underline-offset-4">{type.label}</span>
      </h3>
      <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-slate-500">
        {type.service.name} · from €{type.service.rate.toFixed(2)} per 1000
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {type.packages.map((pkg) => (
          <div
            key={pkg.quantity}
            className={`relative flex flex-col rounded-2xl border p-5 transition hover:-translate-y-1 ${
              pkg.bestOffer
                ? "border-brand bg-brand/10 shadow-[0_0_40px_-10px_var(--brand-glow)]"
                : "border-white/10 bg-white/5"
            }`}
          >
            {pkg.bestOffer && (
              <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[11px] font-bold text-white">
                Best Offer
              </span>
            )}
            <div className="flex items-center justify-between text-xl">
              <span>{type.icon}</span>
              <span>{section.icon}</span>
            </div>
            <div className="mt-6 text-center">
              <div className="text-4xl font-extrabold text-foreground">{pkg.quantity.toLocaleString("en-US")}</div>
              <div className="mt-1 text-sm text-slate-400">
                {section.label} {type.label}
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-slate-500 line-through">€{pkg.compareAt.toFixed(2)}</span>
              <span className="text-2xl font-extrabold text-emerald-400">€{pkg.price.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={() => onBuy({ platform: section.key, typeKey: type.key, quantity: pkg.quantity })}
              className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide text-white ${
                pkg.bestOffer ? "bg-brand hover:bg-brand-dark" : "bg-black hover:bg-black/70"
              }`}
            >
              Buy now <span>›</span>
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              You&apos;re saving <span className="font-semibold text-red-400">€{pkg.saving.toFixed(2)}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
