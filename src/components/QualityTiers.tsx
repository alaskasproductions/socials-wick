import Link from "next/link";
import Reveal from "@/components/Reveal";

const TIERS = [
  {
    key: "basic",
    badge: "BASIC",
    dot: "🟡",
    title: "Basic Tier – High-Volume & Budget Services",
    tagline: "Maximum volume",
    body: "Our Basic tier is the most affordable way to push numbers up fast: automated delivery at the lowest rates in our catalog, ideal for testing and budget campaigns. Counts can fall back over time and delivery speed may vary, and there is no refill or stability guarantee on this tier.",
    cta: "View Basic services",
    tagClass: "text-amber-400",
    badgeClass: "bg-amber-400 text-black",
    cardClass: "border-amber-400/30 from-amber-400/10",
    buttonClass: "bg-amber-400 text-black hover:bg-amber-300",
  },
  {
    key: "medium",
    badge: "MEDIUM",
    dot: "🟢",
    title: "Medium Tier – Balanced & Reliable Engagement",
    tagline: "Cost-efficient stability",
    body: "Medium is where value meets dependability. These services are checked for retention and behave far more naturally, giving a balanced mix of speed, stability and realistic engagement. Selected Medium services carry a refill guarantee — each service description says whether it applies.",
    cta: "View Medium services",
    tagClass: "text-emerald-400",
    badgeClass: "bg-emerald-500 text-white",
    cardClass: "border-emerald-400/30 from-emerald-400/10",
    buttonClass: "bg-emerald-500 text-white hover:bg-emerald-400",
  },
  {
    key: "elite",
    badge: "ELITE",
    dot: "🔵",
    title: "Elite Tier – Premium Non-Drop & Organic-Grade Services",
    tagline: "Built for brands & agencies",
    body: "Elite is our top shelf: engagement produced through organic, real-user methods for brands, agencies and public figures who cannot afford drops. Expect the most stable results in the catalog, 100% non-drop retention and lifetime refill protection — at a premium price that pays for itself.",
    cta: "View Elite services",
    tagClass: "text-sky-400",
    badgeClass: "bg-sky-500 text-white",
    cardClass: "border-sky-400/30 from-sky-400/10",
    buttonClass: "bg-sky-500 text-white hover:bg-sky-400",
  },
] as const;

export default function QualityTiers() {
  return (
    <section id="quality-tiers" className="mx-auto max-w-6xl px-4 py-20">
      <Reveal>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Understanding Our <span className="text-brand">Service Quality Tiers</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            To keep choosing simple, Socials Wick tags every service with a colour-coded quality tier:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            {TIERS.map((t) => (
              <span key={t.key} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                {t.dot} {t.badge.charAt(0) + t.badge.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {TIERS.map((t, i) => (
          <Reveal key={t.key} delay={i * 100}>
            <div
              className={`flex h-full flex-col rounded-2xl border bg-gradient-to-b to-transparent p-6 ${t.cardClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-2xl">{t.dot}</span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${t.badgeClass}`}>
                  {t.badge}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold leading-snug text-foreground">{t.title}</h3>
              <p className={`mt-1 text-sm font-medium ${t.tagClass}`}>{t.tagline}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">{t.body}</p>
              <Link
                href={`/services?tier=${t.key}`}
                className={`mt-6 flex items-center justify-between rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wide ${t.buttonClass}`}
              >
                {t.cta} <span>›</span>
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
