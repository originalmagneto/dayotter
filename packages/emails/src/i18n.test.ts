import { describe, expect, it } from "vitest";
import { emailLocaleSupported, formatShort, formatWhen, te } from "./i18n";

describe("te", () => {
  it("translates per locale", () => {
    expect(te("sk", "confirmedHeading")).toBe("Vaša rezervácia je potvrdená 🎉");
    expect(te("de", "confirmedHeading")).toBe("Ihre Buchung ist bestätigt 🎉");
  });

  it("interpolates", () => {
    expect(te("sk", "withHost", { host: "Marián" })).toBe("s Marián");
    expect(te("en", "confirmedSubject", { title: "Intro", short: "Aug 31, 10:45 AM" })).toBe(
      "Confirmed: Intro - Aug 31, 10:45 AM",
    );
  });

  it("falls back to English for a locale it has no catalogue for", () => {
    // A booking made in French still has to send *something* from a background
    // job hours later; English is the fallback, never a crash or a blank.
    expect(te("fr", "confirmedHeading")).toBe(te("en", "confirmedHeading"));
    expect(te(null, "confirmedHeading")).toBe(te("en", "confirmedHeading"));
    expect(te(undefined, "confirmedHeading")).toBe(te("en", "confirmedHeading"));
  });

  it("leaves an unknown placeholder alone rather than printing undefined", () => {
    expect(te("en", "withHost", {})).toBe("with {host}");
  });

  it("reports which locales it actually covers", () => {
    expect(emailLocaleSupported("sk")).toBe(true);
    expect(emailLocaleSupported("fr")).toBe(false);
    expect(emailLocaleSupported(null)).toBe(false);
  });
});

describe("formatWhen", () => {
  const when = new Date("2026-08-31T08:45:00Z");

  it("uses the locale's own word order, not English with translated names", () => {
    // The bug this guards: toFormat("cccc, LLLL d, yyyy") localises the weekday
    // and month but keeps English order - "pondelok, august 31, 2026".
    expect(formatWhen(when, "Europe/Bratislava", "sk")).toContain("pondelok 31. augusta 2026");
    expect(formatWhen(when, "Europe/Bratislava", "en")).toContain("Monday, August 31, 2026");
  });

  it("renders in the recipient's zone", () => {
    expect(formatWhen(when, "Europe/Bratislava", "en")).toContain("10:45 AM");
    expect(formatWhen(when, "UTC", "en")).toContain("8:45 AM");
  });

  it("keeps the subject line short", () => {
    expect(formatShort(when, "Europe/Bratislava", "en")).toBe("Aug 31, 10:45 AM");
  });
});
