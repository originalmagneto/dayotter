import { returnOrigin } from "@/lib/brand/origin";
import { verifyState } from "@/lib/calendar/oauth-state";
import { connectZoom, exchangeZoomCode, zoomEnabled } from "@/lib/integrations/zoom";
import { logger } from "@dayotter/core";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Zoom OAuth callback: verify state, exchange the code, store the connection. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // The signed state carries the domain the person started on; read it first so
  // every exit below lands there rather than on APP_URL's domain.
  const payload = state ? verifyState(state) : null;
  const settings = `${returnOrigin(payload?.origin)}/settings/calendars`;

  if (!zoomEnabled) return NextResponse.redirect(`${settings}?zoom=unavailable`);
  if (!code || !state) return NextResponse.redirect(`${settings}?zoom=error`);
  if (!payload || payload.provider !== "zoom") {
    return NextResponse.redirect(`${settings}?zoom=error`);
  }

  try {
    const { credentials, account } = await exchangeZoomCode(code);
    await connectZoom(payload.userId, credentials, account);
    return NextResponse.redirect(`${settings}?zoom=connected`);
  } catch (err) {
    logger.error("zoom connect failed", { event: "zoom_connect_failed", err });
    return NextResponse.redirect(`${settings}?zoom=error`);
  }
}
