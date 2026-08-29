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

Two classes, and they age differently:

- **Deploy-only, permanent.** `docker-compose.dokploy.yml` and this file. Never going
  upstream; zero conflict risk (new files).
- **Genuinely upstream-worthy.** The heap-ceiling and `HOSTNAME=0.0.0.0` Dockerfile
  fixes are plain bugs — the second one 502s behind any reverse proxy on a second Docker
  network. The design pass (focus ring, reduced-motion, scoped theme transition, booking
  skeleton and scroll fades, tabular figures) is not deployment-specific either. If those
  are sent upstream and merged, they drop out of this branch on the next rebase and the
  delta shrinks to the first class.

`DESIGN.md` and `.impeccable/design.json` sit in between: they document the upstream
design system rather than our deployment, but they were generated here.
