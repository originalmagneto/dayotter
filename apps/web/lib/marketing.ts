/** Brand + marketing constants. One place for links, contact, and footer nav. */

/**
 * Links and constants that are the same for every firm on this deployment.
 *
 * The name, tagline and contact address deliberately do NOT live here any more:
 * one deployment serves three firms, so those are request-scoped. Use
 * `getTenant()` in server code and `useTenant()` in client components - if this
 * object still carried a name, every caller would silently get whichever firm
 * happened to be the default.
 */
export const BRAND = {
  /** Canonical site origin - drives metadataBase, sitemap, canonical URLs, JSON-LD. */
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://cal.humanintheloop.sk",
  /**
   * The fork this instance runs. Not vanity: SKALLARS Law is AGPLv3, and section 13
   * requires that people who interact with a modified version over a network be
   * offered its Corresponding Source. The booking footer links here.
   */
  github: "https://github.com/originalmagneto/dayotter",
  githubLicense: "https://github.com/originalmagneto/dayotter/blob/main/LICENSE",
  githubContributing: "https://github.com/originalmagneto/dayotter/blob/main/CONTRIBUTING.md",
  discussions: "https://github.com/originalmagneto/dayotter/discussions",
  /** Upstream project this is built on - credited, not hidden. */
  upstream: "https://github.com/Dayotter/dayotter",
  discord: "",
  x: "",
  copyrightYear: 2026,
};

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

/** Footer navigation. Every link resolves to a real page or landing anchor. */
export const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Integrations", href: "/integrations" },
      { label: "Pricing", href: "/pricing" },
      { label: "How it works", href: "/#how" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs Calendly", href: "/vs/calendly" },
      { label: "vs Cal.com", href: "/vs/cal-com" },
      { label: "vs Google Calendar", href: "/vs/google-calendar" },
      { label: "vs Motion", href: "/vs/motion" },
      { label: "vs Reclaim", href: "/vs/reclaim" },
      { label: "All comparisons", href: "/vs" },
    ],
  },
  {
    title: "For",
    links: [
      { label: "Founders", href: "/for/founders" },
      { label: "Teams", href: "/for/teams" },
      { label: "Sales teams", href: "/for/sales" },
      { label: "Customer success", href: "/for/customer-success" },
      { label: "Consultants", href: "/for/consultants" },
      { label: "Freelancers", href: "/for/freelancers" },
      { label: "All roles", href: "/for" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Glossary", href: "/glossary" },
      { label: "Self-hosting", href: "/self-hosting" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discussions", href: BRAND.discussions, external: true },
      { label: "GitHub", href: BRAND.github, external: true },
      { label: "Contribute", href: BRAND.githubContributing, external: true },
      ...(BRAND.discord ? [{ label: "Discord", href: BRAND.discord, external: true }] : []),
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Status", href: "/status" },
    ],
  },
];

/** Top-nav links shown on marketing pages. */
export const MARKETING_NAV: FooterLink[] = [
  { label: "Features", href: "/features" },
  { label: "Integrations", href: "/integrations" },
  { label: "Pricing", href: "/pricing" },
  { label: "Compare", href: "/vs" },
  { label: "Docs", href: "/docs" },
];
