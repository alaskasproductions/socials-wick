import type { Article } from "@prisma/client";
import GithubSlugger from "github-slugger";

// Pure text helpers for articles, safe to import from client components
// (the admin editor) as well as the server. No database access here.

export const DEFAULT_AUTHOR = "SocialsWick Team";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

/** Live on the site: published and not scheduled for the future. */
export function publishedWhere(now = new Date()) {
  return { status: "PUBLISHED", publishedAt: { lte: now } };
}

export function isLive(a: Pick<Article, "status" | "publishedAt">, now = new Date()): boolean {
  return a.status === "PUBLISHED" && a.publishedAt !== null && a.publishedAt <= now;
}

export function articlePath(slug: string): string {
  return `/blog/${slug}`;
}

export function parseTags(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Plain text of a Markdown document (for word counts and fallback descriptions). */
export function markdownToText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(md: string): number {
  const text = markdownToText(md);
  return text ? text.split(" ").length : 0;
}

export function readingMinutes(md: string): number {
  return Math.max(1, Math.round(wordCount(md) / 220));
}

/** Description used for <meta>, cards and feeds: meta description → excerpt → first words. */
export function describe(a: Pick<Article, "metaDescription" | "excerpt" | "content">): string {
  const base = a.metaDescription || a.excerpt || markdownToText(a.content);
  return base.length > 160 ? base.slice(0, 157).replace(/\s+\S*$/, "") + "…" : base;
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** H2/H3 headings with the same ids rehype-slug gives them in the rendered article. */
export function tableOfContents(md: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = markdownToText(m[2]);
    const id = slugger.slug(text);
    // "#" renders as <h2> (see Markdown.tsx), so list it with the H2s.
    const level = Math.max(2, m[1].length);
    if (level === 2 || level === 3) items.push({ id, text, level });
  }
  return items;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Nicosia" });
}

/** JSON for a <script type="application/ld+json">, safe against `</script>` injection. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
