"use client";

import { useEffect } from "react";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "🟡 What is BASIC?",
    body: "Basic is our entry-level tier: the lowest prices in the catalog, delivered by automated sources of modest quality. Results are usually fine for building up numbers quickly, but counts can fall back over time and delivery speed may vary. Basic services come without any refill or stability guarantee — choose them when budget matters more than retention.",
  },
  {
    title: "🟢 What is MEDIUM?",
    body: "Medium is the balanced middle ground between price and dependability. These services have been checked for retention and behave far more naturally than Basic ones, so your growth looks steady rather than sudden. Refill coverage varies from service to service (it depends on how each one is sourced), so always check the individual service description — but every Medium option has passed our quality review.",
  },
  {
    title: "🔵 What is ELITE?",
    body: "Elite is our top tier. Engagement comes from organic, real-user methods, which is why these services stay stable with no drops and often bring additional genuine interaction to your content. They are the most expensive option and, for accounts that care about long-term quality, the one we recommend.",
  },
  {
    title: "What is Drip-Feed?",
    body: "With Drip-Feed the ordered quantity is released in smaller portions spread across several runs, instead of arriving in one burst. The result is a steadier, more organic-looking growth curve.",
  },
  {
    title: "What are Power Services?",
    body: "Power Services prioritise speed: they can deliver far more per day than a standard service. Pick them when you need a large quantity completed in a short time.",
  },
  {
    title: "What are Slow Services?",
    body: "Slow Services deliberately cap the daily speed so an order completes over a longer period. They suit accounts that want growth to look measured and controlled.",
  },
  {
    title: "What are VIP Services?",
    body: "VIP marks the highest-quality option inside a category. Delivery comes from accounts owned by real people, which makes VIP the premium pick when quality outweighs price.",
  },
  {
    title: "What are Non-Drop Services?",
    body: "Non-Drop Services are built to keep what they deliver — a 0% drop rate that holds even when the platform pushes updates. Choose them when retention and stability are your priority.",
  },
  {
    title: "What is Split Delivery?",
    body: "Split Delivery shares one order across a number of your most recent posts rather than concentrating everything on a single post. You choose the quantity; the service divides it between those posts.",
  },
  {
    title: "What are Influencer Services?",
    body: "Influencer Services are sourced entirely from real, organic users. They are the right choice when authenticity and genuine activity on your content matter most.",
  },
  {
    title: "What is a Growth Package?",
    body: "A Growth Package bundles several types of engagement into a single coordinated campaign, so you don't have to order followers, likes and views separately. Packages are designed to grow a profile or a piece of content in a balanced way.",
  },
  {
    title: "What are Monetization Services?",
    body: "Monetization Services target the metrics platforms look at before unlocking earnings — views, watch time, subscribers and similar thresholds. They help you reach the numbers; whether an account is approved for monetization is always the platform's decision.",
  },
  {
    title: "What are Future Services?",
    body: "Future Services attach to content you publish after the order is placed: each new post automatically receives the chosen service. Ideal for regular posters who want continuous delivery without ordering every time.",
  },
  {
    title: "What are High Retention Services?",
    body: "High Retention Services keep their engagement in place noticeably longer than standard ones. For view services it can also mean viewers watch for a set minimum duration, depending on the specific service.",
  },
  {
    title: "What are Old Account Services?",
    body: "Old Account Services deliver from aged accounts with an established history instead of freshly created ones — a better fit if you prefer engagement that looks seasoned.",
  },
  {
    title: "What are Gradual Services?",
    body: "Gradual Services ramp up step by step instead of spiking all at once, so the new activity blends in with the engagement your content already receives.",
  },
];

export default function CategorizationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="categorization-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0b1a] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 id="categorization-title" className="text-base font-bold text-foreground">
            SocialsWick Service Color Categorization System
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 hover:bg-white/10 hover:text-foreground"
          >
            ×
          </button>
        </div>
        <div className="space-y-2 overflow-y-auto px-5 py-4">
          {SECTIONS.map((s, i) => (
            <details
              key={s.title}
              open={i === 0}
              className="group rounded-lg border border-white/10 bg-white/5 open:bg-white/[0.07]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-100 marker:hidden">
                <span>{s.title}</span>
                <span className="text-slate-500 transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-slate-300">{s.body}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
