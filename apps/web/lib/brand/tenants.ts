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
   * Palette overrides, applied as inline CSS variables on <html> so every
   * `var(--color-*)` descendant follows - the same mechanism the per-host
   * booking-page branding already uses. Omitted keys fall through to globals.css.
   */
  tokens: Record<string, string>;
  /** Default booking-surface locale for this tenant's clients. */
  locale: "sk" | "en";
}

export const TENANTS: Record<string, Tenant> = {
  skallars: {
    name: "SKALLARS Law",
    tagline: "Book time with the firm.",
    email: "info@skallars.com",
    mark: "skallars",
    tokens: {}, // globals.css is already the SKALLARS palette
    locale: "sk",
  },
  hitl: {
    name: "Human in the Loop",
    tagline: "Book a slot.",
    email: "marian.cuprik@icloud.com",
    mark: "wordmark",
    // Placeholder until the real palette lands - deliberately distinct from
    // SKALLARS so a misconfigured TENANT is obvious at a glance rather than
    // silently serving one firm's identity under the other's domain.
    tokens: {
      "--color-brand": "#0f766e",
      "--color-accent": "#0f766e",
      "--color-accent-hover": "#115e56",
      "--color-accent-soft": "#d9f2ee",
    },
    locale: "en",
  },
  lawoss: {
    name: "LAWOSS",
    tagline: "Book a slot.",
    email: "majo@lawoss.app",
    mark: "wordmark",
    // Placeholder until the real palette lands.
    tokens: {
      "--color-brand": "#1d4ed8",
      "--color-accent": "#1d4ed8",
      "--color-accent-hover": "#1a43ba",
      "--color-accent-soft": "#e0e8fb",
    },
    locale: "en",
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
