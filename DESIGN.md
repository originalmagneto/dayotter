---
name: DayOtter
description: Editorial calm meets a living calendar — a warm-ivory scheduling product with one violet voice.
colors:
  otter-violet: "#6743e6"
  otter-violet-deep: "#5734d6"
  violet-mist: "#efeafd"
  warm-ivory: "#faf9f6"
  paper-white: "#ffffff"
  cool-recess: "#f3f2f8"
  rich-ink: "#191720"
  ink-muted: "#55504a"
  ink-faint: "#837d72"
  hairline: "#e7e6ef"
  hairline-strong: "#d7d5e1"
  mint: "#16a085"
  amber: "#d98829"
  coral: "#ef6a52"
  sky: "#3b82f6"
  rose-danger: "#e11d48"
  rose-danger-soft: "#fdf1f3"
typography:
  display:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.4rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  subhead:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  caption:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  meta:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  micro:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "16px"
  xl: "22px"
  full: "9999px"
spacing:
  inline: "8px"
  section: "12px"
  field: "16px"
  card-x: "20px"
  card-y: "16px"
components:
  button-primary:
    backgroundColor: "{colors.otter-violet}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.otter-violet-deep}"
    textColor: "{colors.paper-white}"
  button-outline:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.rich-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-danger-soft:
    backgroundColor: "{colors.rose-danger-soft}"
    textColor: "{colors.rose-danger}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.rich-ink}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  input:
    backgroundColor: "{colors.warm-ivory}"
    textColor: "{colors.rich-ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  badge-neutral:
    backgroundColor: "{colors.cool-recess}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-accent:
    backgroundColor: "{colors.violet-mist}"
    textColor: "{colors.otter-violet}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: DayOtter

## Overview

**Creative North Star: "The Living Calendar"**

DayOtter is a scheduling product that refuses to look like scheduling software. The
ground is warm ivory rather than the cold grey-white of enterprise SaaS, the text is a
near-black that leans warm rather than a flat neutral, and exactly one chromatic voice —
otter violet — carries every action worth taking. The result reads closer to a
well-set printed agenda than to a database with a calendar view bolted on.

The "living" half is the counterweight. A calendar is not a static document: times
arrive, days fill, slots disappear while you look at them. So the system stays quiet at
rest and reserves its energy for state. Surfaces sit flat until you touch them, motion
exists only where something genuinely changed, and the accent appears sparingly enough
that when it does appear you know it means *this one*.

Density is generous rather than compressed. This is a product people open to make a
decision — pick a time, approve a booking, protect an afternoon — not a console they
stare at all day. Whitespace is the default and information is grouped tightly inside
it, so a screen reads as a small number of decisions rather than a wall of rows.

**Key Characteristics:**

- Warm ivory ground (`#faf9f6`), never a cold or pure-white page
- One accent voice — otter violet — for actions, selection, and focus; nothing else
- One grotesque (Geist) doing both display and body; Geist Mono only for labels
- Flat at rest, lifted on state
- Tabular figures wherever a time, date, duration, or count appears
- A class-based dark theme that is a genuine second palette, not an inversion

## Colors

A warm neutral field with a single cool-violet accent, plus a small set of event hues
that exist to distinguish calendar entries, never to decorate.

### Primary

- **Otter Violet** (`#6743e6`): the product's only voice. Primary buttons, the active
  nav indicator, selected time slots, links, focus rings, AI-recommended times. It
  matches the otter illustration palette, which is why it reads as brand rather than as
  a generic SaaS purple.
- **Otter Violet Deep** (`#5734d6`): the hover state of every primary action. Never used
  at rest.
- **Violet Mist** (`#efeafd`): the accent's soft field — recommended-time panels, accent
  badges, selected chips. Carries the accent's meaning at a whisper.

### Neutral

- **Warm Ivory** (`#faf9f6`): the page ground. The single most identifying colour in the
  system; a cold `#fafafa` would dissolve the whole character.
- **Paper White** (`#ffffff`): raised surfaces — cards, dialogs, popovers. Its job is to
  separate from the ivory ground, which is why the ground is never white.
- **Cool Recess** (`#f3f2f8`): the *recessed* tone — inset blocks, secondary buttons,
  skeletons, table zebra. Deliberately a faintly cool neutral leaning toward the accent
  rather than a warmer beige, so inset areas read crisp instead of dated.
- **Rich Ink** (`#191720`): body and heading text. Warm near-black, not a grey.
- **Ink Muted** (`#55504a`): secondary and supporting copy. Kept dark and warm enough to
  stay readable rather than washing out.
- **Ink Faint** (`#837d72`): tertiary text, placeholders, metadata.
- **Hairline** (`#e7e6ef`) / **Hairline Strong** (`#d7d5e1`): the two line weights.
  Hairline divides inside a surface; Hairline Strong outlines an interactive control.

### Tertiary — event hues

Used to distinguish one calendar entry from another and to carry status. They are data,
not decoration.

- **Mint** (`#16a085`): confirmed, success, positive delta. Doubles as `success`.
- **Amber** (`#d98829`): pending, needs attention, out-of-office.
- **Coral** (`#ef6a52`) and **Sky** (`#3b82f6`): additional event colour-coding slots.
- **Rose Danger** (`#e11d48`) with **Rose Danger Soft** (`#fdf1f3`): destructive actions,
  cancellations, errors.

### Named Rules

**The One Voice Rule.** Otter violet is the only chromatic accent in the interface
chrome. If a screen needs a second accent to make sense, the hierarchy is wrong, not the
palette. The event hues are exempt because they encode data, not emphasis.

**The Never-White-Ground Rule.** The page is `#faf9f6` and raised surfaces are
`#ffffff`. Inverting that — a white page with grey cards — collapses the elevation model
and erases the system's warmth in one edit.

**The Two-Line Rule.** There are exactly two border weights. `hairline` divides content
inside a surface; `hairline-strong` outlines something you can interact with. A third
weight, or a coloured border used as decoration, is drift.

## Typography

**Display Font:** Geist Sans (fallback: `ui-sans-serif`, `system-ui`, `-apple-system`)
**Body Font:** Geist Sans — the same family, one weight heavier for display
**Label/Mono Font:** Geist Mono (fallback: `ui-monospace`, `SFMono-Regular`, Menlo)

**Character:** One modern grotesque carries the entire system. Display is not a
different family but the same voice at 600 weight with `-0.02em` tracking — the
contemporary-software look rather than the sans/serif editorial pairing. Geist Mono
appears only as a labelling device, where its mechanical rhythm signals "this is
metadata", never as a costume for technical-ness.

### Hierarchy

- **Display** (600, `clamp(2.6rem, 6vw, 4.5rem)`, line-height 1.04, tracking `-0.02em`):
  marketing hero headlines only. One per page.
- **Headline** (600, `clamp(2rem, 4vw, 2.4rem)`, line-height 1.08, tracking `-0.02em`):
  app page titles. The `PageHeader` component owns this.
- **Title** (600, `1.25rem`, tracking tight): section and card headings. Card headers run
  smaller at `15px`/600 because they sit inside an already-bounded surface.
- **Subhead** (600, `0.9375rem` / `text-subhead`): card titles, lead paragraphs under a
  page header, and the large button. The one step above body.
- **Body** (400, `0.875rem` / `text-sm`, line-height 1.6): the app's default size.
  Marketing lead paragraphs step up to `1.125rem`–`1.25rem` with relaxed leading. Prose
  measure stays in the 65–75ch band.
- **Caption** (400, `0.8125rem` / `text-caption`): compact list copy and captions — one
  rung below body, where `text-xs` would be too small.
- **Meta** (400, `0.6875rem` / `text-meta`): timestamps, per-item counts, dense secondary
  rows. The most-used step below body.
- **Micro** (500, `0.625rem` / `text-micro`): the smallest legible label — badge counts
  and mock chrome. Below this, use an icon.
- **Label** (Geist Mono, `0.72rem`, tracking `0.14em`, uppercase, `ink-muted`): the
  `.eyebrow` class. Section kickers and small caps-style labels.

Tailwind's own steps (`text-xs` 12, `text-sm` 14, `text-base` 16, `text-lg` 18) stay as
they are and remain in wide use; the named roles above are the rungs *between* them that
the product needs. One size sits outside the ladder on purpose: `text-wordmark` (17px) is
the app-nav lockup, named rather than left arbitrary so nobody reaches for 17px as a body
size.

### Named Rules

**The One Family Rule.** Geist Sans does display and body. A serif display face was
deliberately removed from this system once already; reintroducing one is a regression,
not a refresh.

**The Named Step Rule.** Type sizes come from the scale — Tailwind's steps or the named
roles between them. `text-[13px]` is how a scale quietly stops being one; the fifty
occurrences that existed were replaced with `text-caption` and its siblings at identical
pixel values.

**The Tabular Figures Rule.** Every time, date, duration, count, and price renders with
`tabular-nums`. The app shell sets it once at the root rather than leaving each component
to remember. In a product whose substance is a column of times, proportional figures are
a visible defect.

## Layout

The app is a fixed sidebar plus a single scrolling `<main>`; sub-navigation rails inside
it are `lg:sticky lg:self-start` so only content scrolls, never the rail. Public and
marketing pages are centred containers on the ivory ground.

Container widths are a small fixed set of tiers, and adding a new one is how a site
starts to feel inconsistent:

- **Landing** (`max-w-6xl`): home sections, pricing, the docs article grid, the marketing
  nav bar.
- **Browse** (`max-w-5xl`): hub and index pages, detail pages, the docs index.
- **Read** (`max-w-3xl`): articles, blog, changelog, status, legal, booking pages — the
  shared `Prose` measure.
- **Form** (`max-w-2xl` and below): centred single-column forms and dialogs.

Breakpoints are the Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). The
availability grid additionally uses container queries (`@[300px]`, `@[460px]`) so it
reflows against its own width rather than the viewport — correct, because it also renders
inside an embed iframe of unknown size.

Spacing rhythm: `8px` between inline items, `12px` between sections, `16px` between form
fields, and `16px 20px` inside a card body. *Drift note: the comment in `globals.css`
prescribes `p-6` for card padding while `CardBody` ships `px-5 py-4`. The component is
the shipped truth; the comment is stale.*

## Elevation & Depth

Depth is carried by a four-step warm shadow vocabulary layered on top of a tonal surface
scale (`bg` → `surface-2` → `surface` → `elevated`). The shadows are warm-tinted in light
mode (`rgba(40, 33, 20, …)`, drifting violet at the largest step) and pure black at high
opacity in dark mode, because a warm shadow on a near-black ground reads as smudge.

### Shadow Vocabulary

- **card** (`0 1px 2px rgba(40,33,20,.04), 0 2px 6px rgba(40,33,20,.05)`): the resting
  state of a card or primary button. Barely there by design.
- **raise** (`0 8px 24px rgba(40,33,20,.08)`): hover on an interactive card.
- **pop** (`0 24px 60px -12px rgba(40,33,20,.18)`): popovers, menus, dropdowns.
- **float** (`0 40px 80px -24px rgba(30,24,60,.28)`): modals and the largest floating
  layers. Note the violet drift in the tint.

### Named Rules

**The Flat-At-Rest Rule.** Surfaces are flat until something happens to them. Elevation
is a *response* — hover, focus, overlay — not a property a component owns. `Card` models
this exactly: `shadow-card` at rest, `shadow-raise` plus a `-2px` lift on hover, and only
when explicitly marked `interactive`.

## Shapes

A four-step radius scale, and the scale is the whole vocabulary:

- **sm** (`8px`): chips, badges with square corners, small inset blocks, the focus ring's
  own corner.
- **md** (`10px`): inputs, buttons, list rows — the workhorse.
- **lg** (`16px`): cards and panels.
- **xl** (`22px`): hero cards and the largest marketing surfaces.
- **full** (`9999px`): pills — status badges, the theme toggle, avatars.

Borders are 1px, always, in one of the two hairline weights. Depth comes from shadow and
tonal surface, never from border thickness.

### Named Rules

**The Scale-Or-Nothing Rule.** Radii come from the scale. `rounded-[12px]` and its
relatives are drift — the exception is a literal object being drawn (a phone bezel in a
device mockup at `46px`, a 3px tick mark in the calendar), where the number describes a
real thing rather than a UI surface.

## Components

Buttons, cards, and fields are **quiet but tactile**: restrained at rest — 1px lines,
barely-there shadows — and unmistakably responsive to touch, with a `.98` press scale and
150ms transitions.

### Buttons

- **Shape:** workhorse radius (`10px`), medium weight, `active:scale-[.98]`,
  `transition-all 150ms`, `disabled:opacity-50`.
- **Sizes:** sm (`h-8`, `px-3`, 14px) · md (`h-10`, `px-4`, 14px) · lg (`h-11`, `px-5`,
  15px).
- **Primary:** otter violet on white text with the resting card shadow; hover deepens to
  Otter Violet Deep. The only button that carries a shadow.
- **Secondary:** cool recess field, ink text; hover steps to the hairline tone.
- **Outline:** paper-white with a strong hairline; hover fills to cool recess.
- **Ghost:** muted text only; hover gains both full ink and a cool-recess field.
- **Danger** (solid rose) and **Danger Soft** (rose-tinted field with a 30% rose border,
  inverting to solid rose on hover). Danger Soft exists because a ghost destructive
  action washes out entirely on the dark ground.
- **Focus:** a 2px accent ring offset 2px from the button and again from the page ground,
  so the ring reads on both ivory and white.

### Cards / Containers

- **Corner Style:** `lg` (`16px`).
- **Background:** paper white on the ivory ground.
- **Border:** 1px hairline.
- **Shadow Strategy:** `card` at rest; `interactive` cards add `raise` plus a `-2px`
  translate over 300ms. See Elevation.
- **Internal Padding:** `16px 20px` for both header and body; the header is separated by
  a hairline rule, not by extra space.

### Inputs / Fields

- **Style:** `h-10`, workhorse radius, strong hairline border, and — deliberately — the
  *ivory ground* as the fill rather than white, so a field reads as a well cut into the
  card rather than as another raised surface.
- **Placeholder:** ink faint.
- **Focus:** 2px accent ring; the caret is accent-coloured.
- **Label:** 14px medium ink, `6px` above the control.

### Badges

- **Shape:** full pill, `4px 10px`, 12px medium.
- **Tones:** success, danger, warning, and accent are all rendered as the hue at 15%
  opacity with the hue itself as text — one construction, five meanings. Neutral uses the
  cool recess field with muted text.

### Navigation

- **App:** fixed sidebar. The active item is marked by a 3px accent bar pinned to the
  left edge, 20px tall, rounded on its outer end — a pointer, not a filled row.
- **Marketing:** a `max-w-6xl` bar at `px-6 py-3.5`, links at 14px muted stepping to full
  ink on hover, `28px` apart. Sign-in is a ghost button, Get started is primary.

### Signature: the availability grid

The product's defining component — a day rail beside a time grid, both fixed-height
scroll regions. Its rules: tabular figures throughout so times and per-day counts align
in columns; a 28px fade on the trailing edge of each scroll region while there is more to
scroll, on whichever axis is actually scrolling; a skeleton during load that holds the
loaded grid's exact footprint; and AI-recommended times marked by an accent outline plus a
sparkle glyph, never by a fill.

## Do's and Don'ts

### Do

- **Do** style through the CSS variables (`var(--color-surface)`, `var(--color-muted)`,
  `var(--color-accent)`). Every colour in the system has a token; a literal hex in a
  component is unreachable by the dark theme.
- **Do** reach for `Card` / `CardHeader` / `CardBody` for any app surface, so elevation
  and internal rhythm stay consistent.
- **Do** pick an existing width tier when adding a page. Landing, Browse, Read, or Form —
  matching the page's type is what makes navigation feel smooth.
- **Do** render every time, date, duration, and count with tabular figures.
- **Do** keep elevation a response to state, not a property of a component.
- **Do** give every scroll region that clips content a trailing fade, so a half-visible
  row reads as "more" rather than as a crop.

### Don't

- **Don't** put a coloured `border-left` or `border-right` above 1px on a card, list item,
  callout, or alert. It is the most recognisable tell of generated UI, and this system has
  a real accent-marker pattern already — the 3px nav pointer pinned to a container edge,
  not a stripe down the side of content.
- **Don't** introduce a serif or a second display face. Geist Sans does both jobs; a
  serif was deliberately removed from this system once already.
- **Don't** write arbitrary radii or type sizes (`rounded-[12px]`, `text-[15px]`) for UI
  surfaces. Use the scale. The exception is a literal object being drawn — a device
  bezel, a calendar tick — where the number describes a real thing.
- **Don't** use gradient text, or glass and blur as decoration. Emphasis comes from weight
  and size; the one backdrop-blur in the system sits on a pill that genuinely overlaps
  scrolling content.
- **Don't** add a transition to `body *` or any global selector. It delays every hover,
  focus, and selection in the product. Theme changes get a scoped 220ms class; everything
  else declares its own.
- **Don't** ship a loading state that is smaller than the content it will become. A
  skeleton holds the footprint; a line of text lets the page jump under the cursor.
- **Don't** animate without honouring `prefers-reduced-motion` — especially anything that
  loops.
