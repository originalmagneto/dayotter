import { returnOrigin } from "@/lib/brand/origin";
import { verifyState } from "@/lib/calendar/oauth-state";
import { logger } from "@dayotter/core";
import { connectCrm, exchangeCrmCode, isCrmProvider } from "@dayotter/integrations";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** CRM OAuth callback: verify state, exchange the code, store the connection. */
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // The signed state carries the domain the person started on; read it first so
  // every exit below lands there rather than on APP_URL's domain.
  const payload = state ? verifyState(state) : null;
  const settings = `${returnOrigin(payload?.origin)}/settings/crm`;

  if (!isCrmProvider(provider)) return NextResponse.redirect(`${settings}?crm=error`);
  if (!code || !state) return NextResponse.redirect(`${settings}?crm=error`);
  if (!payload || payload.provider !== provider) {
    return NextResponse.redirect(`${settings}?crm=error`);
  }

  try {
    const { credentials, account } = await exchangeCrmCode(provider, code);
    await connectCrm(payload.userId, provider, credentials, account);
    return NextResponse.redirect(`${settings}?crm=connected`);
  } catch (err) {
    logger.error("crm connect failed", { event: "crm_connect_failed", provider, err });
    return NextResponse.redirect(`${settings}?crm=error`);
  }
}
