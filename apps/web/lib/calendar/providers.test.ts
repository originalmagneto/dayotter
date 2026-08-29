import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * env.ts parses process.env once at import, so each case re-imports the module
 * with the environment it wants.
 */
async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import("./providers");
}

afterEach(() => vi.unstubAllEnvs());

describe("providerConfigured", () => {
  it("is false when the server has no credentials", async () => {
    // The regression this guards: with empty creds the connect route used to
    // build a consent URL with client_id= and send the user to Google, which
    // answered "Access blocked / Missing required parameter: client_id".
    const { providerConfigured } = await load({ GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "" });
    expect(providerConfigured("google")).toBe(false);
  });

  it("is false when only one half is set", async () => {
    const { providerConfigured } = await load({
      GOOGLE_CLIENT_ID: "id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "",
    });
    expect(providerConfigured("google")).toBe(false);
  });

  it("is true once both are set", async () => {
    const { providerConfigured } = await load({
      GOOGLE_CLIENT_ID: "id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "secret",
    });
    expect(providerConfigured("google")).toBe(true);
  });

  it("tracks microsoft independently of google", async () => {
    const { providerConfigured } = await load({
      GOOGLE_CLIENT_ID: "id",
      GOOGLE_CLIENT_SECRET: "secret",
      MICROSOFT_CLIENT_ID: "",
      MICROSOFT_CLIENT_SECRET: "",
    });
    expect(providerConfigured("google")).toBe(true);
    expect(providerConfigured("microsoft")).toBe(false);
  });
});
