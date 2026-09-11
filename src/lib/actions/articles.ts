"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articlePath, DEFAULT_AUTHOR, slugify } from "@/lib/article-text";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

export type ArticleFormState = { error?: string; success?: string; slug?: string } | undefined;

const str = (fd: FormData, key: string, max = 100_000) => String(fd.get(key) ?? "").trim().slice(0, max);

function revalidateArticle(slug: string, oldSlug?: string) {
  revalidatePath("/blog");
  revalidatePath(articlePath(slug));
  if (oldSlug && oldSlug !== slug) revalidatePath(articlePath(oldSlug));
  revalidatePath("/sitemap.xml");
  revalidatePath("/blog/rss.xml");
  revalidatePath("/admin/articles");
  revalidatePath("/", "layout"); // navbar/footer "Blog" link
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  for (let n = 2; ; n++) {
    const clash = await prisma.article.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${n}`;
  }
}

export async function saveArticleAction(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();

  const id = str(formData, "id", 60) || undefined;
  const intent = str(formData, "intent", 20); // "draft" | "publish" | "save"
  const title = str(formData, "title", 200);
  if (!title) return { error: "Title is required." };

  const rawSlug = str(formData, "slug", 120);
  const baseSlug = slugify(rawSlug || title);
  if (!baseSlug) return { error: "The URL slug must contain letters or numbers." };

  const canonicalUrl = str(formData, "canonicalUrl", 500);
  if (canonicalUrl && !/^https?:\/\/[^\s]+$/i.test(canonicalUrl)) {
    return { error: "Canonical URL must be a full URL starting with https://." };
  }
  const coverImage = str(formData, "coverImage", 500) || null;
  // Uploaded (/media/...), bundled (/images/...) or an absolute https:// image.
  if (coverImage && !/^(\/(?!\/)|https?:\/\/)/i.test(coverImage)) {
    return { error: "Cover image must be an uploaded image, a site path or a full https:// URL." };
  }

  const existing = id ? await prisma.article.findUnique({ where: { id } }) : null;
  if (id && !existing) return { error: "Article not found — it may have been deleted." };

  // A manually typed slug that clashes is an error; an auto slug gets a numeric suffix.
  let slug = baseSlug;
  if (rawSlug) {
    const clash = await prisma.article.findFirst({
      where: { slug: baseSlug, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    });
    if (clash) return { error: `Another article already uses the URL /blog/${baseSlug}.` };
  } else {
    slug = await uniqueSlug(baseSlug, id);
  }

  let status = str(formData, "status", 20) === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  if (intent === "publish") status = "PUBLISHED";
  if (intent === "draft") status = "DRAFT";

  const dateInput = str(formData, "publishedAt", 40);
  let publishedAt: Date | null = existing?.publishedAt ?? null;
  if (dateInput) {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return { error: "Publish date is not a valid date." };
    publishedAt = d;
  }
  if (status === "PUBLISHED" && !publishedAt) publishedAt = new Date();

  const data = {
    title,
    slug,
    excerpt: str(formData, "excerpt", 500),
    content: str(formData, "content", 200_000),
    coverImage,
    coverAlt: str(formData, "coverAlt", 200),
    category: str(formData, "category", 60),
    tags: str(formData, "tags", 300)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(", "),
    authorName: str(formData, "authorName", 80) || DEFAULT_AUTHOR,
    status,
    publishedAt,
    metaTitle: str(formData, "metaTitle", 120),
    metaDescription: str(formData, "metaDescription", 320),
    canonicalUrl,
    noindex: formData.get("noindex") === "on",
  };

  if (existing) {
    await prisma.article.update({ where: { id: existing.id }, data });
    revalidateArticle(slug, existing.slug);
    return {
      success:
        status !== "PUBLISHED"
          ? "Saved as draft."
          : publishedAt && publishedAt > new Date()
            ? "Saved. The article is scheduled and goes live on its publish date."
            : "Saved. The article is live.",
      slug,
    };
  }

  const created = await prisma.article.create({ data });
  revalidateArticle(slug);
  redirect(`/admin/articles/${created.id}?created=1`);
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const article = await prisma.article.findUnique({ where: { id } });
  if (article) {
    await prisma.article.delete({ where: { id } });
    revalidateArticle(article.slug);
  }
  redirect("/admin/articles?deleted=1");
}
