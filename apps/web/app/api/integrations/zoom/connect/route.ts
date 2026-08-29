import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth/session";
import { originForHost } from "@/lib/brand/origin";
import { createState } from "@/lib/calendar/oauth-state";
import { zoomAuthUrl, zoomEnabled } from "@/lib/integrations/zoom";
import { env } from "@/lib/server/env";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Start the Zoom OAuth flow: redirect the host to Zoom's consent screen. */
export async function GET(request: Request) {
  // Stay on the firm's own domain throughout, and tell the callback where to
  // finish - Zoom returns to the one redirect URI registered for the stack.
  const origin = originForHost(request.headers.get("host"));
  const base = origin ?? env.APP_URL;

  const session = await getSession();
  if (!session?.user?.id) return NextResponse.redirect(`${base}/sign-in`);
  if (!zoomEnabled) {
    return NextResponse.redirect(`${base}/settings/calendars?zoom=unavailable`);
  }
  const state = createState({ userId: session.user.id, provider: "zoom", origin }, randomUUID());
  return NextResponse.redirect(zoomAuthUrl(state));
}
