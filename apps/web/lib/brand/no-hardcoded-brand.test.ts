import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A firm's name must never be a literal in shared UI.
 *
 * One deployment serves three firms, so a hardcoded name is not a typo - it is
 * one client seeing another firm's identity. This has now happened three times
 * (the page title, the team booking footer, the sign-in copy), each time
 * because a rename wrote a literal where a lookup belonged. The compiler cannot
 * catch it, so this does.
 */
// Resolved from this file, not from cwd: vitest runs the suite from the repo
// root as well as from apps/web, and a relative root only works in one of them.
const WEB = resolve(import.meta.dirname, "../..");
const ROOTS = [join(WEB, "app"), join(WEB, "components"), resolve(WEB, "../../packages/auth/src")];
const SKIP = ["marketing", "node_modules", ".next"];
/** Names that must come from the tenant, never from source. */
const FORBIDDEN = [/\bSKALLARS Law\b/, /\bDayOtter\b/, /Day\{" "\}Otter/, /\bHuman in the Loop\b/];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.some((s) => entry.includes(s))) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full) && !full.endsWith(".test.ts")) out.push(full);
  }
  return out;
}

describe("brand names are not hardcoded in shared UI", () => {
  it("finds no firm name written as a literal", () => {
    const offenders: string[] = [];
    for (const root of ROOTS) {
      for (const file of walk(root)) {
        const src = readFileSync(file, "utf8");
        for (const pattern of FORBIDDEN) {
          const m = src.match(pattern);
          if (m) offenders.push(`${file}: ${m[0]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
