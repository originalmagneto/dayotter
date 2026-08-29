import { BookingWhen } from "@/components/booking-when";
import { RescheduleWidget } from "@/components/reschedule-widget";
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

export default async function ReschedulePage({
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

  const tenant = await getTenant();
  const locale = resolveLocale((await headers()).get("accept-language"), tenant.locales);
  const hostName = booking.host?.name ?? t(locale, "yourHost");

  return (
    <LocaleProvider locale={locale}>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <Card>
          <CardBody className="p-6 sm:p-8">
            <h1 className="text-xl font-semibold">
              <Tr k="rescheduleTitle" />
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {booking.title} <Tr k="withHost" vars={{ host: hostName }} />
            </p>
            <div className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm">
              <Tr k="currently" />{" "}
              <span className="font-medium">
                <BookingWhen
                  start={booking.startsAt.toISOString()}
                  zone={booking.timezone}
                  variant="at"
                />
              </span>{" "}
              <span className="text-[var(--color-muted)]">({booking.timezone})</span>
            </div>

            <div className="mt-6">
              <RescheduleWidget uid={uid} eventTypeId={booking.eventTypeId} />
            </div>

            <div className="mt-6">
              <Link
                href={`/booking/${uid}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <Tr k="keepCurrentTime" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </main>
    </LocaleProvider>
  );
}
