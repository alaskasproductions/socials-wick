import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "SMM Services & Pricing",
  description:
    "Browse Socials Wick's full catalog of Instagram, YouTube, TikTok and Telegram growth services with transparent pricing per 1000. Instant delivery, secure payments.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const categories = await prisma.category.findMany({
    include: { services: { where: { active: true }, orderBy: { name: "asc" } } },
    orderBy: { position: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Our SMM Services</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-300">
          Browse our full catalog of social media marketing services. Register and add funds to
          place an order.
        </p>
      </div>

      <div className="mt-12 space-y-12">
        {categories.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 80}>
            <h2 className="text-xl font-bold text-foreground">{cat.name}</h2>
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
                  {cat.services.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{s.name}</div>
                        {s.description && (
                          <div className="text-xs text-slate-400">{s.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand">
                        €{s.rate.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{s.min}</td>
                      <td className="px-4 py-3 text-slate-400">{s.max}</td>
                    </tr>
                  ))}
                  {cat.services.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No active services in this category yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        ))}

        {categories.length === 0 && (
          <p className="text-center text-slate-400">No services available yet.</p>
        )}
      </div>
    </div>
  );
}
