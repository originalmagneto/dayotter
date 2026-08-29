import { describe, expect, it } from "vitest";
import { type BookingKey, SUPPORTED_LOCALES, resolveLocale, t } from "./booking";
import en from "./locales/en/booking.json";

describe("resolveLocale", () => {
  it("defaults to en for empty/unknown", () => {
    expect(resolveLocale(null)).toBe("en");
    expect(resolveLocale("")).toBe("en");
    expect(resolveLocale("ja-JP,ja")).toBe("en");
  });

  it("maps a regional tag to its base locale", () => {
    expect(resolveLocale("es-419,es;q=0.9")).toBe("es");
    expect(resolveLocale("fr-CA")).toBe("fr");
    expect(resolveLocale("de")).toBe("de");
    expect(resolveLocale("pt-BR")).toBe("pt");
  });

  it("picks the first supported language in the list", () => {
    expect(resolveLocale("ja,es;q=0.8,en;q=0.5")).toBe("es");
  });
});

describe("t", () => {
  it("translates a key per locale", () => {
    expect(t("en", "selectTime")).toBe("Select a time");
    expect(t("es", "selectTime")).toBe("Elige una hora");
    expect(t("de", "recommended")).toBe("Empfohlene Zeiten");
  });

  it("interpolates variables", () => {
    expect(t("en", "timesIn", { zone: "Asia/Calcutta" })).toBe("Times shown in Asia/Calcutta");
    expect(t("es", "overlaySummaryMany", { n: 3 })).toContain("3 compromisos");
  });

  it("falls back to English for an unmapped locale", () => {
    // @ts-expect-error - exercising the runtime fallback path
    expect(t("zz", "selectTime")).toBe("Select a time");
  });

  it("falls back to the key rather than throwing when no catalogue has it", () => {
    // A key present in no catalogue used to reach interpolate() as undefined,
    // where `.replace` threw and the error boundary blanked the booking page.
    // @ts-expect-error - exercising the runtime fallback path
    expect(() => t("en", "notARealKey")).not.toThrow();
    // @ts-expect-error - exercising the runtime fallback path
    expect(t("en", "notARealKey", { n: 3 })).toBe("notARealKey");
  });
});

describe("catalogues agree with each other", () => {
  // `MESSAGES: Record<Locale, Record<BookingKey, string>>` already forces every
  // locale to carry every key, so the compiler covers that. What it cannot see
  // is inside the strings: a translation that drops `{host}` renders a sentence
  // missing its subject, and one that invents `{name}` leaves the braces on
  // screen - interpolate() only replaces what it is given.
  const placeholders = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort().join(",");
  const keys = Object.keys(en) as BookingKey[];

  for (const locale of SUPPORTED_LOCALES) {
    it(`${locale} uses the same placeholders as English`, () => {
      const mismatched = keys
        .filter((k) => placeholders(t(locale, k)) !== placeholders(en[k]))
        .map((k) => `${k}: expected ${placeholders(en[k]) || "none"}`);
      expect(mismatched).toEqual([]);
    });
  }

  it("leaves no string untranslated outside English", () => {
    // Not a hard rule - "Google Calendar" is the same everywhere - so this only
    // guards the sentences, where an identical string means a forgotten one.
    const copied = keys.filter(
      (k) => en[k].length > 24 && SUPPORTED_LOCALES.every((l) => t(l, k) === en[k]),
    );
    expect(copied).toEqual([]);
  });
});
