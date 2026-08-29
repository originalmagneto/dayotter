import type { Locale } from "@/lib/i18n";
/**
 * Tenant identities for a shared codebase.
 *
 * One fork, one branch, one upstream sync - and two deployments that look like
 * two different companies. Each Dokploy service picks its identity with
 * NEXT_PUBLIC_TENANT; everything a visitor sees that differs between the firms
 * is a value in here rather than a fork of the code.
 *
 * Data is NOT shared: each deployment has its own database. That is the point
 * of running them as separate stacks rather than theming one by hostname - a
 * law firm's client data and a consultancy's have no business in one table.
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
    domains: ["cal.skallars.com", "cal.skallars.co"],
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

export function tenantFromHost(host: string | null | undefined): Tenant {
  return TENANTS[tenantIdFromHost(host)] ?? TENANTS[FALLBACK_TENANT_ID]!;
}
