"use client";

import { useEffect } from "react";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "🟡 What is BASIC?",
    body: "BASIC: our Basic tier offers the most affordable automated services with fairly lower quality. While we strive to provide satisfactory results, there might be occasional drops or slowdowns, and we cannot offer any guarantees for this tier.",
  },
  {
    title: "🟢 What is MEDIUM?",
    body: "MEDIUM: the Medium tier is where quality meets reliability. These services are crafted to provide solid performance and realistic engagement. Whether you're boosting views, followers or any other metric, Medium options are designed for a balanced blend of speed and stability. Some Medium services include refill guarantees, not all do — it depends on the source and delivery method. What you always get is a service that has been tested for quality and retention, offering a more authentic boost without the fluff.",
  },
  {
    title: "🔵 What is ELITE?",
    body: "ELITE: our premium tier offers best-in-class services created through organic methods, ensuring stable and reliable performance. With Elite services you can expect top-notch quality without drops, making it the most expensive but highly worthwhile option for a seamless experience. Elite services can attract 100% organic engagement to your content.",
  },
  {
    title: "What is Drip-Feed?",
    body: "Drip-Feed delivers your order gradually over multiple runs instead of all at once. This creates a more natural and consistent increase in engagement over time.",
  },
  {
    title: "What are Power Services?",
    body: "Power Services are designed for high-speed delivery, offering significantly higher daily delivery capacity than standard services. They are ideal when delivery speed and completing larger quantities in a shorter time are the priority.",
  },
  {
    title: "What are Slow Services?",
    body: "Slow Services operate with a lower daily delivery speed, allowing orders to be completed more gradually over time. They are ideal if you prefer a slower and more controlled delivery pace.",
  },
  {
    title: "What are VIP Services?",
    body: "VIP Services represent the highest-quality options within their category. Delivery is provided through accounts belonging to real users, making them a premium choice if you prioritise overall service quality.",
  },
  {
    title: "What are Non-Drop Services?",
    body: "Non-Drop Services offer a 0% drop rate and are designed to remain stable even during platform updates. They are ideal if you prioritise maximum retention and service stability.",
  },
  {
    title: "What is Split Delivery?",
    body: "Split Delivery distributes the selected quantity across a specified number of your latest posts. Instead of applying the full quantity to a single post, the service splits the delivery between your recent posts.",
  },
  {
    title: "What are Influencer Services?",
    body: "Influencer Services provide engagement from 100% organic, real users. They are ideal if you prioritise authentic engagement and real-user activity.",
  },
  {
    title: "What is a Growth Package?",
    body: "A Growth Package combines multiple services into one coordinated campaign. Instead of purchasing each type of engagement separately, you choose a package designed to support more balanced profile or content growth.",
  },
  {
    title: "What are Monetization Services?",
    body: "Monetization Services help accounts or channels work toward specific platform monetization requirements, such as views, watch time, subscribers or other eligible metrics. Final monetization eligibility is always determined by the platform.",
  },
  {
    title: "What are Future Services?",
    body: "Future Services automatically apply the selected service to new content published after your order is created. They are ideal if you post regularly and want ongoing delivery without placing a separate order for every new post.",
  },
  {
    title: "What are High Retention Services?",
    body: "High Retention Services provide engagement that remains active for longer compared with standard services. For view services, High Retention may also mean viewers stay on the content for a specified amount of time, depending on the service.",
  },
  {
    title: "What are Old Account Services?",
    body: "Old Account Services use aged, established accounts rather than newly created accounts for delivery. They are ideal if you prefer engagement from accounts with an existing history.",
  },
  {
    title: "What are Gradual Services?",
    body: "Gradual Services deliver engagement progressively instead of creating a sudden increase. They are ideal if you want a smoother delivery that better aligns with your existing engagement levels.",
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
