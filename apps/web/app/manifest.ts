import { getTenant } from "@/lib/brand/server";
import { BRAND } from "@/lib/marketing";
import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const tenant = await getTenant();
  return {
    name: tenant.name,
    short_name: tenant.name,
    description: "The AI-native, open-source scheduling platform.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f6fc",
    theme_color: "#5d00ff",
    icons: [
      { src: "/brand/skallars-icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/skallars-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
