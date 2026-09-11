import { prisma } from "@/lib/prisma";
import { absoluteUrl, articlePath, describe, publishedWhere } from "@/lib/articles";
import { getSiteUrl } from "@/lib/seo-settings";

export const dynamic = "force-dynamic";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// RSS 2.0 feed of the 30 latest live articles (linked from /blog via <link rel="alternate">).
export async function GET() {
  const [siteUrl, articles] = await Promise.all([
    getSiteUrl(),
    prisma.article.findMany({ where: { ...publishedWhere(), noindex: false }, orderBy: { publishedAt: "desc" }, take: 30 }),
  ]);

  const items = articles
    .map((a) => {
      const url = absoluteUrl(siteUrl, articlePath(a.slug));
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${(a.publishedAt ?? a.createdAt).toUTCString()}</pubDate>
      <description>${esc(describe(a))}</description>${a.category ? `\n      <category>${esc(a.category)}</category>` : ""}${
        a.coverImage ? `\n      <enclosure url="${esc(absoluteUrl(siteUrl, a.coverImage))}" type="image/jpeg" length="0" />` : ""
      }
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SocialsWick Blog</title>
    <link>${esc(siteUrl)}/blog</link>
    <description>Social media growth tips and guides from SocialsWick.</description>
    <language>en</language>
    <atom:link href="${esc(siteUrl)}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
}
