import { TENANTS, type Tenant } from "@/lib/brand/tenants";
import { eq, getDb, schema } from "@dayotter/db";

export interface Firm {
  tenant: Tenant;
  id: string;
  url: string;
  current: boolean;
}

/**
 * The firms this person can actually open, newest membership last.
 *
 * Driven by membership rather than by the tenant list: a colleague added to one
 * firm sees one entry, and nobody is shown a door they cannot walk through.
 */
export async function getUserFirms(userId: string, currentSlug: string): Promise<Firm[]> {
  const rows = await getDb().query.memberships.findMany({
    where: eq(schema.memberships.userId, userId),
    with: { organization: { columns: { slug: true } } },
  });
  const slugs = new Set(rows.map((r) => r.organization?.slug).filter(Boolean) as string[]);

  return Object.entries(TENANTS)
    .filter(([, t]) => slugs.has(t.organizationSlug))
    .map(([id, t]) => ({
      tenant: t,
      id,
      // Each firm lives on its own domain, so switching is a navigation.
      url: `https://${t.domains[0]}/dashboard`,
      current: t.organizationSlug === currentSlug,
    }));
}
