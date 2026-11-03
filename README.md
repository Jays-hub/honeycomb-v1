# Honeycomb prototype V1

Team A17's mid-high-fidelity prototype for CS 3803, Fall 2026. Honeycomb ranks a Georgia Tech
student's school, club, job and personal tasks into one "Do this next" card.

**Live link:** https://jays-hub.github.io/honeycomb-v1/

This prototype uses fictional sample data. It has no real Canvas or Google connection. Do not enter
real links or passwords. Keep secrets, interview notes and recordings out of this repo.

## Run it

```sh
npm ci
npm run dev      # local development
npm run build    # production build in dist/
npm run preview  # serve the build locally, used for the backup laptop
npm test         # ranking rules and the scripted run of all three scenarios
```

## Work on it with Claude Code

Run `claude` in this folder. `CLAUDE.md` loads automatically and points to the plan, build notes and
assignment summary in `docs/`.

## Deploy

Every push to `main` deploys to GitHub Pages until the V1 freeze.

## Freeze V1

The assignment bans changes to the V1 link until it is graded. To freeze:

```sh
gh variable set FROZEN --body true --repo Jays-hub/honeycomb-v1
git tag v1.0 && git push origin v1.0
```

After that, pushes to `main` no longer deploy, and only a `v1.*` tag can. Until the Canvas submission
on Thursday, a fix gets a new tag (`v1.1`) and an entry in the AI log. After it, nothing changes.
V2 lives in a separate repo with its own link.

## AI use

Generated with Claude Code (Claude Opus 5.5). Generated source files carry a header comment, and
commits carry a trailer. Details are in the team's AI Disclosure and Tool Strategy Log.
