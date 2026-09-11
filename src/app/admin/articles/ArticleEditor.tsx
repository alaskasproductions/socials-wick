"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Markdown from "@/components/blog/Markdown";
import { saveArticleAction, deleteArticleAction } from "@/lib/actions/articles";
import { markdownToText, readingMinutes, slugify, tableOfContents, wordCount } from "@/lib/article-text";

export type EditorArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverAlt: string;
  category: string;
  tags: string;
  authorName: string;
  status: string;
  publishedAt: string | null; // ISO
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  noindex: boolean;
};

const input =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none";
const label = "text-sm font-medium text-slate-200";
const BRAND_SUFFIX = " — SocialsWick";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
  return data.url;
}

export default function ArticleEditor({
  article,
  categories,
  siteHost,
}: {
  article?: EditorArticle;
  categories: string[];
  siteHost: string;
}) {
  const [state, formAction, pending] = useActionState(saveArticleAction, undefined);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [coverAlt, setCoverAlt] = useState(article?.coverAlt ?? "");
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription ?? "");
  const [publishLocal, setPublishLocal] = useState(toLocalInput(article?.publishedAt ?? null));
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState<"" | "cover" | "inline">("");
  const [uploadError, setUploadError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dirty = useRef(false);
  const markDirty = () => {
    dirty.current = true;
  };

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const effectiveSlug = slugTouched ? slugify(slug) : slugify(title);
  const isPublished = article?.status === "PUBLISHED";
  const publishIso = publishLocal ? new Date(publishLocal).toISOString() : "";
  const [openedAt] = useState(() => Date.now());
  const scheduled = publishLocal !== "" && new Date(publishLocal).getTime() > openedAt;

  // ---------- Markdown toolbar ----------
  function applyEdit(fn: (sel: string) => { text: string; select?: [number, number] }) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = content.slice(start, end);
    const { text, select } = fn(sel);
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    markDirty();
    requestAnimationFrame(() => {
      ta.focus();
      const [a, b] = select ?? [start + text.length, start + text.length];
      ta.setSelectionRange(start + a, start + b);
    });
  }
  const wrap = (before: string, after = before, placeholder = "text") =>
    applyEdit((sel) => {
      const inner = sel || placeholder;
      return { text: before + inner + after, select: [before.length, before.length + inner.length] };
    });
  const linePrefix = (prefix: string, placeholder: string) =>
    applyEdit((sel) => {
      const body = (sel || placeholder)
        .split("\n")
        .map((l, i) => (prefix === "1. " ? `${i + 1}. ` : prefix) + l)
        .join("\n");
      const text = `\n${body}\n`;
      return { text, select: [1, text.length - 1] };
    });

  async function onInlineImage(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    setUploading("inline");
    try {
      const url = await uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      applyEdit(() => ({ text: `\n![${alt}](${url})\n` }));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading("");
    }
  }

  async function onCover(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    setUploading("cover");
    try {
      setCoverImage(await uploadImage(file));
      if (!coverAlt) setCoverAlt(title);
      markDirty();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading("");
    }
  }

  // ---------- SEO ----------
  const words = wordCount(content);
  const toc = tableOfContents(content);
  const h2Count = toc.filter((t) => t.level === 2).length;
  const serpTitle = metaTitle || `${title || "Article title"}${BRAND_SUFFIX}`;
  const fallbackDesc = excerpt || markdownToText(content).slice(0, 160);
  const serpDesc = metaDescription || fallbackDesc || "Add a meta description or an excerpt.";
  const descLen = (metaDescription || fallbackDesc).length;
  const hasInternalLink = /\]\((\/(?!media\/)|https?:\/\/(www\.)?socialswick\.com)/i.test(content);
  const checks: Array<{ ok: boolean; warn?: boolean; text: string }> = [
    { ok: serpTitle.length >= 30 && serpTitle.length <= 60, warn: serpTitle.length > 0, text: `SEO title is ${serpTitle.length} characters (aim for 30–60).` },
    { ok: descLen >= 120 && descLen <= 160, warn: descLen > 0, text: `Meta description is ${descLen} characters (aim for 120–160).` },
    { ok: effectiveSlug.length > 0 && effectiveSlug.length <= 75, text: `URL slug is ${effectiveSlug.length} characters (keep it short, under 75).` },
    { ok: Boolean(coverImage), text: coverImage ? "Cover image is set." : "Add a cover image (1600×900 recommended)." },
    { ok: Boolean(coverImage) && coverAlt.trim().length > 0, text: "Cover image has alt text." },
    { ok: words >= 600, warn: words >= 300, text: `${words} words (${readingMinutes(content)} min read). Aim for 600+ for guides.` },
    { ok: h2Count >= 2, text: `${h2Count} section headings (H2). Use at least 2 to structure the article.` },
    { ok: hasInternalLink, text: hasInternalLink ? "Links to another SocialsWick page." : "Add a link to /services or another page on the site." },
  ];
  const score = checks.filter((c) => c.ok).length;

  const viewHref = state?.slug ? `/blog/${state.slug}` : article ? `/blog/${article.slug}` : null;

  return (
    <div className="space-y-4">
      <form
        action={formAction}
        onChange={markDirty}
        onSubmit={() => {
          dirty.current = false;
        }}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        {article && <input type="hidden" name="id" value={article.id} />}
        <input type="hidden" name="slug" value={slugTouched ? slug : ""} />
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="coverImage" value={coverImage} />
        <input type="hidden" name="publishedAt" value={publishIso} />
        <input type="hidden" name="status" value={article?.status ?? "DRAFT"} />

        {/* ---------------- main column ---------------- */}
        <div className="min-w-0 space-y-5">
          {state?.error && <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>}
          {state?.success && (
            <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
              {state.success}{" "}
              {viewHref && (
                <a href={viewHref} target="_blank" rel="noreferrer" className="font-semibold underline">
                  View article
                </a>
              )}
            </p>
          )}

          <div className="glass space-y-4 rounded-xl p-5">
            <div>
              <label className={label} htmlFor="title">
                Title (H1)
              </label>
              <input
                id="title"
                name="title"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How to get more Instagram followers in 2026"
                className={`${input} text-base font-semibold`}
              />
            </div>
            <div>
              <label className={label} htmlFor="slug-input">
                URL
              </label>
              <div className="mt-1 flex items-center rounded-lg border border-white/15 bg-white/5 text-sm">
                <span className="whitespace-nowrap pl-3 text-slate-500">{siteHost}/blog/</span>
                <input
                  id="slug-input"
                  value={slugTouched ? slug : effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  onBlur={() => setSlug(slugify(slug || title))}
                  className="w-full bg-transparent px-1 py-2 text-foreground focus:outline-none"
                  placeholder="auto-generated-from-title"
                />
              </div>
              {isPublished && slugTouched && effectiveSlug !== article?.slug && (
                <p className="mt-1 text-xs text-amber-300">
                  Changing the URL of a published article breaks existing links and loses its Google ranking.
                </p>
              )}
            </div>
            <div>
              <label className={label} htmlFor="excerpt">
                Excerpt <span className="text-slate-500">(shown under the title and on article cards)</span>
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                maxLength={500}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className={input}
                placeholder="One or two sentences that sum up the article."
              />
            </div>
          </div>

          {/* ---------- content ---------- */}
          <div className="glass overflow-hidden rounded-xl">
            <div className="flex flex-wrap items-center gap-1 border-b border-white/10 px-3 py-2">
              <div className="mr-2 flex rounded-lg bg-white/5 p-0.5 text-xs">
                {(["write", "preview"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`rounded-md px-3 py-1 font-semibold capitalize ${tab === t ? "bg-brand text-white" : "text-slate-300"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {tab === "write" && (
                <>
                  <ToolButton title="Heading (H2)" onClick={() => linePrefix("## ", "Section heading")}>H2</ToolButton>
                  <ToolButton title="Subheading (H3)" onClick={() => linePrefix("### ", "Subheading")}>H3</ToolButton>
                  <ToolButton title="Bold" onClick={() => wrap("**", "**", "bold text")}>
                    <b>B</b>
                  </ToolButton>
                  <ToolButton title="Italic" onClick={() => wrap("_", "_", "italic text")}>
                    <i>I</i>
                  </ToolButton>
                  <ToolButton title="Link" onClick={() => wrap("[", "](https://)", "link text")}>Link</ToolButton>
                  <ToolButton title="Bulleted list" onClick={() => linePrefix("- ", "List item")}>• List</ToolButton>
                  <ToolButton title="Numbered list" onClick={() => linePrefix("1. ", "Step")}>1. List</ToolButton>
                  <ToolButton title="Quote" onClick={() => linePrefix("> ", "Quote")}>“ ”</ToolButton>
                  <label className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10" title="Insert image">
                    {uploading === "inline" ? "Uploading…" : "🖼 Image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        onInlineImage(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </>
              )}
              <span className="ml-auto text-xs text-slate-500">
                {words} words · {readingMinutes(content)} min read
              </span>
            </div>
            {tab === "write" ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={26}
                spellCheck
                className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-slate-100 focus:outline-none"
                placeholder={"Write in Markdown.\n\n## First section\n\nYour text here. Link to [our services](/services).\n\n- a list item\n- another one"}
              />
            ) : (
              <div className="min-h-[400px] px-6 py-5">
                {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-sm text-slate-500">Nothing to preview yet.</p>}
              </div>
            )}
          </div>
          {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
          <p className="text-xs text-slate-500">
            Formatting uses Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>[link](/services)</code>,{" "}
            <code>- list</code>. The article title is the page&apos;s only H1, so start sections at H2.
          </p>
        </div>

        {/* ---------------- sidebar ---------------- */}
        <div className="space-y-5">
          <div className="glass space-y-3 rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground">Publish</p>
            <p className="text-xs text-slate-400">
              Status:{" "}
              <span className={`font-semibold ${isPublished ? (scheduled ? "text-sky-300" : "text-emerald-400") : "text-amber-300"}`}>
                {isPublished ? (scheduled ? "Scheduled" : "Published") : "Draft"}
              </span>
            </p>
            <div>
              <label className={label} htmlFor="publish-at">
                Publish date
              </label>
              <input
                id="publish-at"
                type="datetime-local"
                value={publishLocal}
                onChange={(e) => setPublishLocal(e.target.value)}
                className={input}
              />
              <p className="mt-1 text-xs text-slate-500">Empty = now. A future date schedules the article.</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {isPublished ? (
                <>
                  <button
                    name="intent"
                    value="publish"
                    disabled={pending}
                    className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Update"}
                  </button>
                  <button
                    name="intent"
                    value="draft"
                    disabled={pending}
                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
                  >
                    Unpublish
                  </button>
                </>
              ) : (
                <>
                  <button
                    name="intent"
                    value="draft"
                    disabled={pending}
                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Save draft"}
                  </button>
                  <button
                    name="intent"
                    value="publish"
                    disabled={pending}
                    className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {scheduled ? "Schedule" : "Publish"}
                  </button>
                </>
              )}
            </div>
            {article && (
              <a
                href={`/blog/${article.slug}`}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs font-semibold text-brand hover:underline"
              >
                {isPublished && !scheduled ? "View live article ↗" : "Preview (admins only) ↗"}
              </a>
            )}
          </div>

          <div className="glass space-y-3 rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground">Cover image</p>
            {coverImage ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="" className="aspect-[16/9] w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage("");
                    markDirty();
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label className="grid aspect-[16/9] cursor-pointer place-items-center rounded-lg border border-dashed border-white/20 text-center text-xs text-slate-400 hover:border-brand">
                <span>
                  {uploading === "cover" ? "Uploading…" : "Click to upload"}
                  <br />
                  JPG, PNG or WebP · 1600×900 · max 8 MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    onCover(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            <div>
              <label className={label} htmlFor="coverAlt">
                Alt text
              </label>
              <input
                id="coverAlt"
                name="coverAlt"
                maxLength={200}
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                className={input}
                placeholder="Describe the image for Google and screen readers"
              />
            </div>
          </div>

          <div className="glass space-y-3 rounded-xl p-5">
            <p className="text-sm font-semibold text-foreground">Organise</p>
            <div>
              <label className={label} htmlFor="category">
                Category
              </label>
              <input
                id="category"
                name="category"
                list="article-categories"
                maxLength={60}
                defaultValue={article?.category ?? ""}
                className={input}
                placeholder="e.g. Instagram"
              />
              <datalist id="article-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={label} htmlFor="tags">
                Tags <span className="text-slate-500">(comma separated)</span>
              </label>
              <input id="tags" name="tags" maxLength={300} defaultValue={article?.tags ?? ""} className={input} placeholder="followers, growth, reels" />
            </div>
            <div>
              <label className={label} htmlFor="authorName">
                Author
              </label>
              <input id="authorName" name="authorName" maxLength={80} defaultValue={article?.authorName ?? "SocialsWick Team"} className={input} />
            </div>
          </div>

          <div className="glass space-y-3 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">SEO</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${score >= 7 ? "bg-emerald-500/15 text-emerald-400" : score >= 5 ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-400"}`}>
                {score}/{checks.length}
              </span>
            </div>

            <div className="rounded-lg bg-white p-3 text-left" aria-label="Google search preview">
              <p className="truncate text-xs text-[#202124]">
                {siteHost} › blog › {effectiveSlug || "…"}
              </p>
              <p className="mt-0.5 line-clamp-1 text-base leading-snug text-[#1a0dab]">{serpTitle}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#4d5156]">{serpDesc}</p>
            </div>

            <div>
              <label className={label} htmlFor="metaTitle">
                SEO title <span className="text-slate-500">({(metaTitle || serpTitle).length}/60)</span>
              </label>
              <input
                id="metaTitle"
                name="metaTitle"
                maxLength={120}
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={input}
                placeholder={`${title || "Title"}${BRAND_SUFFIX}`}
              />
            </div>
            <div>
              <label className={label} htmlFor="metaDescription">
                Meta description <span className="text-slate-500">({metaDescription.length}/160)</span>
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                rows={3}
                maxLength={320}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={input}
                placeholder="Empty = uses the excerpt."
              />
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-xs font-semibold text-slate-400">Advanced</summary>
              <div className="mt-3 space-y-3">
                <div>
                  <label className={label} htmlFor="canonicalUrl">
                    Canonical URL <span className="text-slate-500">(only if copied from elsewhere)</span>
                  </label>
                  <input id="canonicalUrl" name="canonicalUrl" defaultValue={article?.canonicalUrl ?? ""} className={input} placeholder="https://…" />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" name="noindex" defaultChecked={article?.noindex ?? false} className="h-4 w-4" />
                  Hide from Google (noindex)
                </label>
              </div>
            </details>

            <ul className="space-y-1.5 border-t border-white/10 pt-3 text-xs">
              {checks.map((c) => (
                <li key={c.text} className="flex gap-2">
                  <span className={c.ok ? "text-emerald-400" : c.warn ? "text-amber-300" : "text-red-400"}>{c.ok ? "✓" : c.warn ? "!" : "✕"}</span>
                  <span className="text-slate-300">{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </form>

      {article && (
        <form
          action={deleteArticleAction}
          onSubmit={(e) => {
            if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) e.preventDefault();
            else dirty.current = false;
          }}
          className="flex justify-end"
        >
          <input type="hidden" name="id" value={article.id} />
          <button className="rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10">Delete article</button>
        </form>
      )}
      <p className="text-xs text-slate-500">
        <Link href="/admin/articles" className="hover:text-brand">
          ← All articles
        </Link>
      </p>
    </div>
  );
}

function ToolButton({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="rounded-md px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
    >
      {children}
    </button>
  );
}
