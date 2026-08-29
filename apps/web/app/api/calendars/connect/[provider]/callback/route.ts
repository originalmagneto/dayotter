import { returnOrigin } from "@/lib/brand/origin";
import { connectCalendarAccount } from "@/lib/calendar/calendar-connect";
import { verifyState } from "@/lib/calendar/oauth-state";
import { providerConfig } from "@/lib/calendar/providers";
import { GoogleCalendarAdapter, MicrosoftCalendarAdapter } from "@dayotter/calendar";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** OAuth callback: verify state, exchange the code, persist the connection. */
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (provider !== "google" && provider !== "microsoft") {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  // Verified state does two jobs: it binds this callback to the user who began
  // the flow (anti-CSRF), and it carries which of our domains they began on.
  // Read it before any branch so a cancelled flow also ends where it started.
  //
  // The redirect target is built from a configured origin, never request.url -
  // behind a reverse proxy the request host is the internal container name
  // (e.g. c5b9330a…:3000), which would send the user to an unreachable URL.
  const payload = state ? verifyState(state) : null;
  const settings = new URL("/settings/calendars", returnOrigin(payload?.origin));

  if (url.searchParams.get("error")) {
    // Reflect only the provider's short error *code*, never arbitrary text.
    const code = (url.searchParams.get("error") ?? "").slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, "");
    settings.searchParams.set("error", code || "denied");
    return NextResponse.redirect(settings);
  }
  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  if (!payload || payload.provider !== provider) {
    return NextResponse.json({ error: "Invalid or expired state" }, { status: 400 });
  }

  const config = providerConfig(provider);
  try {
    const credentials =
      provider === "google"
        ? await GoogleCalendarAdapter.exchangeCode(config, code)
        : await MicrosoftCalendarAdapter.exchangeCode(config, code);

    const result = await connectCalendarAccount({
      userId: payload.userId,
      provider,
      credentials,
    });

    settings.searchParams.set("connected", provider);
    settings.searchParams.set("calendars", String(result.calendarCount));
    return NextResponse.redirect(settings);
  } catch (err) {
    // Log detail server-side; never reflect raw exception text into the URL,
    // which lands in browser history / referrer logs and can leak token-exchange
    // response fragments.
    console.error("[calendars/callback] connect failed:", err);
    settings.searchParams.set("error", "connect_failed");
    return NextResponse.redirect(settings);
  }
}
