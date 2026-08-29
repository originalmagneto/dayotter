/**
 * URL-safe slug from arbitrary human text.
 *
 * The NFD pass is load-bearing: without it `[^a-z0-9]` treats every accented
 * letter as punctuation, so "Marián Čuprík" became "mari-n-upr-k" and every
 * booker saw a mangled link. Decomposing first splits "á" into "a" + a
 * combining accent, the accent is stripped, and the letter survives.
 *
 * Letters that have no decomposition (ß, ł, đ, ø) are mapped by hand - NFD
 * leaves them whole and they would still be dropped.
 */
const NON_DECOMPOSING: Record<string, string> = {
  ß: "ss",
  ł: "l",
  đ: "d",
  ø: "o",
  æ: "ae",
  œ: "oe",
  þ: "th",
  ð: "d",
};

export function slugify(
  input: string,
  { max = 40, fallback = "team" }: { max?: number; fallback?: string } = {},
): string {
  return (
    input
      .normalize("NFD")
      // \p{M} rather than a [\u0300-\u036f] range: same combining marks, but
      // not a character class, which is what the misleading-class lint objects to.
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[ßłđøæœþð]/g, (c) => NON_DECOMPOSING[c] ?? c)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, max)
      .replace(/-+$/, "") || fallback
  );
}

/** Find a value not already taken, appending a short random suffix if needed. */
export async function uniqueSlug(
  base: string,
  exists: (v: string) => Promise<boolean>,
): Promise<string> {
  if (!(await exists(base))) return base;
  for (let i = 0; i < 20; i++) {
    const candidate = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${base}-${Date.now()}`;
}
