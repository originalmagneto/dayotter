import type { Locale } from "@/lib/i18n";
/**
 * Tenant identities for a shared codebase.
 *
 * One fork, one branch, one upstream sync - and three domains that look like
 * three different companies. The identity is resolved per request from the
 * Host header, not from a build-time flag, so one image and one stack serve all
 * of them; everything a visitor sees that differs between the firms is a value
 * in here rather than a fork of the code.
 *
 * Data IS shared. One stack means one Postgres, so all three firms' rows live in
 * the same tables, separated by organization rather than by database. That was a
 * deliberate choice (see FORK.md) and it is the thing to remember before writing
 * a query: anything that reads without scoping to the caller's organization
 * reads across firms, and one of them is a law firm. Sharing a database with a
 * law firm's client list is a confidentiality question, not just a schema one.
 */
export interface Tenant {
  /** Product name, in metadata, emails and chrome. */
  name: string;
  tagline: string;
  email: string;
  /**
   * Hostnames this firm answers on. One deployment serves all three, so the
   * request's Host is what decides the identity - not a build-time flag.
   */
  domains: readonly string[];
  /** Which lockup `<BrandLockup>` draws. */
  mark: "skallars" | "hitl" | "wordmark";
  /**
   * The organization this firm's domain belongs to.
   *
   * The domain is the firm, so it is also the workspace: arriving on
   * cal.skallars.com puts you in SKALLARS' organization, with no active-org
   * cookie to get out of sync with what the page says it is.
   */
  organizationSlug: string;
  /**
   * Favicon and the small square used in booking footers and JSON-LD.
   * A letter tile for firms without a vector mark - it is a placeholder a
   * firm replaces by uploading its logo, never a stand-in for its identity.
   */
  icon: string;
  /**
   * Languages this firm offers its clients, in picker order.
   *
   * Deliberately narrower than SUPPORTED_LOCALES: offering a language on a
   * booking page is a promise that the firm can act in it. SKALLARS mirrors the
   * set on skallars.com - SK, EN, DE, CN - rather than every catalogue that
   * happens to ship with the app.
   */
  locales: readonly Locale[];
  /** Falls back to the first entry in `locales`. */
  locale: Locale;
  /** Which theme a first-time visitor sees. LAWOSS is a dark-first identity. */
  defaultTheme: "light" | "dark";
}

export const TENANTS: Record<string, Tenant> = {
  skallars: {
    name: "SKALLARS Law",
    organizationSlug: "skallars",
    domains: ["cal.skallars.com"],
    tagline: "Book time with the firm.",
    email: "info@skallars.com",
    mark: "skallars",
    icon: "/brand/skallars-icon.svg",
    locales: ["sk", "en", "de", "zh"],
    locale: "sk",
    defaultTheme: "light",
  },
  hitl: {
    name: "Human in the Loop",
    organizationSlug: "hitl",
    domains: ["cal.humanintheloop.sk", "localhost:3000"],
    icon: "/brand/hitl-icon.svg",
    tagline: "Book a slot.",
    email: "marian.cuprik@icloud.com",
    mark: "hitl",
    locales: ["en", "sk"],
    locale: "en",
    defaultTheme: "light",
  },
  lawoss: {
    name: "LAWOSS",
    organizationSlug: "lawoss",
    domains: ["cal.lawoss.app"],
    tagline: "Book a slot.",
    email: "majo@lawoss.app",
    mark: "wordmark",
    icon: "/brand/lawoss-icon.svg",
    locales: ["en", "sk"],
    locale: "en",
    defaultTheme: "dark",
  },
};

/** Default when a Host matches nothing - the gate's own identity. */
export const FALLBACK_TENANT_ID = "hitl";

/**
 * Which firm a request belongs to, from its Host header.
 *
 * Port is kept in the comparison so localhost:3000 can stand in for a tenant in
 * development; everything else matches on the bare hostname.
 */
export function tenantIdFromHost(host: string | null | undefined): string {
  if (!host) return FALLBACK_TENANT_ID;
  const h = host.toLowerCase().trim();
  const bare = h.split(":")[0] ?? h;
  for (const [id, t] of Object.entries(TENANTS)) {
    if (t.domains.some((d) => d === h || d === bare)) return id;
  }
  return FALLBACK_TENANT_ID;
}

/**
 * The request's own hostname, if this deployment actually serves it.
 *
 * Deliberately stricter than `tenantIdFromHost`, which falls back to a default
 * so a page always renders. This one answers a different question - "may we
 * send somebody to this host" - where a fallback would be an open redirect.
 * Exact match only, on the full host or the host without its port.
 */
export function knownHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const full = host.toLowerCase().trim();
  const bare = full.split(":")[0] ?? full;
  for (const tenant of Object.values(TENANTS)) {
    if (tenant.domains.some((d) => d === full || d === bare)) return full;
  }
  return null;
}

export function tenantFromHost(host: string | null | undefined): Tenant {
  return TENANTS[tenantIdFromHost(host)] ?? TENANTS[FALLBACK_TENANT_ID]!;
}
