import { BookingPixels } from "@/components/booking-pixels";
import { BookingWhen } from "@/components/booking-when";
import { Tr } from "@/components/tr";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { getHostPixels } from "@/lib/booking/branding";
import { googleCalendarUrl } from "@/lib/booking/ics";
import { formatMoney } from "@/lib/booking/money";
import { getTenant } from "@/lib/brand/server";
import { resolveLocale, t } from "@/lib/i18n/booking";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import { BRAND } from "@/lib/marketing";
import { eq, getDb, schema } from "@dayotter/db";
import {
  CalendarPlus,
  CalendarX2,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Video,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: { params: Promise<{ uid: string }> }) {
  const tenant = await getTenant();
  const { uid } = await params;
  const booking = await getDb().query.bookings.findFirst({
    where: eq(schema.bookings.uid, uid),
    with: { host: true, attendees: true },
  });
  if (!booking) notFound();

  const eventType = await getDb().query.eventTypes.findFirst({
    where: eq(schema.eventTypes.id, booking.eventTypeId),
    columns: { questions: true },
  });
  const responses = (booking.responses ?? {}) as Record<string, unknown>;
  const answered = (eventType?.questions ?? [])
    .map((q) => ({ label: q.label, value: responses[q.id] }))
    .filter((r) => r.value !== undefined && r.value !== "" && r.value !== false);

  const cancelled = booking.status === "cancelled";
  const rejected = booking.status === "rejected";
  // Opt-in bookings sit in `pending` until the host approves them: nothing is on
  // any calendar yet, so we show "request sent" rather than "you're booked".
  const pending = booking.status === "pending";
  const negative = cancelled || rejected;
  const confirmed = !negative && !pending;
  // Same seeding as the booking page the attendee just came from: the request's
  // Accept-Language, narrowed to what this firm offers. The picker's stored
  // choice is applied on the client by LocaleProvider.
  const locale = resolveLocale((await headers()).get("accept-language"), tenant.locales);
  const hostName = booking.host?.name ?? t(locale, "yourHost");

  const pixels = await getHostPixels(booking.hostId);

  return (
    <LocaleProvider locale={locale}>
      <main className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        {/* Fire the host's analytics conversion event once the booking is confirmed. */}
        <BookingPixels config={pixels} trackBooking={confirmed} />
        <Card>
          <CardBody className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              {negative ? (
                <CalendarX2 size={44} className="text-[var(--color-danger)]" />
              ) : pending ? (
                <Clock size={44} className="text-[var(--color-amber)]" />
              ) : (
                <CheckCircle2 size={44} className="text-[var(--color-success)]" />
              )}
              <h1 className="font-display mt-4 text-2xl leading-tight tracking-[-0.01em]">
                <Tr
                  k={
                    cancelled
                      ? "cancelledTitle"
                      : rejected
                        ? "declinedTitle"
                        : pending
                          ? "pendingTitle"
                          : "confirmedTitle"
                  }
                />
              </h1>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {cancelled ? (
                  <Tr k="cancelledSubtitle" />
                ) : rejected ? (
                  <Tr k="declinedSubtitle" vars={{ host: hostName }} />
                ) : pending ? (
                  <Tr k="pendingSubtitle" vars={{ host: hostName }} />
                ) : (
                  <Tr
                    k="confirmedSubtitle"
                    vars={{ email: booking.attendees[0]?.email ?? t(locale, "yourEmail") }}
                  />
                )}
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
              <p className="font-medium">{booking.title}</p>
              <p className="text-sm text-[var(--color-muted)]">
                <Tr k="withHost" vars={{ host: hostName }} />
              </p>
              <div className="space-y-1.5 pt-1 text-sm">
                <p className="flex items-center gap-2">
                  <Clock size={15} className="text-[var(--color-muted)]" />
                  <BookingWhen
                    start={booking.startsAt.toISOString()}
                    end={booking.endsAt.toISOString()}
                    zone={booking.timezone}
                  />
                  <span className="text-[var(--color-muted)]">({booking.timezone})</span>
                </p>
                {booking.meetingUrl && confirmed ? (
                  <p className="flex items-center gap-2">
                    <Video size={15} className="text-[var(--color-muted)]" />
                    <a
                      href={booking.meetingUrl}
                      className="text-[var(--color-accent)] hover:underline"
                    >
                      <Tr k="joinCall" />
                    </a>
                  </p>
                ) : null}
                {booking.amountPaid && booking.paymentStatus !== "none" ? (
                  <p className="flex items-center gap-2">
                    <CreditCard size={15} className="text-[var(--color-muted)]" />
                    <Tr k={booking.paymentStatus === "refunded" ? "refunded" : "paid"} />{" "}
                    {formatMoney(booking.amountPaid, booking.paymentCurrency ?? "usd")}
                  </p>
                ) : null}
              </div>

              {answered.length > 0 ? (
                <dl className="space-y-2 border-t border-[var(--color-border)] pt-3 text-sm">
                  {answered.map((r) => (
                    <div key={r.label}>
                      <dt className="text-xs text-[var(--color-muted)]">{r.label}</dt>
                      <dd className="text-[var(--color-text)]">
                        {r.value === true ? <Tr k="answerYes" /> : String(r.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {cancelled && booking.cancelReason ? (
                <div className="border-t border-[var(--color-border)] pt-3 text-sm">
                  <p className="text-xs text-[var(--color-muted)]">
                    <Tr k="cancelReasonLabel" />
                  </p>
                  <p className="text-[var(--color-text)]">{booking.cancelReason}</p>
                </div>
              ) : null}
              {!cancelled && booking.rescheduleReason ? (
                <div className="border-t border-[var(--color-border)] pt-3 text-sm">
                  <p className="text-xs text-[var(--color-muted)]">
                    <Tr k="changeReasonLabel" />
                  </p>
                  <p className="text-[var(--color-text)]">{booking.rescheduleReason}</p>
                </div>
              ) : null}
            </div>

            {confirmed ? (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <a
                  href={googleCalendarUrl({
                    uid: booking.uid,
                    title: booking.title,
                    description: booking.description,
                    start: booking.startsAt,
                    end: booking.endsAt,
                    location: booking.location,
                    meetingUrl: booking.meetingUrl,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <CalendarPlus size={15} /> Google Calendar
                </a>
                <a
                  href={`/api/bookings/${uid}/ics`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Download size={15} /> <Tr k="downloadIcs" />
                </a>
              </div>
            ) : null}

            {confirmed || pending ? (
              <div className="mt-3 flex justify-center gap-2">
                {confirmed ? (
                  <Link
                    href={`/booking/${uid}/reschedule`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <Tr k="reschedule" />
                  </Link>
                ) : null}
                <Link
                  href={`/booking/${uid}/cancel`}
                  className={buttonVariants({ variant: "danger-soft", size: "sm" })}
                >
                  <Tr k={pending ? "cancelRequest" : "cancelBooking"} />
                </Link>
              </div>
            ) : null}
          </CardBody>
        </Card>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[var(--color-faint)]">
          <span className="relative inline-block h-3.5 w-3.5 shrink-0 overflow-hidden rounded-[3px]">
            <img
              src={tenant.icon}
              alt=""
              width={21}
              height={21}
              className="absolute -left-[3px] -top-[3px] max-w-none"
            />
          </span>
          <Tr k="poweredBy" /> <span className="text-[var(--color-muted)]">{tenant.name}</span>
        </p>
      </main>
    </LocaleProvider>
  );
}
