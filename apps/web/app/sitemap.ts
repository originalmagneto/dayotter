import { BRAND } from "@/lib/marketing";
import type { MetadataRoute } from "next";

/**
 * There is almost nothing here to crawl, and that is deliberate.
 *
 * The marketing site is gated off on these deployments (see
 * `app/(marketing)/layout.tsx`), the root redirects to sign-in, and booking
 * pages are links a firm hands to a specific client rather than pages it wants
 * indexed. What is left is the two legal pages.
 *
 * The absolute URL comes from NEXT_PUBLIC_APP_URL, so on a multi-firm stack the
 * sitemap speaks for whichever domain that names. Fine while it lists only
 * pages every domain serves identically; revisit if anything firm-specific is
 * ever added here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${BRAND.url}${path}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority,
  });

  return [entry("/privacy", 0.3), entry("/terms", 0.3)];
}
