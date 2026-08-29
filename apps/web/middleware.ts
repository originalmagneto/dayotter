import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Authenticated app surfaces that must NOT be framable (clickjacking defense).
 * Public booking pages (`/[handle]/[slug]`, `/book/*`) and the embed script are
 * deliberately left framable so customers can embed them.
 */
const FRAME_DENY = [
  "/dashboard",
  "/inbox",
  "/event-types",
  "/teams",
  "/bookings",
  "/insights",
  "/analytics",
  "/availability",
  "/settings",
];

/**
 * The marketing site, gated at the edge.
 *
 * `app/(marketing)/layout.tsx` already calls `notFound()`, and that is the
 * backstop: it covers any page upstream adds to the group after a rebase,
 * without anyone having to remember this list. But the root `app/loading.tsx`
 * makes every route stream, so by the time the layout throws, the 200 has
 * already been flushed - the visitor sees the 404 page, the response says OK,
 * and the page's own <title> is in the head. Matching here as well turns those
 * into a real 404, before any of the page runs.
 *
 * Keep both. This list is exact-or-child, so `/pricing` and `/docs/anything`
 * match while a booking handle like `/pricing-team` does not.
 */
const MARKETING = [
  "/home",
  "/pricing",
  "/features",
  "/integrations",
  "/vs",
  "/for",
  "/docs",
  "/blog",
  "/glossary",
  "/about",
  "/contact",
  "/changelog",
  "/status",
  "/security",
  "/self-hosting",
];

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const p = req.nextUrl.pathname;

  // 404 the marketing site before it renders (see MARKETING above).
  if (MARKETING.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))) {
    return NextResponse.rewrite(new URL("/_not-found", req.url), { status: 404 });
  }

  // Baseline hardening on every response.
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-DNS-Prefetch-Control", "off");

  // Deny framing of the authenticated app; leave public/embeddable pages alone.
  if (FRAME_DENY.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))) {
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  }

  return res;
}

export const config = {
  // Everything except Next internals + static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
