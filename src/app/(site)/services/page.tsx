import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import { TIERS, displayName, serviceTier, type Tier } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "SMM Services & Pricing",
  description:
    "Browse Socials Wick's full catalog of Instagram, YouTube, TikTok and Telegram growth services with transparent pricing per 1000. Instant delivery, secure payments.",
  alternates: { canonical: "/services" },
};

const TIER_FILTERS: { key: "all" | Tier; label: string }[] = [
  { key: "all", label: "All tiers" },
  { key: "basic", label: "🟡 Basic" },
  { key: "medium", label: "🟢 Medium" },
  { key: "elite", label: "🔵 Elite" },
];

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier: tierParam } = await searchParams;
  const tier: "all" | Tier =
    tierParam === "basic" || tierParam === "medium" || tierParam === "elite" ? tierParam : "all";

  const categories = await prisma.category.findMany({
    include: { services: { where: { active: true }, orderBy: { name: "asc" } } },
    orderBy: { position: "asc" },
  });

  const visible = categories
    .map((cat) => ({
      ...cat,
      services: cat.services.filter((s) => tier === "all" || serviceTier(s.name, cat.name) === tier),
    }))
    .filter((cat) => cat.services.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Our SMM Services</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-300">
          Browse our full catalog of social media marketing services. Order straight from the{" "}
          <Link href="/" className="text-brand hover:underline">
            home page
          </Link>{" "}
          or register and add funds to order from your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {TIER_FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/services" : `/services?tier=${f.key}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tier === f.key
                  ? "bg-brand text-white"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        {tier !== "all" && (
          <p className="mt-3 text-xs text-slate-500">
            {TIERS[tier].dot} {TIERS[tier].label}: {TIERS[tier].description}{" "}
            <Link href="/#quality-tiers" className="text-brand hover:underline">
              What do the tiers mean?
            </Link>
          </p>
        )}
      </div>

      <div className="mt-12 space-y-12">
        {visible.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 80}>
            <h2 className="text-xl font-bold text-foreground">{displayName(cat.name)}</h2>
            <div className="mt-4 overflow-x-auto rounded-xl glass">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Rate / 1000</th>
                    <th className="px-4 py-3 font-medium">Min</th>
                    <th className="px-4 py-3 font-medium">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cat.services.map((s) => {
                    const t = TIERS[serviceTier(s.name, cat.name)];
                    return (
                      <tr key={s.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2 font-medium text-foreground">
                            {t.dot && (
                              <span title={`${t.label} — ${t.description}`} className="shrink-0">
                                {t.dot}
                              </span>
                            )}
                            <span>{displayName(s.name)}</span>
                          </div>
                          {s.description && (
                            <div className="mt-0.5 text-xs text-slate-400">{displayName(s.description)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-brand">€{s.rate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-400">{s.min.toLocaleString("en-US")}</td>
                        <td className="px-4 py-3 text-slate-400">{s.max.toLocaleString("en-US")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
        ))}

        {visible.length === 0 && (
          <p className="text-center text-slate-400">
            {tier === "all" ? "No services available yet." : "No services in this tier yet."}
          </p>
        )}
      </div>
    </div>
  );
}
