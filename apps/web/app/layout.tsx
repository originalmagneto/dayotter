import { Analytics } from "@/components/analytics";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { TenantProvider } from "@/lib/brand/context";
import { getTenant, getTenantId } from "@/lib/brand/server";
import { BRAND } from "@/lib/marketing";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

// General Sans (Indian Type Foundry) - the SKALLARS house grotesque, the same
// face the firm's site and document templates use, so the booking link reads as
// a continuation of the brand rather than a different product. One variable file
// carries every weight; Geist Mono still handles the small uppercase eyebrow
// labels. Both self-hosted - no runtime network request.
// Inter is Human in the Loop's face; General Sans is SKALLARS'. Both ship, and
// the tenant's CSS block points --font-sans at the right one - a few unused KB
// against a second build pipeline per firm.
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

const generalSans = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  variable: "--font-general-sans",
  weight: "200 700",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // Per request, not per build: one deployment answers on three domains and the
  // title, description and icon all have to follow the Host.
  const tenant = await getTenant();
  const description = `Book a time with ${tenant.name}. Pick a slot that suits you - no back-and-forth, confirmation by email.`;
  return {
    metadataBase: new URL(BRAND.url),
    title: {
      default: `${tenant.name} - booking`,
      template: `%s - ${tenant.name}`,
    },
    description: description,
    applicationName: tenant.name,
    keywords: [tenant.name, "booking", "konzultácia", "rezervácia termínu", "appointment"],
    authors: [{ name: tenant.name, url: BRAND.url }],
    creator: tenant.name,
    publisher: tenant.name,
    alternates: { canonical: "/" },
    icons: { icon: "${TENANT.icon}", apple: "${TENANT.icon}" },
    openGraph: {
      type: "website",
      siteName: tenant.name,
      title: `${tenant.name} - booking`,
      description: description,
      url: BRAND.url,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tenant.name} - booking`,
      description: description,
      creator: "@dayotter",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

// Set the theme class before first paint to avoid a flash of the wrong theme.

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [tenant, tenantId] = await Promise.all([getTenant(), getTenantId()]);
  // The tenant's default is baked in: LAWOSS is a dark-first identity, and
  // defaulting it to light would flash the wrong world before the toggle runs.
  const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'${tenant.defaultTheme}';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${inter.variable} ${plexSans.variable} ${playfair.variable} ${GeistMono.variable}`}
      // Selects the tenant's palette block in globals.css. An attribute rather
      // than an inline style because inline styles cannot carry a light and a
      // dark palette at the same time.
      data-tenant={tenantId}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme script (static string, no user input) to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <TenantProvider tenant={tenant}>
          <OrganizationJsonLd />
          {children}
          <Analytics />
        </TenantProvider>
      </body>
    </html>
  );
}
