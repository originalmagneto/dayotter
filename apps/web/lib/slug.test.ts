import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and collapses non-alphanumerics to single dashes", () => {
    expect(slugify("Intro Call!!")).toBe("intro-call");
    expect(slugify("A  B__C")).toBe("a-b-c");
  });

  it("strips leading/trailing dashes", () => {
    expect(slugify("  -Hello-  ")).toBe("hello");
  });

  it("truncates to 40 characters", () => {
    expect(slugify("a".repeat(60)).length).toBe(40);
  });

  it("falls back to 'team' for empty/symbol-only input", () => {
    expect(slugify("!!!")).toBe("team");
    expect(slugify("")).toBe("team");
  });
});

describe("uniqueSlug", () => {
  it("returns the base when it's free", async () => {
    expect(await uniqueSlug("intro", async () => false)).toBe("intro");
  });

  it("appends a numeric suffix when the base is taken", async () => {
    const taken = new Set(["intro"]);
    const result = await uniqueSlug("intro", async (v) => taken.has(v));
    expect(result).not.toBe("intro");
    expect(result.startsWith("intro-")).toBe(true);
  });
});

describe("slugify - diacritics", () => {
  it("keeps accented letters instead of dropping them", () => {
    // These used to lose the accented letter entirely, so a host called
    // Marián Čuprík got the public booking link /mari-n-upr-k.
    expect(slugify("Marián Čuprík")).toBe("marian-cuprik");
    expect(slugify("Žofia Ľuptáková")).toBe("zofia-luptakova");
    expect(slugify("Ondřej Dvořák")).toBe("ondrej-dvorak");
    expect(slugify("Jürgen Müller")).toBe("jurgen-muller");
    expect(slugify("Zoë Adams")).toBe("zoe-adams");
  });

  it("maps the letters NFD leaves whole", () => {
    expect(slugify("Straße")).toBe("strasse");
    expect(slugify("Łukasz")).toBe("lukasz");
    expect(slugify("Søren Ægir")).toBe("soren-aegir");
  });

  it("honours an explicit max and fallback", () => {
    expect(slugify("abcdefgh ijklmnop", { max: 9 })).toBe("abcdefgh");
    expect(slugify("", { fallback: "user" })).toBe("user");
    expect(slugify("日本語", { fallback: "" })).toBe("");
  });
});
