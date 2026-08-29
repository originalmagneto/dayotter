import { DateTime } from "luxon";

/**
 * Message catalogue for the emails a booker receives.
 *
 * Separate from the booking page's catalogue on purpose. The sentences are
 * different - an email has a subject line, no surrounding interface, and is
 * read hours later - and this package has no business depending on the web
 * app's i18n. What the two share is the language a booker chose, which travels
 * on the booking row.
 *
 * Only the booker-facing lifecycle is translated: confirmation, request,
 * decline, reschedule, cancellation, reminder. Emails to the host (daily
 * briefings, guardrail alerts, "new booking request") stay English - the host
 * is one known person who set the server up, not an unknown client.
 *
 * Keyed by plain string with an English fallback, so an unknown or missing
 * locale degrades to English instead of throwing in a background job.
 */

const en = {
  confirmedSubject: "Confirmed: {title} - {short}",
  confirmedHeading: "Your booking is confirmed 🎉",
  confirmedLead: "Your booking is confirmed.",
  requestedSubject: "Request sent: {title} - {short}",
  requestedHeading: "Your request has been sent",
  requestedLead:
    "We've asked {host} to confirm. You'll get an email the moment it's approved - nothing is on the calendar yet.",
  declinedSubject: "Not confirmed: {title}",
  declinedHeading: "Your request wasn't confirmed",
  declinedLead: "{host} wasn't able to confirm this request.",
  rescheduledSubject: "Moved: {title} - {short}",
  rescheduledHeading: "Your booking has moved",
  rescheduledLead: "The time for {title} has changed.",
  cancelledSubject: "Cancelled: {title} - {short}",
  cancelledHeading: "Your booking was cancelled",
  cancelledLead: "{title} with {host} has been cancelled.",
  reminderSubject: "Reminder: {title} {lead}",
  reminderHeading: "Coming up {lead}",
  reminderLead: "A reminder about your booking {lead}.",
  withHost: "with {host}",
  newTime: "New time",
  wasTime: "Previously",
  join: "Join",
  where: "Location",
  reason: "Reason",
  ctaView: "View booking",
  ctaManage: "Manage or cancel",
  ctaRebook: "Book another time",
  manageLine: "Manage or cancel: {url}",
  sentBy: "Sent by {brand}",
} as const;

export type EmailKey = keyof typeof en;

const sk: Record<EmailKey, string> = {
  confirmedSubject: "Potvrdené: {title} – {short}",
  confirmedHeading: "Vaša rezervácia je potvrdená 🎉",
  confirmedLead: "Vaša rezervácia je potvrdená.",
  requestedSubject: "Žiadosť odoslaná: {title} – {short}",
  requestedHeading: "Vaša žiadosť bola odoslaná",
  requestedLead:
    "Požiadali sme {host} o potvrdenie. E-mail dostanete hneď, ako to schváli – zatiaľ nie je nič v kalendári.",
  declinedSubject: "Nepotvrdené: {title}",
  declinedHeading: "Vaša žiadosť nebola potvrdená",
  declinedLead: "{host} nemohol túto žiadosť potvrdiť.",
  rescheduledSubject: "Presunuté: {title} – {short}",
  rescheduledHeading: "Vaša rezervácia sa presunula",
  rescheduledLead: "Čas termínu {title} sa zmenil.",
  cancelledSubject: "Zrušené: {title} – {short}",
  cancelledHeading: "Vaša rezervácia bola zrušená",
  cancelledLead: "{title} s {host} bola zrušená.",
  reminderSubject: "Pripomienka: {title} {lead}",
  reminderHeading: "Blíži sa {lead}",
  reminderLead: "Pripomienka k vašej rezervácii {lead}.",
  withHost: "s {host}",
  newTime: "Nový čas",
  wasTime: "Pôvodne",
  join: "Pripojiť sa",
  where: "Miesto",
  reason: "Dôvod",
  ctaView: "Zobraziť rezerváciu",
  ctaManage: "Spravovať alebo zrušiť",
  ctaRebook: "Vybrať iný termín",
  manageLine: "Spravovať alebo zrušiť: {url}",
  sentBy: "Odoslané cez {brand}",
};

const de: Record<EmailKey, string> = {
  confirmedSubject: "Bestätigt: {title} – {short}",
  confirmedHeading: "Ihre Buchung ist bestätigt 🎉",
  confirmedLead: "Ihre Buchung ist bestätigt.",
  requestedSubject: "Anfrage gesendet: {title} – {short}",
  requestedHeading: "Ihre Anfrage wurde gesendet",
  requestedLead:
    "Wir haben {host} um Bestätigung gebeten. Sie erhalten eine E-Mail, sobald sie vorliegt – im Kalender steht noch nichts.",
  declinedSubject: "Nicht bestätigt: {title}",
  declinedHeading: "Ihre Anfrage wurde nicht bestätigt",
  declinedLead: "{host} konnte diese Anfrage nicht bestätigen.",
  rescheduledSubject: "Verschoben: {title} – {short}",
  rescheduledHeading: "Ihre Buchung wurde verschoben",
  rescheduledLead: "Die Zeit für {title} hat sich geändert.",
  cancelledSubject: "Storniert: {title} – {short}",
  cancelledHeading: "Ihre Buchung wurde storniert",
  cancelledLead: "{title} mit {host} wurde storniert.",
  reminderSubject: "Erinnerung: {title} {lead}",
  reminderHeading: "Demnächst {lead}",
  reminderLead: "Eine Erinnerung an Ihre Buchung {lead}.",
  withHost: "mit {host}",
  newTime: "Neue Zeit",
  wasTime: "Bisher",
  join: "Teilnehmen",
  where: "Ort",
  reason: "Grund",
  ctaView: "Buchung ansehen",
  ctaManage: "Verwalten oder stornieren",
  ctaRebook: "Andere Zeit buchen",
  manageLine: "Verwalten oder stornieren: {url}",
  sentBy: "Gesendet über {brand}",
};

const zh: Record<EmailKey, string> = {
  confirmedSubject: "已确认：{title} – {short}",
  confirmedHeading: "您的预约已确认 🎉",
  confirmedLead: "您的预约已确认。",
  requestedSubject: "请求已发送：{title} – {short}",
  requestedHeading: "您的请求已发送",
  requestedLead: "我们已请求 {host} 确认。一经批准即会收到邮件——目前日历上还没有安排。",
  declinedSubject: "未确认：{title}",
  declinedHeading: "您的请求未获确认",
  declinedLead: "{host} 无法确认此请求。",
  rescheduledSubject: "已改期：{title} – {short}",
  rescheduledHeading: "您的预约已改期",
  rescheduledLead: "{title} 的时间已更改。",
  cancelledSubject: "已取消：{title} – {short}",
  cancelledHeading: "您的预约已取消",
  cancelledLead: "与 {host} 的 {title} 已取消。",
  reminderSubject: "提醒：{title} {lead}",
  reminderHeading: "即将开始 {lead}",
  reminderLead: "提醒您的预约 {lead}。",
  withHost: "与 {host}",
  newTime: "新时间",
  wasTime: "原时间",
  join: "加入",
  where: "地点",
  reason: "原因",
  ctaView: "查看预约",
  ctaManage: "管理或取消",
  ctaRebook: "另选时间",
  manageLine: "管理或取消：{url}",
  sentBy: "由 {brand} 发送",
};

const CATALOGUES: Record<string, Record<EmailKey, string>> = { en, sk, de, zh };

/**
 * Translate one key, interpolating `{name}` placeholders.
 *
 * Falls back per key rather than per catalogue, so a language that covers most
 * of an email still uses its own strings for the parts it has.
 */
export function te(
  locale: string | null | undefined,
  key: EmailKey,
  vars?: Record<string, string | number>,
): string {
  const s = CATALOGUES[(locale ?? "en").toLowerCase()]?.[key] ?? en[key];
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Whether this package has a catalogue for a locale (English is implicit). */
export function emailLocaleSupported(locale: string | null | undefined): boolean {
  return Boolean(locale && locale.toLowerCase() in CATALOGUES);
}

/**
 * A date and time in the reader's language.
 *
 * A preset rather than a hand-written pattern: `toFormat("cccc, LLLL d, yyyy")`
 * localises the weekday and month names but keeps English word order, which in
 * Slovak reads as "pondelok, august 31, 2026" - the names right and the
 * sentence wrong. The clock stays 12-hour to match the booking pages.
 */
export function formatWhen(date: Date, zone: string, locale: string): string {
  const dt = DateTime.fromJSDate(date).setZone(zone).setLocale(locale);
  return `${dt.toLocaleString(DateTime.DATE_HUGE)} · ${dt.toFormat("h:mm a (ZZZZ)")}`;
}

/** The short form used in subject lines, where the weekday would be noise. */
export function formatShort(date: Date, zone: string, locale: string): string {
  const dt = DateTime.fromJSDate(date).setZone(zone).setLocale(locale);
  return `${dt.toLocaleString({ month: "short", day: "numeric" })}, ${dt.toFormat("h:mm a")}`;
}
