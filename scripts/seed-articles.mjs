// Publishes the Markdown articles in content/articles/*.md into the Article table.
//
//   node scripts/seed-articles.mjs            create missing articles (existing slugs are skipped)
//   node scripts/seed-articles.mjs --update   also overwrite text/SEO fields of existing ones
//
// Each file starts with a front-matter block of `key: value` lines between `---`
// markers (order, slug, title, metaTitle, metaDescription, excerpt, category,
// tags, coverAlt). The cover is public/images/blog/<slug>.webp.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const DIR = path.join(process.cwd(), "content", "articles");
const update = process.argv.includes("--update");
const prisma = new PrismaClient();

function parse(file, raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  for (const k of ["slug", "title", "metaDescription", "excerpt"]) {
    if (!meta[k]) throw new Error(`${file}: front matter is missing "${k}"`);
  }
  return { meta, content: m[2].trim() + "\n" };
}

const files = (await readdir(DIR)).filter((f) => f.endsWith(".md")).sort();
const now = Date.now();
let created = 0, updated = 0, skipped = 0;

for (const file of files) {
  const { meta, content } = parse(file, await readFile(path.join(DIR, file), "utf8"));
  const order = Number(meta.order || 0);
  const data = {
    title: meta.title,
    excerpt: meta.excerpt,
    content,
    coverImage: `/images/blog/${meta.slug}.webp`,
    coverAlt: meta.coverAlt || meta.title,
    category: meta.category || "",
    tags: meta.tags || "",
    metaTitle: meta.metaTitle || "",
    metaDescription: meta.metaDescription,
  };
  const existing = await prisma.article.findUnique({ where: { slug: meta.slug } });
  if (existing) {
    if (!update) {
      skipped++;
      console.log(`skip    ${meta.slug} (already exists)`);
      continue;
    }
    await prisma.article.update({ where: { slug: meta.slug }, data });
    updated++;
    console.log(`update  ${meta.slug}`);
  } else {
    await prisma.article.create({
      data: {
        ...data,
        slug: meta.slug,
        status: "PUBLISHED",
        // Newest first on /blog follows the numbering (01 on top).
        publishedAt: new Date(now - order * 60_000),
      },
    });
    created++;
    console.log(`create  ${meta.slug}`);
  }
}

console.log(`\n${created} created, ${updated} updated, ${skipped} skipped`);
await prisma.$disconnect();
