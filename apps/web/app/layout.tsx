import { Analytics } from "@/components/analytics";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { TENANT, TENANT_ID } from "@/lib/brand/tenants";
import { BRAND } from "@/lib/marketing";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

const generalSans = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  variable: "--font-general-sans",
  weight: "200 700",
  display: "swap",
});

const DESCRIPTION =
  "Book a time with SKALLARS Law. Pick a slot that suits you - no back-and-forth, confirmation by email.";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: "SKALLARS Law - booking",
    template: "%s - SKALLARS Law",
  },
  description: DESCRIPTION,
  applicationName: BRAND.name,
  keywords: ["SKALLARS", "advokátska kancelária", "booking", "konzultácia", "rezervácia termínu"],
  authors: [{ name: BRAND.name, url: BRAND.url }],
  creator: BRAND.name,
  publisher: BRAND.name,
  alternates: { canonical: "/" },
  icons: { icon: "/brand/skallars-icon.svg", apple: "/brand/skallars-icon.svg" },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: "SKALLARS Law - the AI-native, open-source scheduling platform",
    description: DESCRIPTION,
    url: BRAND.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKALLARS Law - the AI-native, open-source scheduling platform",
    description: DESCRIPTION,
    creator: "@dayotter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// Set the theme class before first paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${inter.variable} ${GeistMono.variable}`}
      // Selects the tenant's palette block in globals.css. An attribute rather
      // than an inline style because inline styles cannot carry a light and a
      // dark palette at the same time.
      data-tenant={TENANT_ID}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme script (static string, no user input) to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <OrganizationJsonLd />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
