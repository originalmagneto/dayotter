import { getSession } from "@/lib/auth/session";
import { storeImage } from "@/lib/uploads";
import { eq, getDb, schema } from "@dayotter/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  "too-large": "That image is over 2 MB. Please use a smaller one.",
  "unsupported-type": "Please upload a PNG, JPEG or WebP image.",
  empty: "That file is empty.",
};

/**
 * Store an avatar or the firm's logo.
 *
 * `kind` decides where the resulting URL is written, not what is accepted -
 * both go through the same validation, and neither trusts the filename or the
 * content-type the browser sent.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (kind !== "avatar" && kind !== "logo") {
    return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
  }

  const stored = await storeImage(file);
  if (typeof stored === "string") {
    return NextResponse.json({ error: MESSAGES[stored] ?? "Upload refused" }, { status: 400 });
  }

  const db = getDb();
  if (kind === "avatar") {
    await db
      .update(schema.users)
      .set({ image: stored.url })
      .where(eq(schema.users.id, session.user.id));
  } else {
    // The logo is the firm's, not the person's: it lives on the organization so
    // every booking page in this deployment carries the same mark.
    const membership = await db.query.memberships.findFirst({
      where: eq(schema.memberships.userId, session.user.id),
      columns: { organizationId: true },
    });
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 400 });
    await db
      .update(schema.organizations)
      .set({ logo: stored.url })
      .where(eq(schema.organizations.id, membership.organizationId));
  }

  return NextResponse.json({ url: stored.url });
}
