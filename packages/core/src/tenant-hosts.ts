/**
 * The hostnames this deployment answers on, by tenant.
 *
 * One stack serves several firms, one hostname each. Almost everything about a
 * firm - its name, mark, palette, languages - is a web concern and lives in
 * `apps/web/lib/brand/tenants.ts`. This is the one part that isn't: which hosts
 * are ours. `packages/auth` needs it too, and cannot import from the web app.
 *
 * Keeping it here rather than duplicating it matters more than it looks. The
 * same missing fact has caused three bugs already: sign-up that ignored which
 * firm's domain it was on, verification emails naming the wrong firm, and
 * Better Auth refusing sign-ups from every domain but one ("Invalid origin",
 * because it trusts only its own baseURL). Adding a firm should not require
 * remembering a second list.
 */
export const TENANT_HOSTS: Record<string, readonly string[]> = {
  skallars: ["cal.skallars.com"],
  // localhost stands in for a tenant in development.
  hitl: ["cal.humanintheloop.sk", "localhost:3000"],
  lawoss: ["cal.lawoss.app"],
};

/** Every hostname the deployment serves, in tenant order. */
export function allTenantHosts(): string[] {
  return Object.values(TENANT_HOSTS).flat();
}

/**
 * The given host, normalised, if this deployment serves it - otherwise null.
 *
 * Exact match only, on the full host or the host without its port: a rule for
 * cal.skallars.com must never match cal.skallars.com.evil.net. Callers use this
 * to decide where a browser may be sent and which origins to trust, so a
 * prefix or suffix match here would be a hole rather than a convenience.
 */
export function knownTenantHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const full = host.toLowerCase().trim();
  const bare = full.split(":")[0] ?? full;
  for (const hosts of Object.values(TENANT_HOSTS)) {
    if (hosts.some((h) => h === full || h === bare)) return full;
  }
  return null;
}

/**
 * Origins Better Auth should accept requests from.
 *
 * It trusts its own `baseURL` and nothing else, which on a stack like this is
 * one firm out of three - every sign-up and sign-in from the other two is
 * refused with "Invalid origin" before it reaches any of our code.
 *
 * Both schemes are listed for each host because the scheme isn't knowable from
 * here: production is HTTPS, development is HTTP on localhost, and this module
 * has no request to ask. That is not a weakening - an origin allowlist answers
 * "is this one of our own front ends", and http://cal.skallars.com is as much
 * ours as the https one. What it must not do is let in a host we don't serve,
 * and it doesn't.
 */
export function tenantOrigins(): string[] {
  return allTenantHosts().flatMap((host) => [`https://${host}`, `http://${host}`]);
}

/**
 * The canonical hostname for a tenant id, for code that has no request to read.
 *
 * Background jobs - a reminder sent hours later - still have to put the right
 * domain in the link they mail out, and the only thing they hold is the
 * booking's organization. Organization slugs are the tenant ids here, so the
 * lookup is direct; a slug that isn't one returns null and the caller keeps its
 * own fallback rather than guessing.
 */
export function hostForTenant(id: string | null | undefined): string | null {
  if (!id) return null;
  return TENANT_HOSTS[id]?.[0] ?? null;
}
