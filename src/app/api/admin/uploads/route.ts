import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveImageUpload, UploadError } from "@/lib/uploads";

// Image upload for the article editor (multipart/form-data, field "file").
// A route handler rather than a server action: server actions cap request
// bodies at 1 MB by default, too small for cover images.
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
    const url = await saveImageUpload(file, "articles");
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof UploadError ? err.message : "Upload failed.";
    if (!(err instanceof UploadError)) console.error("[uploads]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
