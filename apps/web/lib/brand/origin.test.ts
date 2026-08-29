import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `env` reads process.env once at module load, so each case loads a fresh copy
 * with the APP_URL it needs.
 */
async function load(appUrl: string) {
  vi.resetModules();
  vi.stubEnv("APP_URL", appUrl);
  return await import("./origin");
}

afterEach(() => vi.unstubAllEnvs());

describe("originForHost", () => {
  it("returns the origin for a host this deployment serves", async () => {
    const { originForHost } = await load("https://cal.humanintheloop.sk");
    expect(originForHost("cal.skallars.com")).toBe("https://cal.skallars.com");
    expect(originForHost("cal.lawoss.app")).toBe("https://cal.lawoss.app");
  });

  it("takes the scheme from APP_URL, not the request", async () => {
    // Behind the proxy the app speaks plain HTTP; reflecting that would hand a
    // browser an http:// link to a domain that only serves HTTPS.
    const { originForHost } = await load("http://localhost:3000");
    expect(originForHost("localhost:3000")).toBe("http://localhost:3000");
  });

  it("is undefined for a host we do not serve", async () => {
    const { originForHost } = await load("https://cal.humanintheloop.sk");
    expect(originForHost("evil.example")).toBeUndefined();
    expect(originForHost("cal.skallars.com.evil.net")).toBeUndefined();
    expect(originForHost(null)).toBeUndefined();
    expect(originForHost("")).toBeUndefined();
  });
});

describe("returnOrigin", () => {
  it("keeps one of our origins", async () => {
    const { returnOrigin } = await load("https://cal.humanintheloop.sk");
    expect(returnOrigin("https://cal.skallars.com")).toBe("https://cal.skallars.com");
  });

  it("falls back to APP_URL when there is nothing to go on", async () => {
    const { returnOrigin } = await load("https://cal.humanintheloop.sk");
    expect(returnOrigin(undefined)).toBe("https://cal.humanintheloop.sk");
    expect(returnOrigin(null)).toBe("https://cal.humanintheloop.sk");
    expect(returnOrigin("not a url")).toBe("https://cal.humanintheloop.sk");
  });

  it("refuses an origin pointing anywhere else", async () => {
    // This function decides where a browser is sent. The state carrying the
    // value is signed, but that is not the reason this is safe.
    const { returnOrigin } = await load("https://cal.humanintheloop.sk");
    for (const hostile of [
      "https://evil.example",
      "https://cal.skallars.com.evil.net",
      "javascript:alert(1)",
      "//evil.example",
    ]) {
      expect(returnOrigin(hostile)).toBe("https://cal.humanintheloop.sk");
    }
  });

  it("never adopts a scheme from the candidate", async () => {
    const { returnOrigin } = await load("https://cal.humanintheloop.sk");
    expect(returnOrigin("http://cal.skallars.com")).toBe("https://cal.skallars.com");
  });
});
