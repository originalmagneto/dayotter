import { BrandMark } from "@/components/brand-mark";
import { BellRing, CalendarCheck, Globe2, Link2, ShieldCheck, Sparkles } from "lucide-react";

const BADGES = [
  { icon: Link2, label: "One link, done" },
  { icon: ShieldCheck, label: "Yours to self-host" },
  { icon: Sparkles, label: "Focus, protected" },
  { icon: Globe2, label: "Every timezone" },
  { icon: BellRing, label: "Reminders that fire" },
  { icon: CalendarCheck, label: "Never double-booked" },
];
/** The reasons strip - drawn icons on the accent field, no mascot art. */
export function WhyOtter() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Why SKALLARS Law</span>
        <h2 className="font-display mt-4 text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">
          Scheduling that keeps you calm.
        </h2>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
        {BADGES.map((b) => (
          <div key={b.label} className="flex flex-col items-center text-center">
            <span
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            >
              <b.icon size={26} strokeWidth={1.5} />
            </span>
            <span className="mt-3 text-sm font-medium">{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The closing band before the final CTA. Was a full-bleed mascot banner; it is
 * now a quiet typographic rule carrying the mark, which is what a firm's page
 * wants in that slot.
 */
export function OtterBand() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 shadow-[var(--shadow-card)]">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <BrandMark size={26} className="text-[var(--color-brand)]" />
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>
    </div>
  );
}
