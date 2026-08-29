"use client";

import { t } from "@/lib/i18n/booking";
import { useBookingLocale } from "@/lib/i18n/use-locale";
import { DateTime } from "luxon";

/**
 * A booking's date and time, in the booker's active language.
 *
 * Client-side for the same reason `<Tr>` is: the language picker keeps its
 * choice in localStorage, so a date formatted on the server would be stuck on
 * whatever Accept-Language said and would stop matching the words around it the
 * moment somebody switched. Luxon localises the month and weekday names once it
 * has the locale.
 *
 * Times keep `h:mm a` rather than a locale-derived clock, matching the slot grid
 * the booker just used. A booker who picked "10:45 AM" should not be told
 * "10:45" on the next screen; moving the whole flow to 24-hour time is a
 * separate decision.
 */
export function BookingWhen({
  start,
  end,
  zone,
  /** "range" renders date + start–end; "at" renders the shorter date-at-time. */
  variant = "range",
}: {
  start: string;
  end?: string;
  zone: string;
  variant?: "range" | "at";
}) {
  const locale = useBookingLocale();
  const from = DateTime.fromISO(start).setZone(zone).setLocale(locale);
  // A preset, not a hand-written pattern: `toFormat("cccc, LLLL d, yyyy")`
  // localises the weekday and month names but keeps English word order, so
  // Slovak came out as "pondelok, august 31, 2026". DATE_HUGE asks CLDR for the
  // whole shape and gives "pondelok 31. augusta 2026".
  const date = from.toLocaleString(DateTime.DATE_HUGE);
  // The clock stays 12-hour to match the slot grid the booker just used: being
  // offered "10:45 AM" and then told "10:45" reads as a different time. Moving
  // the whole flow to 24-hour is a real question for a Slovak firm, but it is
  // one decision about the flow, not this screen.
  const time = from.toFormat("h:mm a");

  if (variant === "at") return <>{t(locale, "dateAt", { date, time })}</>;

  const to = end ? DateTime.fromISO(end).setZone(zone).setLocale(locale) : null;
  return (
    <>
      {date} · {time}
      {to ? ` – ${to.toFormat("h:mm a")}` : ""}
    </>
  );
}
