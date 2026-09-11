import Link from "next/link";
import type { Article } from "@prisma/client";
import { articlePath, describe, formatDate, readingMinutes } from "@/lib/articles";

export default function ArticleCard({ article, priority = false }: { article: Article; priority?: boolean }) {
  const href = articlePath(article.slug);
  return (
    <article className="group glass flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-brand/40">
      <Link href={href} className="block aspect-[16/9] overflow-hidden bg-white/5" tabIndex={-1} aria-hidden="true">
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-4xl text-brand/40">△</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          {article.category && (
            <Link
              href={`/blog?category=${encodeURIComponent(article.category)}`}
              className="rounded-full bg-brand/15 px-2.5 py-0.5 font-semibold text-brand hover:bg-brand/25"
            >
              {article.category}
            </Link>
          )}
          {article.publishedAt && <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>}
          <span>{readingMinutes(article.content)} min read</span>
        </div>
        <h2 className="mt-3 text-lg font-bold leading-snug text-foreground">
          <Link href={href} className="hover:text-brand">
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-slate-400">{describe(article)}</p>
        <Link href={href} className="mt-auto pt-4 text-sm font-semibold text-brand hover:underline">
          Read article →
        </Link>
      </div>
    </article>
  );
}
