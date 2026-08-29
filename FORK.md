# This fork

`originalmagneto/dayotter`, a fork of [`Dayotter/dayotter`](https://github.com/Dayotter/dayotter)
running self-hosted at `cal.humanintheloop.sk` on Dokploy.

## Branch layout

| Branch | What it is |
|---|---|
| `main` | **An exact mirror of `upstream/main`. Never commit here.** Its only job is to be a clean base to rebase onto. |
| `hitl` | Our work: the Dokploy deploy config, the two Dockerfile fixes, and the design pass. This is what Dokploy builds (autoDeploy on push). |

Keeping `main` clean is the whole point. With our commits sitting on `main`, every
`pull upstream` was a merge into 17 files we had modified; as a patch series on `hitl`
it is a rebase that either applies cleanly or fails loudly in one place.

## Syncing with upstream

```bash
git fetch upstream
git checkout main && git reset --hard upstream/main && git push
git checkout hitl && git rebase main
# resolve anything that conflicts, then:
git push --force-with-lease
```

The force-push is expected — rebasing rewrites `hitl`. Use `--force-with-lease`, never
plain `--force`, so a push from somewhere else is not silently discarded. The push
triggers a Dokploy rebuild (~10 min; `COPY . .` precedes the install, so nothing caches).

**Where conflicts will land.** Our delta touches `apps/web/Dockerfile`, `globals.css`,
`slot-grid.tsx`, the `(app)` layout, four dashboard components, and all seven
`lib/i18n/locales/*/booking.json` files. The locale files are the likeliest to fight,
since upstream adds keys to them regularly; ours only adds `slotsAvailable` after
`noTimes`, so take both sides.

## What is in the delta, and what could leave it

Three classes now, and they age very differently:

- **Deploy-only, permanent.** `docker-compose.dokploy.yml` and this file. Never
  going upstream; zero conflict risk (new files).
- **Sent upstream.** The build fixes, the i18n crash, the a11y pass and the booking
  and app craft work are open as PRs #255–#259 against `Dayotter/dayotter`
  (issues #252–#254). If they merge, those commits drop out of this branch on the
  next rebase. **Check their state before resolving a conflict in the same files** -
  a conflict there may mean the change landed upstream and ours can simply be
  dropped.
- **The rebrand, permanent and wide.** SKALLARS Law naming, the palette, General
  Sans, the mark, and the removal of the mascot illustrations. This is the class
  that changes the character of the fork.

## The rebrand changes what syncing costs

Before the rebrand this was a thin patch series and a rebase was mostly clean.
It is not that any more. The delta now touches `app/globals.css`, the root layout,
every marketing page, and ~500 occurrences of the product name. A rebase onto a
release with marketing changes will conflict, and it will conflict in prose.

That is a deliberate trade the owner made, not an accident - but it means the
sync habit has to change:

- **Take upstream selectively.** Pull the app and package changes; take theirs
  wholesale for `app/(marketing)/**`. Those pages are gated off (below), so their
  content no longer matters here - which turns the widest conflict surface in the
  fork into a `git checkout --theirs`.
- **`globals.css` conflicts are ours to win.** Upstream tuning of DayOtter's warm
  palette is not wanted here. Take our side and only port genuinely structural
  changes (a new token, a new layer).
- **`lib/marketing.ts` is the naming hub.** The product name lives in `BRAND.name`,
  so a future rename is one line - it is the marketing prose around it that costs.

## The marketing site is gated, not deleted

`app/(marketing)/layout.tsx` calls `notFound()` unconditionally, so all ~22
pages under it are 404 on every firm domain. They were selling a scheduling
product from a law firm's address.

They are gated rather than deleted on purpose: upstream keeps editing those
files, and a deleted file is a modify/delete conflict on every single rebase.
One `notFound()` costs nothing and reverts in one line.

Two things had to move out from under it:

- `/privacy` and `/terms` now live in `app/(legal)/`, with their own minimal
  shell. They are linked from the sign-up form and from booking confirmations,
  so they must stay reachable - and they could not keep the marketing nav, half
  of which now 404s.
- `app/sitemap.ts` and `app/llms.txt/route.ts` were rewritten. Both enumerated
  the marketing routes; `llms.txt` additionally described the firm as an
  open-source scheduling platform with a per-seat price.

## Who may create an account

`SIGNUP_ALLOWED_DOMAINS` is checked in `packages/auth/src/signup-gate.ts` from
Better Auth's `user.create.before` hook - the one point every path to a new
account passes through, Google sign-in included. **Unset means closed.**

Rules are comma-separated and scoped to a Host, because one deployment serves
three firms and an @skallars.com address has no business registering on
cal.lawoss.app:

    SIGNUP_ALLOWED_DOMAINS="cal.skallars.com=skallars.com,cal.lawoss.app=lawoss.app"

A rule's value is an email domain, one exact address (for a person whose address
is not on a firm domain - an exact address, never a public mail domain), or `*`.
A rule written without a `host=` prefix applies to every domain on the stack.

## Known follow-ups
- The AI assistant is still called "Otter" in ~276 places, including four
  component filenames. Renaming it is a separate decision from renaming the
  product.
- `apps/mobile` was deliberately left on the old name: it is not deployed from
  this fork, so renaming it would be pure conflict surface.
