import { getTenant } from "@/lib/brand/server";
import { slugify, uniqueSlug } from "@/lib/slug";
import { and, eq, getDb, schema } from "@dayotter/db";

/**
 * Ensure a user has the minimum workspace to schedule inside the firm whose
 * domain they are on: membership of that firm's organization, a public booking
 * handle, and a default 9-5 schedule. Idempotent.
 *
 * The organization comes from the tenant rather than from whatever membership
 * happens to be first, so one person can belong to several firms and still get
 * the right workspace on each domain.
 */
export async function ensureUserWorkspace(userId: string): Promise<{
  organizationId: string;
  scheduleId: string;
  handle: string;
}> {
  const db = getDb();

  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
  if (!user) throw new Error("User not found");

  // 1. Organization + membership.
  const tenant = await getTenant();
  let org = await db.query.organizations.findFirst({
    where: eq(schema.organizations.slug, tenant.organizationSlug),
  });
  if (!org) {
    [org] = await db
      .insert(schema.organizations)
      .values({ name: tenant.name, slug: tenant.organizationSlug })
      .returning();
  }
  let membership = await db.query.memberships.findFirst({
    where: and(
      eq(schema.memberships.userId, userId),
      eq(schema.memberships.organizationId, org!.id),
    ),
  });
  if (!membership) {
    // Joining the firm, not founding a personal workspace: the organization is
    // the domain's, and a second one here would quietly split the same person's
    // data across two workspaces on the same site.
    [membership] = await db
      .insert(schema.memberships)
      .values({ organizationId: org!.id, userId, role: "owner" })
      .returning();
  }

  // 2. Public handle.
  let handle = user.handle;
  if (!handle) {
    const base = slugify(user.name ?? user.email.split("@")[0] ?? "", { max: 32, fallback: "me" });
    handle = await uniqueSlug(base, async (v) =>
      Boolean(await db.query.users.findFirst({ where: eq(schema.users.handle, v) })),
    );
    await db.update(schema.users).set({ handle }).where(eq(schema.users.id, userId));
  }

  // 3. Default schedule (Mon–Fri 09:00–17:00).
  let schedule = await db.query.schedules.findFirst({
    where: and(eq(schema.schedules.userId, userId), eq(schema.schedules.isDefault, true)),
  });
  if (!schedule) {
    [schedule] = await db
      .insert(schema.schedules)
      .values({ userId, name: "Working hours", timezone: user.timezone, isDefault: true })
      .returning();
    await db.insert(schema.availabilityRules).values(
      [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        scheduleId: schedule!.id,
        dayOfWeek,
        startTime: "09:00:00",
        endTime: "17:00:00",
      })),
    );
  }

  return { organizationId: membership!.organizationId, scheduleId: schedule!.id, handle };
}
