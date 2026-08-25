import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo-settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
