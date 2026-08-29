import { afterEach, describe, expect, it, vi } from "vitest";
import { assertSignupAllowed, hostFromAuthContext, signupAllowed } from "./signup-gate";

afterEach(() => vi.unstubAllEnvs());

describe("signupAllowed", () => {
  it("is closed when nothing is configured", () => {
    // The important case: a public /sign-up on a public domain must not be open
    // just because an env var was forgotten.
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "");
    expect(signupAllowed("anyone@gmail.com")).toBe(false);
    expect(() => assertSignupAllowed("anyone@gmail.com")).toThrow();
  });

  it("allows only the listed domains", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "skallars.com, humanintheloop.sk");
    expect(signupAllowed("marian@skallars.com")).toBe(true);
    expect(signupAllowed("kolega@humanintheloop.sk")).toBe(true);
    expect(signupAllowed("stranger@gmail.com")).toBe(false);
  });

  it("is case-insensitive and ignores spacing", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "  SKALLARS.com ");
    expect(signupAllowed("Marian@Skallars.COM")).toBe(true);
  });

  it("does not match a domain that merely ends with an allowed one", () => {
    // evil-skallars.com must not pass because it ends in skallars.com.
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "skallars.com");
    expect(signupAllowed("attacker@evil-skallars.com")).toBe(false);
    expect(signupAllowed("attacker@skallars.com.evil.net")).toBe(false);
  });

  it("opens fully only on an explicit wildcard", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "*");
    expect(signupAllowed("anyone@anywhere.dev")).toBe(true);
  });
});

describe("signupAllowed, scoped to a host", () => {
  // One deployment, three firms, one hostname each: the question "may this
  // address register" only has an answer once you know which door it knocked on.
  const RULES = [
    "cal.skallars.com=skallars.com",
    "cal.humanintheloop.sk=humanintheloop.sk",
    "cal.humanintheloop.sk=marian.cuprik@icloud.com",
    "cal.lawoss.app=lawoss.app",
  ].join(",");

  it("lets a firm's address register on that firm's domain", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", RULES);
    expect(signupAllowed("marian@skallars.com", "cal.skallars.com")).toBe(true);
    expect(signupAllowed("majo@lawoss.app", "cal.lawoss.app")).toBe(true);
  });

  it("refuses that same address on another firm's domain", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", RULES);
    expect(signupAllowed("marian@skallars.com", "cal.lawoss.app")).toBe(false);
    expect(signupAllowed("majo@lawoss.app", "cal.humanintheloop.sk")).toBe(false);
  });

  it("allows one exact address, and only on its own host", () => {
    // A named person on a public mail domain - icloud.com as a *domain* rule
    // would let in anyone who has an Apple account.
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", RULES);
    expect(signupAllowed("marian.cuprik@icloud.com", "cal.humanintheloop.sk")).toBe(true);
    expect(signupAllowed("marian.cuprik@icloud.com", "cal.skallars.com")).toBe(false);
    expect(signupAllowed("someone.else@icloud.com", "cal.humanintheloop.sk")).toBe(false);
  });

  it("matches the host exactly, never as a suffix", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", RULES);
    expect(signupAllowed("marian@skallars.com", "cal.skallars.com.evil.net")).toBe(false);
    expect(signupAllowed("marian@skallars.com", "evil-cal.skallars.com")).toBe(false);
  });

  it("ignores the port, so localhost:3000 can stand in for a host", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "localhost:3000=humanintheloop.sk");
    expect(signupAllowed("kolega@humanintheloop.sk", "localhost:3000")).toBe(true);
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "cal.skallars.com=skallars.com");
    expect(signupAllowed("marian@skallars.com", "cal.skallars.com:443")).toBe(true);
  });

  it("is closed when the request has no host and every rule is scoped", () => {
    // A write from a seed script or the CLI has no Host to check against.
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", RULES);
    expect(signupAllowed("marian@skallars.com")).toBe(false);
    expect(signupAllowed("marian@skallars.com", null)).toBe(false);
  });

  it("is closed on a host no rule names", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", RULES);
    expect(signupAllowed("marian@skallars.com", "cal.somewhere-else.com")).toBe(false);
  });

  it("applies an unscoped rule on every host", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "cal.skallars.com=skallars.com, ops@example.com");
    expect(signupAllowed("ops@example.com", "cal.lawoss.app")).toBe(true);
    expect(signupAllowed("ops@example.com", "cal.skallars.com")).toBe(true);
  });

  it("opens one host only, on a scoped wildcard", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", "cal.lawoss.app=*");
    expect(signupAllowed("anyone@anywhere.dev", "cal.lawoss.app")).toBe(true);
    expect(signupAllowed("anyone@anywhere.dev", "cal.skallars.com")).toBe(false);
  });

  it("says registration is closed, not 'wrong address', on an unlisted host", () => {
    vi.stubEnv("SIGNUP_ALLOWED_DOMAINS", RULES);
    expect(() => assertSignupAllowed("marian@skallars.com", "cal.nowhere.test")).toThrow(
      /Registration is closed/,
    );
    expect(() => assertSignupAllowed("stranger@gmail.com", "cal.skallars.com")).toThrow(
      /not allowed to register/,
    );
  });
});

describe("hostFromAuthContext", () => {
  const headers = (host: string) => new Headers({ host });

  it("reads the Host off the endpoint context", () => {
    expect(hostFromAuthContext({ headers: headers("cal.skallars.com") })).toBe("cal.skallars.com");
  });

  it("falls back to the raw request", () => {
    const request = { headers: headers("cal.lawoss.app") };
    expect(hostFromAuthContext({ request })).toBe("cal.lawoss.app");
  });

  it("is null off-request, which the gate reads as closed", () => {
    expect(hostFromAuthContext(null)).toBe(null);
    expect(hostFromAuthContext(undefined)).toBe(null);
    expect(hostFromAuthContext({})).toBe(null);
    expect(hostFromAuthContext({ headers: new Headers() })).toBe(null);
  });
});
