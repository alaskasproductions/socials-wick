import { readFile, stat } from "fs/promises";
import path from "path";
import { MIME_BY_EXT, UPLOAD_DIR } from "@/lib/uploads";

// Serves admin-uploaded images from UPLOAD_DIR (see src/lib/uploads.ts).
// Filenames carry a random suffix, so responses are cached for a year.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  if (!parts?.length || parts.some((p) => p === ".." || p.includes("\\") || p.startsWith("."))) {
    return new Response("Not found", { status: 404 });
  }
  const root = path.resolve(UPLOAD_DIR);
  const file = path.resolve(root, ...parts);
  if (!file.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });

  const ext = path.extname(file).slice(1).toLowerCase();
  const type = MIME_BY_EXT[ext];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const info = await stat(file);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const body = await readFile(file);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Last-Modified": info.mtime.toUTCString(),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
