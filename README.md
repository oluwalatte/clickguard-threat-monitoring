# ClickGuard Threat Monitoring

A working prototype of the Threat Monitoring feature and the design system it is built from.

- Prototype: https://clickguard-threat-monitoring.vercel.app
- Storybook: https://clickguard-threat-monitoring-storybook.vercel.app
- Rationale: `docs/rationale.md` (after P5)
- Product contract: `docs/decisions.md`

## Mechanics modelled
A visitor is an IP with many visits. Only paid visits cost money. Evidence accrues across the
journey; at one visit the system decides to block, and the exclusion becomes active on the
advertising platform as a separate event, sometimes after a further paid click.

Invented for this exercise: network type, click velocity, device consistency, exclusion sync state.

## Working on it

```bash
npm install
npm run dev          # prototype on http://localhost:5173
npm run storybook    # Storybook on http://localhost:6006
```

Before any commit, all five gates must pass:

```bash
npm run typecheck && npm run check:tokens && npm test && npm run build && npm run build-storybook
```

`check:tokens` fails on any raw hex or pixel value in `src/` outside `src/ui/tokens/`.

## Deploying

Two Vercel projects are built from this repository. The root directory is linked to the
prototype project (`.vercel/`, not committed).

```bash
npm run deploy:app        # clickguard-threat-monitoring, uses vercel.json
npm run deploy:storybook  # clickguard-threat-monitoring-storybook, uses vercel.storybook.json
```

The Storybook script resolves its project by name through the Vercel CLI, so a logged-in
CLI is the only requirement. Nothing is written by hand.

## Structure
- `src/ui/tokens/` the token files; `src/ui/styles.css` the single CSS entry.
- `src/ui/<Name>/` one component per folder: `Name.tsx`, `Name.module.css`, `Name.stories.tsx`.
- `src/data/` types, golden cases, factory, selectors, tests (P3).
- `src/app/` routes and composition. Imports from `src/ui` only.
- `docs/` decisions, handoff, the AI workflow log, and explorations.
