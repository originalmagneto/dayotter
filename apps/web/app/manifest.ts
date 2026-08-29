import { BRAND } from "@/lib/marketing";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
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
