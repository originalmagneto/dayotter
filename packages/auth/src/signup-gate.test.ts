import { afterEach, describe, expect, it, vi } from "vitest";
import { assertSignupAllowed, signupAllowed } from "./signup-gate";

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
