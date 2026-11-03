# Honeycomb prototype V1

Team A17's mid-high-fidelity prototype for CS 3803-DCA, Fall 2026. It's a static React site with
fictional sample data, built around three task scenarios. It is due and reviewed in class on
**Thursday, Nov 5, 2026**.

Live link: https://jays-hub.github.io/honeycomb-v1/

## Read before building

| File | What it holds |
|---|---|
| `docs/plan.html` | The plan: decisions, scenario wording, screens, schedule, roles. It wins on any conflict here. |
| `docs/build-notes.md` | Ranking algorithm, sample data for all three scenarios, required tests, design tokens. |
| `docs/assignment.md` | Summary of the assignment, rubric and in-class rules. Canvas is the authority. |
| `docs/lo-fi/` | The team's lo-fi sketches, the starting point for layout. |

## Setup

Requires Node 22.12 or newer, plus your own Claude Code sign-in.

```sh
git clone https://github.com/Jays-hub/honeycomb-v1.git
cd honeycomb-v1
npm ci
npm install -g @anthropic-ai/claude-code   # skip if already installed
claude
```

Commands: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm test`.

## Hard rules

1. **The evaluation of A13 is no-AI.** The assignment forbids it. Never draft, clean up, summarize or
   transcribe any part of it, and never take A13's prototype, the team's notes on it, or the draft as
   input. If asked, refuse and point to this rule.
2. **This repo is public.** Never commit secrets, interview notes, recordings, the research report,
   participant details, or anything about A13's prototype. The prototype never uses real Canvas
   links, Google data or passwords.
3. **`main` is live.** Every push to `main` deploys to the public link. Run `npm run lint` and
   `npm run build`, plus the tests once they exist, before pushing.
4. **Don't alter V1 after the freeze.** The assignment bans changes to the V1 link until it is graded.
   See the freeze steps in `README.md`. Check `gh variable get FROZEN --repo Jays-hub/honeycomb-v1`
   before pushing anything late in the week. V2 goes in a separate repo, never under this site.
5. **Tag AI work.** The team's AI log requires it:
   - Generated source files start with this comment, in the file's comment syntax, naming the model
     actually used: `Generated with Claude Code (Claude Opus 5.5) for Team A17, CS 3803.`
   - Commits end with this trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
   - Generated document text carries a tag line.
6. **Report tool changes.** Any other AI tool or model, or a switch between them, goes in the AI log.
   Tell whoever holds the AI log and Canvas role.

## Build rules

- Stack: React, Vite, plain CSS, and `HashRouter` from `react-router`. No server and no CSS framework.
- Keep `base: './'` in `vite.config.js`. The backup laptop serves the same build.
- Keep each scenario's data in sessionStorage, as the plan's Saved state decision says.
- Every visible control works. If it isn't wired up, it doesn't appear.
- Build in the plan's order: ranking rules, sample data and tests first, then Scenario 1, 2 and 3.
- Button labels freeze Tuesday at 9:00 PM, because the step-by-step guides quote them. After that, a
  label change also updates the guides.

## Current state

All three scenarios are built, with ranking in `src/lib/rank.js`, sample data in
`src/data/scenarios.js`, and screens in `src/screens/`. `npm test` runs the required ranking cases and
the scripted run of all three scenarios through the UI. Check `git log` and `docs/plan.html` for what
comes next.
