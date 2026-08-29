import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function load() {
  const dir = await mkdtemp(join(tmpdir(), "uploads-"));
  vi.resetModules();
  vi.stubEnv("UPLOAD_DIR", dir);
  return { dir, mod: await import("./uploads") };
}

const PNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

afterEach(() => vi.unstubAllEnvs());

describe("storeImage", () => {
  it("stores a real PNG and names it from the bytes, not the upload", async () => {
    const { dir, mod } = await load();
    // An attacker-controlled filename claiming to be something else entirely.
    const file = new File([PNG], "../../evil.svg", { type: "image/svg+xml" });
    const out = await mod.storeImage(file);
    expect(typeof out).not.toBe("string");
    if (typeof out === "string") return;
    expect(out.url).toMatch(/^\/api\/uploads\/[0-9a-f]{32}\.png$/);
    expect(out.mime).toBe("image/png");
    // Exactly one file, in the directory we chose - no traversal.
    expect(await readdir(dir)).toHaveLength(1);
  });

  it("refuses an SVG even when it claims to be a PNG", async () => {
    const { mod } = await load();
    // The dangerous case: SVG can carry script and would be served same-origin.
    const file = new File([SVG], "logo.png", { type: "image/png" });
    expect(await mod.storeImage(file)).toBe("unsupported-type");
  });

  it("refuses anything over 2 MB", async () => {
    const { mod } = await load();
    const big = Buffer.concat([JPEG, Buffer.alloc(2 * 1024 * 1024)]);
    expect(await mod.storeImage(new File([big], "big.jpg"))).toBe("too-large");
  });

  it("refuses an empty file", async () => {
    const { mod } = await load();
    expect(await mod.storeImage(new File([], "nothing.png"))).toBe("empty");
  });
});

describe("readUpload", () => {
  it("refuses names it did not generate, including traversal", async () => {
    const { mod } = await load();
    for (const name of [
      "../../../etc/passwd",
      "..%2f..%2fetc%2fpasswd",
      "abc.png",
      "0123456789abcdef0123456789abcdef.svg",
      "0123456789abcdef0123456789abcdef.png.sh",
    ]) {
      expect(await mod.readUpload(name), name).toBeNull();
    }
  });

  it("reads back what it stored", async () => {
    const { mod } = await load();
    const out = await mod.storeImage(new File([PNG], "a.png"));
    if (typeof out === "string") throw new Error(out);
    const name = out.url.split("/").pop() as string;
    const read = await mod.readUpload(name);
    expect(read?.mime).toBe("image/png");
    expect(read?.etag).toMatch(/^"[0-9a-f]{40}"$/);
  });
});
