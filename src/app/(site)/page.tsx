import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import Storefront from "@/components/storefront/Storefront";
import QualityTiers from "@/components/QualityTiers";
import { displayName } from "@/lib/catalog";
import { buildStorefront } from "@/lib/packages";
import { auth } from "@/lib/auth";

export const metadata = {
  alternates: { canonical: "/" },
};

const CATEGORY_ICONS: Record<string, string> = {
  instagram: "📸",
  youtube: "▶️",
  telegram: "📢",
  tiktok: "🎵",
  facebook: "👍",
  spotify: "🎧",
  twitter: "🐦",
  discord: "🎮",
};

function iconFor(slug: string) {
  const key = Object.keys(CATEGORY_ICONS).find((k) => slug.includes(k));
  return key ? CATEGORY_ICONS[key] : "⭐";
}

// Marketing figures shown in the stats strip. Active Services is the live catalog count.
const STATS = {
  users: "9.300+",
  orders: "12.700+",
};

const FAQS = [
  {
    q: "What is Socials Wick?",
    a: "Socials Wick is an SMM panel that lets creators, agencies and resellers buy Instagram followers, YouTube subscribers, TikTok views, Telegram members and more at affordable prices with instant delivery.",
  },
  {
    q: "Is Socials Wick safe to use?",
    a: "Yes. We use secure payment processing and deliver services gradually to protect your accounts from platform flags.",
  },
  {
    q: "How fast is delivery?",
    a: "Most orders start within minutes and complete within a few hours, depending on the service and quantity ordered.",
  },
  {
    q: "Do you offer an API?",
    a: "Yes. API access is available for agencies and resellers who want to automate order management — contact our support team from your account and we will enable it and send you the documentation.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support cards, UPI, PayPal and crypto. Add funds to your balance and place orders instantly.",
  },
];

export default async function HomePage() {
  const [categories, serviceCount, storeServices, session] = await Promise.all([
    prisma.category.findMany({
      include: { services: { where: { active: true }, take: 3 } },
      orderBy: { position: "asc" },
      take: 4,
    }),
    prisma.service.count({ where: { active: true } }),
    prisma.service.findMany({
      where: { active: true },
      select: { id: true, name: true, rate: true, min: true, max: true, category: { select: { name: true } } },
    }),
    auth(),
  ]);
  const sections = buildStorefront(
    storeServices.map((s) => ({
      id: s.id,
      name: s.name,
      categoryName: s.category.name,
      rate: s.rate,
      min: s.min,
      max: s.max,
    }))
  );
  const viewerUser = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, balance: true } })
    : null;
  const viewer = {
    signedIn: Boolean(viewerUser),
    email: viewerUser?.email ?? null,
    balance: viewerUser?.balance ?? 0,
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-bg.png"
            alt=""
            fill
            priority
            className="object-cover opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-28 text-center sm:py-36">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-brand backdrop-blur">
              🚀 Trusted by creators &amp; agencies worldwide
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              The Fastest, Cheapest SMM Panel for Real Social Growth
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
              Socials Wick delivers Instagram followers, YouTube subscribers, TikTok views,
              Telegram members and more — instant delivery, secure payments, and reseller API
              support.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark hover:shadow-brand/50"
              >
                Start Growing Now
              </Link>
              <Link
                href="/services"
                className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition hover:bg-white/10"
              >
                Explore Services
              </Link>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
              <span>⚡ Instant Delivery</span>
              <span>🔒 Secure Payments</span>
              <span>📈 API Support</span>
              <span>💬 24/7 Support</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <Reveal>
        <section className="border-y border-white/10">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center sm:grid-cols-4">
            <div>
              <div className="text-3xl font-extrabold text-brand">{STATS.users}</div>
              <div className="mt-1 text-sm text-slate-400">Registered Users</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand">{STATS.orders}</div>
              <div className="mt-1 text-sm text-slate-400">Total Orders</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand">{serviceCount.toLocaleString("de-DE")}+</div>
              <div className="mt-1 text-sm text-slate-400">Active Services</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand">24/7</div>
              <div className="mt-1 text-sm text-slate-400">Support Available</div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Quality tiers explainer */}
      <QualityTiers />

      {/* Storefront: per-platform packages + price calculator + checkout */}
      <Storefront sections={sections} viewer={viewer} />

      {/* Popular services */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Popular SMM Services</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">
              High-quality social media marketing services for Instagram, YouTube, Telegram,
              TikTok and more — affordable pricing, fast delivery.
            </p>
          </div>
        </Reveal>

        {categories.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 100}>
                <div className="glass glass-hover h-full rounded-2xl p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5 text-2xl">
                    {iconFor(cat.slug)}
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{displayName(cat.name)}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {cat.services.length > 0
                      ? `From €${Math.min(...cat.services.map((s) => s.rate)).toFixed(2)} / 1000`
                      : "Coming soon"}
                  </p>
                  <Link
                    href="/services"
                    className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
                  >
                    Explore →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-slate-400">
            Services will appear here once the catalog is set up.
          </p>
        )}
      </section>

      {/* Why choose us */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10 bg-black/20" />
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-center text-3xl font-bold text-foreground">
              Why Choose Socials Wick
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["⚡ Instant Delivery", "Fast processing with high retention and stable delivery."],
              ["💰 Cheapest Rates", "Affordable services for agencies, creators and resellers."],
              ["🔒 Secure Payments", "Cards, UPI, PayPal and crypto all supported."],
              ["📈 API Integration", "Reseller API for automated order management."],
              ["🌎 Worldwide Support", "Trusted by users across the globe."],
              ["💬 24/7 Support", "A dedicated team ready to help, any time."],
            ].map(([title, desc], i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="glass glass-hover h-full rounded-xl p-6">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <h2 className="text-center text-3xl font-bold text-foreground">How It Works</h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["1", "Create Account", "Register your account within seconds."],
            ["2", "Add Funds", "Deposit securely using multiple payment methods."],
            ["3", "Select Service", "Choose from our catalog of SMM services."],
            ["4", "Grow Fast", "Boost engagement and grow your social presence."],
          ].map(([num, title, desc], i) => (
            <Reveal key={num} delay={i * 100}>
              <div className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-lg font-bold text-white shadow-lg shadow-brand/40">
                  {num}
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-slate-400">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <h2 className="text-center text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 glass divide-y divide-white/10 rounded-2xl">
              {FAQS.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none">
                    <span className="flex items-center justify-between">
                      {f.q}
                      <span className="text-brand transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-300">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl px-8 py-16 text-center text-white">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand to-fuchsia-600" />
            <Image
              src="/images/orb-glow.jpg"
              alt=""
              fill
              className="-z-10 object-cover opacity-30 mix-blend-screen"
              sizes="100vw"
            />
            <h2 className="text-3xl font-bold">Ready to grow your social presence?</h2>
            <p className="mt-3 text-violet-100">
              Join Socials Wick today and place your first order in minutes.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-violet-50"
            >
              Create Free Account
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
