import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Local file storage for the two images a deployment lets people set: a
 * person's avatar and the firm's logo.
 *
 * Deliberately raster-only. An uploaded SVG is a script-execution primitive -
 * it can carry <script>, event handlers and javascript: hrefs - and these files
 * are served from the app's own origin, where that would be same-origin script
 * against a logged-in session. Hand-rolled SVG sanitisers are exactly where
 * XSS lives, so vector marks belong in the repo (see lib/brand/tenants.ts),
 * not in an upload form.
 */
const MAX_BYTES = 2 * 1024 * 1024;

/** Magic bytes, because a file extension is a claim and not evidence. */
const SIGNATURES: { ext: string; mime: string; test: (b: Buffer) => boolean }[] = [
  {
    ext: "png",
    mime: "image/png",
    test: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  {
    ext: "jpg",
    mime: "image/jpeg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
];

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads");

export interface StoredUpload {
  /** Public path to render, e.g. `/api/uploads/ab12….png`. */
  url: string;
  mime: string;
}

export type UploadError = "too-large" | "unsupported-type" | "empty";

/**
 * Validate and store an uploaded image. Returns the public URL, or the reason
 * it was refused - never a partially written file.
 */
export async function storeImage(file: Blob): Promise<StoredUpload | UploadError> {
  if (file.size === 0) return "empty";
  if (file.size > MAX_BYTES) return "too-large";

  const bytes = Buffer.from(await file.arrayBuffer());
  // Re-check after reading: `size` is what the client claimed.
  if (bytes.byteLength > MAX_BYTES) return "too-large";

  const match = SIGNATURES.find((s) => s.test(bytes));
  if (!match) return "unsupported-type";

  await mkdir(UPLOAD_DIR, { recursive: true });
  // Random name, and the extension comes from what the bytes actually are -
  // never from the uploaded filename, which is attacker-controlled.
  const name = `${randomBytes(16).toString("hex")}.${match.ext}`;
  await writeFile(join(UPLOAD_DIR, name), bytes, { mode: 0o644 });
  return { url: `/api/uploads/${name}`, mime: match.mime };
}

/** Only ever resolve names this module generated: 32 hex chars + a known ext. */
const SAFE_NAME = /^[0-9a-f]{32}\.(png|jpg|webp)$/;

export async function readUpload(
  name: string,
): Promise<{ bytes: Buffer; mime: string; etag: string } | null> {
  if (!SAFE_NAME.test(name)) return null; // also defeats any ../ traversal
  const ext = name.split(".").pop();
  const mime = SIGNATURES.find((s) => s.ext === ext)?.mime;
  if (!mime) return null;
  try {
    const bytes = await readFile(join(UPLOAD_DIR, name));
    return { bytes, mime, etag: `"${createHash("sha1").update(bytes).digest("hex")}"` };
  } catch {
    return null;
  }
}
