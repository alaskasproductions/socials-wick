import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Admin-uploaded media (article covers and inline images).
//
// Files live OUTSIDE public/: a Next.js production server only serves public/
// files that existed at build time, so uploads are written to UPLOAD_DIR
// (default <app>/storage/uploads, gitignored, survives `git pull`) and served
// by the /media/[...path] route.

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { ext: "webp", magic: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  "image/gif": { ext: "gif", magic: (b) => b.subarray(0, 4).toString() === "GIF8" },
};

export const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export class UploadError extends Error {}

function safeBase(name: string): string {
  const base = name.replace(/\.[^.]*$/, "");
  return (
    base
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 50) || "image"
  );
}

/** Validates and stores an image; returns its public URL (/media/<folder>/<file>). */
export async function saveImageUpload(file: File, folder = "articles"): Promise<string> {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) throw new UploadError("No file received.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Image is larger than 8 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const type = Object.entries(TYPES).find(([, t]) => t.magic(buf));
  if (!type) throw new UploadError("Only JPG, PNG, WebP or GIF images are allowed.");

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const dir = path.join(UPLOAD_DIR, folder, month);
  await mkdir(dir, { recursive: true });
  const filename = `${safeBase(file.name)}-${randomBytes(4).toString("hex")}.${type[1].ext}`;
  await writeFile(path.join(dir, filename), buf);
  return `/media/${folder}/${month}/${filename}`;
}
