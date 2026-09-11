import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo-settings";
import ArticleEditor from "../ArticleEditor";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [article, siteUrl, cats] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    getSiteUrl(),
    prisma.article.findMany({ where: { NOT: { category: "" } }, select: { category: true }, distinct: ["category"] }),
  ]);
  if (!article) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Edit article</h2>
      {sp.created && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
          Article created{article.status === "PUBLISHED" ? " and published" : " as a draft"}.
        </p>
      )}
      <ArticleEditor
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImage: article.coverImage,
          coverAlt: article.coverAlt,
          category: article.category,
          tags: article.tags,
          authorName: article.authorName,
          status: article.status,
          publishedAt: article.publishedAt?.toISOString() ?? null,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          canonicalUrl: article.canonicalUrl,
          noindex: article.noindex,
        }}
        categories={cats.map((c) => c.category)}
        siteHost={siteUrl.replace(/^https?:\/\//, "")}
      />
    </div>
  );
}
