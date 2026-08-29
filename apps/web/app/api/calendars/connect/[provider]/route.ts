import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth/session";
import { originForHost } from "@/lib/brand/origin";
import { createState } from "@/lib/calendar/oauth-state";
import { providerConfig, providerConfigured } from "@/lib/calendar/providers";
import { GoogleCalendarAdapter, MicrosoftCalendarAdapter } from "@dayotter/calendar";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Start the calendar-connection OAuth flow: redirect the user to consent. */
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (provider !== "google" && provider !== "microsoft") {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const session = await getSession();
  if (!session?.user?.id) {
    const signIn = new URL("/sign-in", request.url);
    return NextResponse.redirect(signIn);
  }

  // Without credentials the consent URL would carry an empty client_id and the
  // provider would reject it with a generic authorization error. Say so here.
  if (!providerConfigured(provider)) {
    const back = new URL("/settings/calendars", request.url);
    back.searchParams.set("error", `${provider} is not configured on this server`);
    return NextResponse.redirect(back);
  }

  // The origin is carried through the provider so the callback can land the
  // person back on the domain they started on, not on APP_URL's.
  const state = createState(
    { userId: session.user.id, provider, origin: originForHost(request.headers.get("host")) },
    randomUUID(),
  );
  const config = providerConfig(provider);
  const authUrl =
    provider === "google"
      ? GoogleCalendarAdapter.authUrl(config, state)
      : MicrosoftCalendarAdapter.authUrl(config, state);

  return NextResponse.redirect(authUrl);
}
