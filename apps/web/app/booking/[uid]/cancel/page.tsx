import { BookingWhen } from "@/components/booking-when";
import { CancelButton } from "@/components/cancel-button";
import { Tr } from "@/components/tr";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { getTenant } from "@/lib/brand/server";
import { resolveLocale, t } from "@/lib/i18n/booking";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import { eq, getDb, schema } from "@dayotter/db";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CancelBookingPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const booking = await getDb().query.bookings.findFirst({
    where: eq(schema.bookings.uid, uid),
    with: { host: true },
  });
  if (!booking) notFound();
  if (booking.status === "cancelled") redirect(`/booking/${uid}`);
  const isRecurring = Boolean(booking.recurrenceUid);

  const tenant = await getTenant();
  const locale = resolveLocale((await headers()).get("accept-language"), tenant.locales);
  const hostName = booking.host?.name ?? t(locale, "yourHost");

  return (
    <LocaleProvider locale={locale}>
      <main className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <Card>
          <CardBody className="p-6 sm:p-8">
            <h1 className="text-xl font-semibold">
              <Tr k="cancelTitle" />
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              <Tr k="cancelBlurb" />
            </p>

            <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-sm">
              <p className="font-medium">{booking.title}</p>
              <p className="mt-0.5 text-[var(--color-muted)]">
                <Tr k="withHost" vars={{ host: hostName }} /> ·{" "}
                <BookingWhen
                  start={booking.startsAt.toISOString()}
                  zone={booking.timezone}
                  variant="at"
                />
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <CancelButton uid={uid} isRecurring={isRecurring} />
              <Link
                href={`/booking/${uid}`}
                className={`${buttonVariants({ variant: "outline" })} w-full`}
              >
                <Tr k="keepBooking" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </main>
    </LocaleProvider>
  );
}
