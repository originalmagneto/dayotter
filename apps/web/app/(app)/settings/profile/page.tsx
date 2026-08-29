import { AccountSecurity } from "@/components/account-security";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ProfileForm } from "@/components/profile-form";
import { getSession } from "@/lib/auth/session";
import { ensureUserWorkspace } from "@/lib/bootstrap";
import { eq, getDb, schema } from "@dayotter/db";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const session = await getSession();
  const userId = session!.user.id;

  // Make sure the user has a handle (assigned lazily on first workspace action).
  await ensureUserWorkspace(userId);
  const db = getDb();
  const membership = await db.query.memberships.findFirst({
    where: eq(schema.memberships.userId, userId),
    columns: { organizationId: true },
  });
  const [user, prefs, org] = await Promise.all([
    db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: { name: true, timezone: true, handle: true, image: true },
    }),
    db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.userId, userId),
      columns: { brandColor: true, welcomeMessage: true, bookingPageAnalytics: true },
    }),
    membership
      ? db.query.organizations.findFirst({
          where: eq(schema.organizations.id, membership.organizationId),
          columns: { logo: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <>
      <ProfileForm
        initial={{
          name: user?.name ?? "",
          timezone: user?.timezone ?? "UTC",
          handle: user?.handle ?? "",
          image: user?.image ?? null,
          orgLogo: org?.logo ?? null,
          brandColor: prefs?.brandColor ?? null,
          welcomeMessage: prefs?.welcomeMessage ?? "",
          bookingPageAnalytics: prefs?.bookingPageAnalytics ?? null,
        }}
      />
      <ChangePasswordForm />
      <AccountSecurity />
    </>
  );
}
