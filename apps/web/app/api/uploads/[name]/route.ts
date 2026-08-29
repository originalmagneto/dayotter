import { readUpload } from "@/lib/uploads";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Serve a stored image.
 *
 * The content-type is derived from the bytes on disk, never echoed from the
 * upload, and `nosniff` stops a browser second-guessing it. Together with the
 * raster-only rule in lib/uploads.ts, that is what keeps a file served from
 * this origin from becoming a script.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const found = await readUpload(name);
  if (!found) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(found.bytes), {
    headers: {
      "Content-Type": found.mime,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      ETag: found.etag,
      // Names are random and content-addressed in practice, so a long cache is
      // safe: changing the image produces a different URL.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
