# AI workflow log

A running record of what the agent produced at each stage and what the user directed or
overrode. Appended as work happens. The rationale is written from this file and
`decisions.md`.

## P0. Product contract

- User wrote `docs/decisions.md` before any code. First commit.

## P1. Scaffold and install the system

**Agent proposed** a branch plan after reading `CLAUDE.md`, `decisions.md` and `handoff.md`:
scaffold and deployment first, then tokens, then the ten export components converted to TSX
plus CSS modules, then a placeholder shell on the two routes from D2. It flagged one blocking
question (reuse the previous build's two Vercel projects or create new ones) and listed its
defaults for the rest.

**User directed:** create `clickguard-threat-monitoring` and
`clickguard-threat-monitoring-storybook` as new Vercel projects. Accepted the defaults.

**Agent produced:**

- Vite, React, TypeScript, React Router and lucide-react on the infra from the previous
  build. Vitest pinned to the 4 line because the Storybook vitest addon does not yet accept 5.
- Tokens adopted as-is from the export. Added component-size tokens (`--space-0`, icon
  sizes, marker size, icon-button and icon-well sizes, skeleton height, collapsed sidebar
  width, table min width, action column, narrow breakpoint) and `--border-width-strong` plus
  `--radius-marker`, so no component carries a raw pixel. The narrow breakpoint has a numeric
  twin in `tokens/breakpoints.ts` for the resize observer. A `.cg-visually-hidden` utility
  lives in `base.css` for live regions and hidden headers.
- `styles.css` no longer imports the Tailwind theme file (rule 7). Both Tailwind files stay
  on disk as export layers.
- `check:tokens` now walks all of `src/` and exempts only `src/ui/tokens/`. Stories are
  included. The reviewed `token-ok` escape remains; P1 uses it zero times.
- Ten components converted. Variants are data attributes; hover, active and focus live in
  CSS; the `cg-*` class hooks from the export are dropped because the modules are the
  stylesheet. Icon is a curated registry over lucide-react, typed as a union, so the bundle
  carries only the glyphs in use. Four lucide names changed since the export
  (`circle-check`, `circle-plus`, `circle-minus`, `circle-help`, `funnel-x`,
  `circle-chevron-right`); the current names are used.
- One Foundations story showing the token families, and one Default story per component so
  each conversion is proven to render. The full story matrix is P2.
- App shell: sidebar with the product's navigation groups, only Threat monitoring routable.
  Routes `/threat-monitoring` and `/threat-monitoring/:visitorId` render placeholder panels.
  `vercel.json` rewrites deep links to the SPA.
- Two Vercel projects. The root is linked to the prototype; Storybook deploys through
  `scripts/deploy-storybook.mjs`, which swaps in `vercel.storybook.json` and targets the second
  project by id. Vercel truncates auto-generated `.vercel.app` names at 35 characters, so the
  full `clickguard-threat-monitoring-storybook.vercel.app` domain was added to the project by
  hand; the truncated alias also still resolves. Vercel did not detect Vite on the first app
  deploy, so `vercel.json` pins the framework, build command and output directory.

**Judgement calls the agent made and flagged:** stories in P1 (one per component); sidebar
items beyond Threat monitoring shown but inert until P4 decides; CI on Node 24 to match
Vercel; the time box (45 minutes) was exceeded because converting ten components with
tokenised pixels is closer to two hours.
