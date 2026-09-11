import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, isLive } from "@/lib/article-text";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; deleted?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status === "PUBLISHED" || sp.status === "DRAFT" ? sp.status : undefined;
  const [articles, counts] = await Promise.all([
    prisma.article.findMany({
      where: filter ? { status: filter } : {},
      orderBy: [{ updatedAt: "desc" }],
      select: { id: true, title: true, slug: true, status: true, publishedAt: true, updatedAt: true, category: true, coverImage: true },
    }),
    prisma.article.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const total = count("PUBLISHED") + count("DRAFT");
  const now = new Date();

  const tabs = [
    { key: undefined, label: `All (${total})` },
    { key: "PUBLISHED", label: `Published (${count("PUBLISHED")})` },
    { key: "DRAFT", label: `Drafts (${count("DRAFT")})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Articles</h2>
          <p className="text-sm text-slate-400">
            Blog posts at <code className="text-slate-300">/blog</code>. Published articles go into the sitemap and RSS feed
            automatically.
          </p>
        </div>
        <Link href="/admin/articles/new" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          + New article
        </Link>
      </div>

      {sp.deleted && <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">Article deleted.</p>}

      <div className="flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/articles?status=${t.key}` : "/admin/articles"}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === t.key ? "bg-brand text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="glass overflow-x-auto rounded-xl">
        {articles.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No articles yet.{" "}
            <Link href="/admin/articles/new" className="font-semibold text-brand hover:underline">
              Write the first one
            </Link>
            .
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {articles.map((a) => {
                const live = isLive(a, now);
                const scheduled = a.status === "PUBLISHED" && !live;
                return (
                  <tr key={a.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {a.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.coverImage} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
                        ) : (
                          <div className="grid h-10 w-16 shrink-0 place-items-center rounded bg-white/5 text-brand/50">△</div>
                        )}
                        <div className="min-w-0">
                          <Link href={`/admin/articles/${a.id}`} className="font-semibold text-foreground hover:text-brand">
                            {a.title}
                          </Link>
                          <p className="truncate text-xs text-slate-500">/blog/{a.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          live ? "bg-emerald-500/15 text-emerald-400" : scheduled ? "bg-sky-500/15 text-sky-300" : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {live ? "Published" : scheduled ? "Scheduled" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{a.category || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{a.publishedAt ? formatDate(a.publishedAt) : "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(a.updatedAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/admin/articles/${a.id}`} className="text-xs font-semibold text-brand hover:underline">
                        Edit
                      </Link>
                      <a href={`/blog/${a.slug}`} target="_blank" rel="noreferrer" className="ml-3 text-xs text-slate-400 hover:text-brand">
                        View ↗
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
