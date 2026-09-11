import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, articlePath, publishedWhere } from "@/lib/articles";
import { getSiteUrl } from "@/lib/seo-settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const now = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/services", priority: 0.9, changeFrequency: "daily" },
    { path: "/blog", priority: 0.7, changeFrequency: "daily" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/login", priority: 0.3, changeFrequency: "monthly" },
    { path: "/register", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.2, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "monthly" },
    { path: "/refund-policy", priority: 0.2, changeFrequency: "monthly" },
  ];

  // Live, indexable articles that are their own canonical.
  const articles = await prisma.article.findMany({
    where: { ...publishedWhere(now), noindex: false, canonicalUrl: "" },
    select: { slug: true, updatedAt: true, coverImage: true },
    orderBy: { publishedAt: "desc" },
  });

  return [
    ...routes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...articles.map((a) => ({
      url: absoluteUrl(siteUrl, articlePath(a.slug)),
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      ...(a.coverImage && { images: [absoluteUrl(siteUrl, a.coverImage)] }),
    })),
  ];
}
