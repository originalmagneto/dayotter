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
  /** Which lockup `<BrandLockup>` draws. */
  mark: "skallars" | "wordmark";
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
    icon: "/brand/hitl-icon.svg",
    tagline: "Book a slot.",
    email: "marian.cuprik@icloud.com",
    mark: "wordmark",
    locales: ["en", "sk"],
    locale: "en",
    defaultTheme: "light",
  },
  lawoss: {
    name: "LAWOSS",
    tagline: "Book a slot.",
    email: "majo@lawoss.app",
    mark: "wordmark",
    icon: "/brand/lawoss-icon.svg",
    locales: ["en", "sk"],
    locale: "en",
    defaultTheme: "dark",
  },
};

export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT ?? "skallars";

/**
 * The active tenant. A typo in NEXT_PUBLIC_TENANT throws here rather than
 * quietly falling back: serving one firm's identity on another firm's domain is
 * the worst failure this file can have, and it is silent unless we make it loud.
 */
const resolved = TENANTS[TENANT_ID];
if (!resolved) {
  throw new Error(
    `Unknown NEXT_PUBLIC_TENANT "${TENANT_ID}". Known tenants: ${Object.keys(TENANTS).join(", ")}.`,
  );
}
export const TENANT: Tenant = resolved;
