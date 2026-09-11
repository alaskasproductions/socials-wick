import type { Article } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Blog helpers shared by the public /blog pages, the sitemap, the RSS feed and
// the admin editor.

export * from "@/lib/article-text";
import { publishedWhere } from "@/lib/article-text";

export const ARTICLES_PER_PAGE = 9;

export async function getLiveArticles({ page = 1, category }: { page?: number; category?: string }) {
  const where = { ...publishedWhere(), ...(category ? { category } : {}) };
  const [total, items] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * ARTICLES_PER_PAGE,
      take: ARTICLES_PER_PAGE,
    }),
  ]);
  return { total, items, pages: Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE)) };
}

export async function getLiveCategories(): Promise<string[]> {
  const rows = await prisma.article.findMany({
    where: { ...publishedWhere(), NOT: { category: "" } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

export async function getRelatedArticles(article: Article, take = 3) {
  const sameCategory = article.category
    ? await prisma.article.findMany({
        where: { ...publishedWhere(), category: article.category, NOT: { id: article.id } },
        orderBy: { publishedAt: "desc" },
        take,
      })
    : [];
  if (sameCategory.length >= take) return sameCategory;
  const others = await prisma.article.findMany({
    where: { ...publishedWhere(), NOT: { id: { in: [article.id, ...sameCategory.map((a) => a.id)] } } },
    orderBy: { publishedAt: "desc" },
    take: take - sameCategory.length,
  });
  return [...sameCategory, ...others];
}

export async function hasLiveArticles(): Promise<boolean> {
  return (await prisma.article.count({ where: publishedWhere() })) > 0;
}

