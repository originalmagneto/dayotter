import { MarketingNav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/sections";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The marketing site is off on this deployment.
 *
 * Every hostname here belongs to a firm, and these pages sell the scheduling
 * product to someone shopping for one: pricing, feature tours, competitor
 * comparisons, the changelog. On cal.<firm> they are noise at best and confusing
 * at worst - a client following a booking link has no reason to land on a plan
 * comparison. So the whole group 404s, marketing nav and all.
 *
 * The files stay in the tree deliberately, rather than being deleted: upstream
 * keeps editing them, and this fork rebases onto upstream (see FORK.md). A
 * deleted page is a conflict on every sync; a gated one is not. Drop this
 * `notFound()` to turn the marketing site back on.
 *
 * /privacy and /terms live in `(legal)` instead - they are linked from sign-up
 * and from booking confirmations, so they have to stay reachable.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  notFound();

  return (
    <div className="grain relative min-h-screen">
      <MarketingNav />
      <main className="relative z-10 pt-14">{children}</main>
      <Footer />
    </div>
  );
}
