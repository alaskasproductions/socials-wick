import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Markdown from "@/components/blog/Markdown";
import ArticleCard from "@/components/blog/ArticleCard";
import {
  absoluteUrl,
  articlePath,
  describe,
  formatDate,
  getRelatedArticles,
  isLive,
  jsonLd,
  parseTags,
  readingMinutes,
  tableOfContents,
  wordCount,
} from "@/lib/articles";
import { getSiteUrl } from "@/lib/seo-settings";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

// One DB read per request, shared by generateMetadata and the page.
const loadArticle = cache(async (slug: string) => {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return null;
  if (isLive(article)) return { article, preview: false };
  // Drafts and scheduled posts are visible to admins only, as a noindex preview.
  const session = await auth();
  if (session?.user?.role === "ADMIN") return { article, preview: true };
  return null;
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const found = await loadArticle(slug);
  if (!found) return { title: "Article not found", robots: { index: false } };
  const { article, preview } = found;

  const title = article.metaTitle || article.title;
  const description = describe(article);
  const canonical = article.canonicalUrl || articlePath(article.slug);
  const images = article.coverImage
    ? [{ url: article.coverImage, width: 1600, height: 900, alt: article.coverAlt || article.title }]
    : undefined;

  return {
    // An explicit meta title is used verbatim; otherwise the site template adds the brand.
    title: article.metaTitle ? { absolute: article.metaTitle } : article.title,
    description,
    keywords: parseTags(article.tags),
    authors: [{ name: article.authorName }],
    alternates: { canonical },
    robots: preview || article.noindex ? { index: false, follow: !preview } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.authorName],
      section: article.category || undefined,
      tags: parseTags(article.tags),
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images && { images: images.map((i) => i.url) }),
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const found = await loadArticle(slug);
  if (!found) notFound();
  const { article, preview } = found;

  const [siteUrl, related] = await Promise.all([getSiteUrl(), getRelatedArticles(article)]);
  const url = absoluteUrl(siteUrl, articlePath(article.slug));
  const toc = tableOfContents(article.content);
  const minutes = readingMinutes(article.content);
  const tags = parseTags(article.tags);
  const published = article.publishedAt ?? article.createdAt;
  const updatedLater = article.updatedAt.getTime() - published.getTime() > 24 * 3600 * 1000;

  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: article.title.slice(0, 110),
        description: describe(article),
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: published.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        wordCount: wordCount(article.content),
        timeRequired: `PT${minutes}M`,
        inLanguage: "en",
        ...(article.coverImage && { image: [absoluteUrl(siteUrl, article.coverImage)] }),
        ...(article.category && { articleSection: article.category }),
        ...(tags.length && { keywords: tags.join(", ") }),
        author: { "@type": "Organization", name: article.authorName, url: siteUrl },
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
          { "@type": "ListItem", position: 3, name: article.title, item: url },
        ],
      },
    ],
  };

  const share = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${article.title} ${url}`)}` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />}

      {preview && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Admin preview: this article is {article.status === "DRAFT" ? "a draft" : "scheduled"} and is not visible to
          visitors or search engines.{" "}
          <Link href={`/admin/articles/${article.id}`} className="font-semibold underline">
            Edit article
          </Link>
        </div>
      )}

      <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/blog" className="hover:text-brand">
          Blog
        </Link>
        {article.category && (
          <>
            {" "}
            /{" "}
            <Link href={`/blog?category=${encodeURIComponent(article.category)}`} className="hover:text-brand">
              {article.category}
            </Link>
          </>
        )}
      </nav>

      <article className="mt-6">
        <header className="mx-auto max-w-3xl text-center">
          {article.category && (
            <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">{article.category}</span>
          )}
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-5xl">{article.title}</h1>
          {article.excerpt && <p className="mt-4 text-lg text-slate-400">{article.excerpt}</p>}
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <span>By {article.authorName}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={published.toISOString()}>{formatDate(published)}</time>
            {updatedLater && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Updated <time dateTime={article.updatedAt.toISOString()}>{formatDate(article.updatedAt)}</time>
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{minutes} min read</span>
          </p>
        </header>

        {article.coverImage && (
          <figure className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={article.coverAlt || article.title}
              width={1600}
              height={900}
              fetchPriority="high"
              className="aspect-[16/9] h-auto w-full object-cover"
            />
          </figure>
        )}

        <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-[1fr_240px]">
          <div className="min-w-0">
            {toc.length >= 3 && (
              <details className="glass mb-8 rounded-xl p-5 lg:hidden" open>
                <summary className="cursor-pointer text-sm font-semibold text-foreground">In this article</summary>
                <TocList toc={toc} />
              </details>
            )}

            <Markdown>{article.content}</Markdown>

            {tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                {tags.map((t) => (
                  <li key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                    #{t}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6 text-sm">
              <span className="text-slate-400">Share:</span>
              {share.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10"
                >
                  {s.label}
                </a>
              ))}
            </div>

            <aside className="mt-10 rounded-2xl border border-brand/30 bg-brand/10 p-6 sm:p-8">
              <p className="text-lg font-bold text-foreground">Ready to grow your account?</p>
              <p className="mt-1 text-sm text-slate-300">
                Followers, likes and views for Instagram, TikTok, YouTube and more. Orders start from €1.
              </p>
              <Link
                href="/services"
                className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Browse services
              </Link>
            </aside>
          </div>

          {toc.length >= 3 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 glass rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">In this article</p>
                <TocList toc={toc} />
              </div>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl font-bold text-foreground">
            Keep reading
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TocList({ toc }: { toc: ReturnType<typeof tableOfContents> }) {
  return (
    <ol className="mt-3 space-y-2 text-sm">
      {toc.map((t) => (
        <li key={t.id} className={t.level === 3 ? "pl-4" : ""}>
          <a href={`#${t.id}`} className="text-slate-300 hover:text-brand">
            {t.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
