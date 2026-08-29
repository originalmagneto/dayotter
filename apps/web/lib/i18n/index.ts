/**
 * Shared i18n primitives. Message catalogs live as JSON under `locales/` so
 * translators can contribute without editing TypeScript. Each namespace
 * (booking, otter, …) must be complete for every supported locale so the UI
 * is never half-translated.
 */

export const SUPPORTED_LOCALES = ["en", "sk", "de", "zh", "es", "fr", "pt", "it", "nl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Each locale's name in its own language, for language pickers. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  sk: "Slovenčina",
  zh: "中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  nl: "Nederlands",
};

/** Map a browser/Accept-Language value (e.g. "es-419,es;q=0.9") to a supported locale. */
export function resolveLocale(
  input: string | null | undefined,
  /**
   * The languages actually on offer. Defaults to everything the app ships, but
   * a tenant passes its own narrower set: a German browser should only get a
   * German page from a firm that offers German, not from every deployment that
   * happens to have the catalogue.
   */
  offered: readonly Locale[] = SUPPORTED_LOCALES,
): Locale {
  const fallback = offered[0] ?? DEFAULT_LOCALE;
  if (!input) return fallback;
  for (const part of input.split(",")) {
    const tag = part.trim().split(";")[0]?.toLowerCase() ?? "";
    const base = tag.split("-")[0] as Locale;
    if ((offered as readonly string[]).includes(base)) return base;
  }
  return fallback;
}

/** Interpolate `{name}` placeholders in a message string. */
export function interpolate(s: string, vars?: Record<string, string | number>): string {
  return vars ? s.replace(/\{(\w+)\}/g, (_m, k: string) => String(vars[k] ?? `{${k}}`)) : s;
}
