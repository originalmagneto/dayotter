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

- **Take upstream selectively.** Pull the app and package changes; be willing to
  keep our own version of `app/(marketing)/**` wholesale rather than merging line
  by line. Their marketing copy describes an open-source product and ours
  describes a law firm; there is no meaningful merge of those two.
- **`globals.css` conflicts are ours to win.** Upstream tuning of DayOtter's warm
  palette is not wanted here. Take our side and only port genuinely structural
  changes (a new token, a new layer).
- **`lib/marketing.ts` is the naming hub.** The product name lives in `BRAND.name`,
  so a future rename is one line - it is the marketing prose around it that costs.

## Known follow-ups

- The marketing pages still read as an open-source product under a law firm's
  name: `/pricing`, `/vs`, and the self-hosting pages compare "SKALLARS Law" to
  Calendly and Cal.com. Either trim those routes or point the marketing root at
  the booking page.
- The AI assistant is still called "Otter" in ~276 places, including four
  component filenames. Renaming it is a separate decision from renaming the
  product.
- `apps/mobile` was deliberately left on the old name: it is not deployed from
  this fork, so renaming it would be pure conflict surface.
