import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const now = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/services", priority: 0.9, changeFrequency: "daily" },
    { path: "/login", priority: 0.3, changeFrequency: "monthly" },
    { path: "/register", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.2, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
