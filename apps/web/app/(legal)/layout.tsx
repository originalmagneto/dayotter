import { BrandLockup } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getTenant } from "@/lib/brand/server";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Chrome for the two pages a firm's clients are entitled to read without an
 * account: the privacy policy and the terms.
 *
 * Its own group rather than the marketing one. Everything under `(marketing)`
 * is 404 on these deployments - it sells the scheduling product, which is not
 * what a law firm's domain is for - but a link to the privacy policy sits under
 * every sign-up form and inside booking confirmations, so these two have to
 * survive. They also can't wear the marketing nav: half of what it links to is
 * gone.
 */
export default async function LegalLayout({ children }: { children: ReactNode }) {
  const tenant = await getTenant();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" aria-label={tenant.name}>
            <BrandLockup height={26} />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-caption text-[var(--color-faint)]">
          <span>
            © {new Date().getFullYear()} {tenant.name}
          </span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--color-muted)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--color-muted)]">
              Terms
            </Link>
            <a href={`mailto:${tenant.email}`} className="hover:text-[var(--color-muted)]">
              {tenant.email}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
