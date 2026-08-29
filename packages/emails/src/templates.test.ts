import { describe, expect, it } from "vitest";
import { bookingCancellation, bookingConfirmation } from "./templates";

const base = {
  eventTitle: "Úvodná konzultácia",
  start: new Date("2026-08-31T08:45:00Z"),
  end: new Date("2026-08-31T09:00:00Z"),
  timezone: "Europe/Bratislava",
  hostName: "Marián Čuprík",
  attendeeName: "Klient",
  manageUrl: "https://cal.skallars.com/booking/abc",
};

describe("booker-facing mail follows the booker's language", () => {
  it("renders subject, heading and body in the stored locale", () => {
    const sk = bookingConfirmation({ ...base, locale: "sk" });
    expect(sk.subject).toContain("Potvrdené:");
    expect(sk.html).toContain("Vaša rezervácia je potvrdená");
    expect(sk.text).toContain("Vaša rezervácia je potvrdená.");
    expect(sk.html).toContain("pondelok 31. augusta 2026");
  });

  it("falls back to English without a locale", () => {
    const en = bookingConfirmation(base);
    expect(en.subject).toContain("Confirmed:");
    expect(en.html).toContain("Monday, August 31, 2026");
  });

  it("translates the cancellation too", () => {
    expect(bookingCancellation({ ...base, locale: "sk" }).subject).toContain("Zrušené:");
  });
});

describe("the footer names the firm that actually sent it", () => {
  it("uses the brand it was given, in the reader's language", () => {
    // The bug: this line was hardcoded to one firm's name, so every firm on the
    // deployment signed its clients' mail with somebody else's.
    expect(bookingConfirmation({ ...base, brandName: "LAWOSS" }).html).toContain("Sent by LAWOSS");
    expect(bookingConfirmation({ ...base, locale: "sk", brandName: "LAWOSS" }).html).toContain(
      "Odoslané cez LAWOSS",
    );
  });

  it("omits the line entirely when the caller doesn't know the firm", () => {
    // Better a missing footer than a confidently wrong one.
    const html = bookingConfirmation(base).html;
    expect(html).not.toContain("Sent by");
  });

  it("escapes the brand name", () => {
    expect(bookingConfirmation({ ...base, brandName: "<script>x</script>" }).html).not.toContain(
      "<script>",
    );
  });
});
