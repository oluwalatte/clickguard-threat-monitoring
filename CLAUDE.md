# ClickGuard Threat Monitoring: how this repo is built

A working prototype of ClickGuard's Threat Monitoring feature plus the design system it is built
from, documented in Storybook. The product contract is `docs/decisions.md`; the build plan is
`docs/handoff.md`. Read both before doing anything.

## Rules of the system
1. Components consume tokens only. No raw hex, no raw px in `src/` outside `src/ui/tokens/`.
   `npm run check:tokens` enforces this.
2. Red is reserved for Blocked and destructive states. Amber is Monitoring. Green is a successful
   sync or a positive outcome. Never colour a suspicious-but-unblocked signal red.
3. Colour never works alone: every status carries a marker shape and a text label.
4. Plain language before model language. Scores and probabilities support; they never lead.
5. One primary action per view. Nothing in the core prototype changes a verdict (D9).
6. Timestamps are complete where auditability matters and relative where scanning matters.
7. Components are not built from Tailwind utilities. The Tailwind theme files are an export of the
   tokens, never imported with preflight.
8. Every `src/ui` component ships with a story per meaningful variant and state.
9. `src/app` imports from `src/ui` only and owns composition and layout, never visual decisions.
10. Do not describe a later conversion as proof that an earlier block was wrong. Do not claim
    money was saved unless the calculation is on the page.

## Structure
- `src/ui/tokens/` the token files from the export, `src/ui/styles.css` the single CSS entry.
- `src/ui/<Name>/` `Name.tsx`, `Name.module.css`, `Name.stories.tsx`; exported from `src/ui/index.ts`.
- `src/data/` types, golden cases, factory, selectors, tests.
- `src/app/` routes and composition.
- `docs/decisions.md` product decisions. `docs/ai-workflow.md` running log. `docs/explorations/` inputs.

## How to work
- One phase per branch, one PR per phase. Open the PR; the user merges after editing the description.
- Never make a product decision silently. If it is not in `decisions.md`, propose options and stop.
- Before any commit: `npm run typecheck && npm run check:tokens && npm test && npm run build && npm run build-storybook`.
- Append to `docs/ai-workflow.md` as you go.
- No em dashes anywhere: code, docs, copy, commits.
