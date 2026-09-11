import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/blog/ArticleCard";
import { absoluteUrl, articlePath, getLiveArticles, getLiveCategories, jsonLd } from "@/lib/articles";
import { getSiteUrl } from "@/lib/seo-settings";

export const dynamic = "force-dynamic";

const TITLE = "Blog: social media growth tips & guides";
const DESCRIPTION =
  "Guides, tips and news on growing Instagram, TikTok, YouTube and more. Learn how to get more followers, views and engagement with SocialsWick.";

type SearchParams = Promise<{ page?: string; category?: string }>;

function parsePage(v?: string) {
  const n = Number(v);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const category = sp.category?.trim() || "";
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (page > 1) qs.set("page", String(page));
  const canonical = `/blog${qs.size ? `?${qs}` : ""}`;
  const title = [category ? `${category} articles` : TITLE, page > 1 ? `Page ${page}` : ""].filter(Boolean).join(" · ");

  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical, types: { "application/rss+xml": "/blog/rss.xml" } },
    openGraph: { type: "website", title, description: DESCRIPTION, url: canonical },
  };
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const category = sp.category?.trim() || undefined;
  const [{ items, pages, total }, categories, siteUrl] = await Promise.all([
    getLiveArticles({ page, category }),
    getLiveCategories(),
    getSiteUrl(),
  ]);

  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (p > 1) qs.set("page", String(p));
    return `/blog${qs.size ? `?${qs}` : ""}`;
  };

  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${siteUrl}/blog#blog`,
        name: "SocialsWick Blog",
        url: `${siteUrl}/blog`,
        description: DESCRIPTION,
        publisher: { "@id": `${siteUrl}/#organization` },
        blogPost: items.map((a) => ({
          "@type": "BlogPosting",
          headline: a.title,
          url: absoluteUrl(siteUrl, articlePath(a.slug)),
          datePublished: a.publishedAt?.toISOString(),
          dateModified: a.updatedAt.toISOString(),
          ...(a.coverImage && { image: absoluteUrl(siteUrl, a.coverImage) }),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />

      <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>{" "}
        / <span className="text-slate-300">Blog</span>
      </nav>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {category ? `${category} articles` : "SocialsWick Blog"}
        </h1>
        <p className="mt-3 text-slate-400">{DESCRIPTION}</p>
      </header>

      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2" role="list" aria-label="Categories">
          <Link
            href="/blog"
            role="listitem"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${!category ? "bg-brand text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              role="listitem"
              href={`/blog?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${category === c ? "bg-brand text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {total === 0 ? (
        <div className="glass mt-10 rounded-2xl p-10 text-center">
          <p className="text-4xl text-brand">△</p>
          <p className="mt-3 font-semibold text-foreground">New articles are on the way.</p>
          <p className="mt-1 text-sm text-slate-400">
            In the meantime,{" "}
            <Link href="/services" className="text-brand hover:underline">
              browse our services
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => (
            <ArticleCard key={a.id} article={a} priority={i < 3} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={pageHref(page - 1)} rel="prev" className="rounded-lg bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
              ← Newer
            </Link>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={`grid h-10 w-10 place-items-center rounded-lg text-sm ${p === page ? "bg-brand font-semibold text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            >
              {p}
            </Link>
          ))}
          {page < pages && (
            <Link href={pageHref(page + 1)} rel="next" className="rounded-lg bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
              Older →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
