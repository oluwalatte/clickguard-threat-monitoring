# AI workflow log

What the agent produced at each stage, and what I directed or overrode. Appended as work lands.
The rationale is written from this file and `decisions.md`.

The rule for the third column: a call is mine only if I can say, unprompted, why I made it and
what I rejected. Where the agent proposed options and I chose, that is what the row says.
Implementation is the agent's and is recorded as such; the brief expects that.

## Direction and overrides

| Stage | AI contribution | My direction or override |
| --- | --- | --- |
| Before P0 | Built a first prototype end to end in a separate repo (drawer detail, a 220-row generator, 48 stories) and deployed it, making product decisions as it went | Rejected the build. It was making product decisions without me, which is the thing the brief says it is buying from me. Restarted from a written product contract and changed the process: the agent proposes, I merge, nothing is decided silently |
| Success criteria | None; the agent audited the first build against them once written | Wrote the six questions a customer must answer within about 30 seconds. The audit exposed two gaps in the first build: no timestamp on the decision, and no way to tell a borderline block from a strong one. Both became requirements (criteria 2 and 6) |
| Detail pattern | Rendered four drawer information orders on one canvas with the same visitor in each (`docs/explorations/drawer-options.html`) | Chose a dedicated route over all four: long journeys need room, deep links matter for a shareable explanation, and narrow screens force a drawer into a page anyway (D2). The canvas stays as evidence of what was rejected |
| Design system | Claude Design produced the tokens, ten components, guideline cards and a UI kit from ClickGuard's own screens and the written brief | Chose to build on the product's real palette and information architecture rather than a generic one. Set the status scale, density, Lucide icons, the sidebar, light only |
| P0 contract | Drafted `docs/decisions.md` from my answers, with the justifications I asked for | Decided the vocabulary (Blocked, Monitoring, Not blocked, Manually allowed) because "Allowed" alone conflates the system and a person; three confidence labels over a percentage; recency over spend as the default sort because spend is derived from mock cost; spend only with its calculation on the page and no protected-spend claim; no manual or bulk overrides in the core prototype, in my own words (D9); ratified the Monitoring-note rule the agent proposed (signals so far, why not blocked, never a tipping count); the sidebar as a system component with one live destination (D13) |
| P1 scaffold | Proposed the branch plan, converted the ten components, wired Storybook and CI, wrote the deploy scripts | Chose TSX plus CSS modules over the export's inline styles so hover and focus live in CSS, style objects are not repeated across components, and one script proves there are no raw values in `src/`. Directed two new Vercel projects rather than reusing the old ones. Rejected the hand-written Vercel project id file; the script now resolves the project by name through the logged-in CLI. Accepted the four calls the agent flagged: one Default story per component in P1 with the matrix in P2, sidebar items beyond Threat monitoring shown but inert until P4, CI on Node 24 to match Vercel, and the exceeded time box (45 minutes planned, about two hours real) |
| P2 stories | Proposed one story per meaningful state from the prompt files and the DS6 matrix, with story data written from the decisions' own example sentences instead of the kit fixtures. Produced 60 stories, interaction tests, and an a11y run that found two contrast failures inherited from the export | Directed it to proceed on the plan as written; D13 had settled the one open question. Merged with the contrast fix: the export promises 4.5:1 and did not meet it, so a darker ink and fill step for the accent honours the system's own contract rather than changing a decision. Accepted the flagged call that the primary button is now one indigo step darker than the sampled product colour |
| P3 data | Proposed types that encode the mechanics, eight hand-authored golden cases, a seeded factory to 48 visitors, and reconciliation tests. Produced the decision engine, the golden cases, the factory, selectors and 82 tests | Directed it to merge P2 with a merge commit and move on; no further direction was needed because the data contract was already fixed in `decisions.md` (the golden-case list, D6, D7, D8, D9, D11). Accepted the flagged tuning: a fixed reference "now" so relative times are deterministic, and a monitoring threshold and a VPN rule tuned until the engine reaches the authored status on every golden case, with a test that keeps the filler consistent with the contract |
| P4 prototype | Not started | Pre-registered from `decisions.md` before the phase: dedicated routes (D2); the decision summary leads the visitor page and the journey sits directly under it (success criteria); recency is the default sort (D7); exposure only as a visible sum (D6); the Monitoring note follows the D8 template; no verdict-changing actions (D9); the block decision and the exclusion sync are separate timeline events (D11); only Threat monitoring is a live destination (D13). Overrides to be recorded when the phase lands |
| P5 rationale | Not started | The rationale is mine to write, from `decisions.md` and this file. The agent may draft; I rewrite. Success criteria go into `docs/success-criteria.md` with where each is answered on the page |

## Agent implementation notes

Facts the agent recorded while building, kept because they explain choices a reader will meet
in the code. Not decisions.

### P1

- Vite, React, TypeScript, React Router and lucide-react on the infrastructure from the previous
  build. Vitest pinned to the 4 line because the Storybook vitest addon does not yet accept 5.
- Tokens adopted as-is from the export. Component-size tokens added (`--space-0`, icon sizes,
  marker size, icon-button and icon-well sizes, skeleton height, collapsed sidebar width, table
  min width, action column, narrow breakpoint) plus `--border-width-strong` and `--radius-marker`,
  so no component carries a raw pixel. The narrow breakpoint has a numeric twin in
  `tokens/breakpoints.ts` for the resize observer. `.cg-visually-hidden` lives in `base.css` for
  live regions and hidden headers.
- `styles.css` no longer imports the Tailwind theme file (rule 7). Both Tailwind files stay on
  disk as export layers.
- `check:tokens` walks all of `src/` and exempts only `src/ui/tokens/`. Stories are included. The
  reviewed `token-ok` escape remains; P1 uses it zero times.
- Variants are data attributes; the `cg-*` class hooks from the export are dropped because the
  modules are the stylesheet. Icon is a curated registry over lucide-react, typed as a union, so
  the bundle carries only the glyphs in use. Four lucide names changed since the export
  (`circle-check`, `circle-plus`, `circle-minus`, `circle-help`, `funnel-x`,
  `circle-chevron-right`); the current names are used.
- One Foundations story and one Default story per component, proving each conversion renders.
- App shell: sidebar with the product's navigation groups, only Threat monitoring routable. The two
  routes render placeholder panels. `vercel.json` rewrites deep links to the SPA.
- Two Vercel projects. The root is linked to the prototype; Storybook deploys through
  `scripts/deploy-storybook.mjs`, which resolves the second project by name and swaps in
  `vercel.storybook.json`. Vercel truncates auto-generated `.vercel.app` names at 35 characters, so
  the full `clickguard-threat-monitoring-storybook.vercel.app` domain was added by hand; the
  truncated alias still resolves. Vercel did not detect Vite on the first app deploy, so
  `vercel.json` pins the framework, build command and output directory.

### P2

- 60 stories across the ten components and Foundations. Fixtures in `src/ui/stories/` cover the
  golden cases the components must show: block then sync, a paid click between the decision and
  the exclusion becoming active, an organic return that converts after the block (worded as
  conflicting evidence, not proof), a failed sync, and a single visit. Story data comes from the
  decisions' example sentences, not the kit fixtures, which carried em dashes, verdict-changing
  actions and an invented "prevented waste" figure.
- Interaction tests with `storybook/test`: loading blocks the click, raw-value and visit-evidence
  disclosures toggle `aria-expanded`, table sort updates `aria-sort` and the live region and
  reorders rows, the row action fires on Enter with the visitor in its accessible name, the active
  nav item carries `aria-current`.
- The a11y addon fails the story run on violations. Two contrast failures inherited from the
  export: the accent indigo as text (secondary buttons at 4.06:1, paid visit labels at 3.69:1 on
  the canvas) and white on the accent (primary button at 4.06:1). Added `--action-primary-ink`
  (indigo-700, 8.1:1 on white) for accent text and `--action-primary-fill` (indigo-600, 5.5:1 under
  white) with hover and active steps for filled controls. The accent itself is unchanged for
  surfaces, borders and the focus ring. Both Tailwind exports carry the new tokens.
- `npm test` runs only the unit project; the Storybook browser project runs locally with
  `npx vitest run --project storybook` because CI has no browsers installed. The Icon registry
  story is the only "count" story; it exists so an unknown icon name is caught by TypeScript.

### P3

- `types.ts`: visitor by IP; visits with per-visit location and device so a journey can show
  inconsistency; paid-only platform, campaign and cost; a decision with the visit it followed, one
  of three confidence labels, a plain-language summary and ranked evidence; a monitoring state with
  the D8 note; exclusion sync as its own chronological events per platform (pending, delayed,
  active, failed); room for a manual override (D9). Nothing derived is stored.
- `engine.ts`: the mock decision model. Walks a journey cumulatively, decides at the first visit
  over the line, writes evidence as sentences with raw values behind them. The internal score picks
  the visit and is never stored or shown. Confidence is high only with an automation signal,
  conflicting whenever contradictory evidence exists. A VPN with repeated paid clicks stays under
  evaluation until a purchase.
- `golden.ts`: the eight cases with authored outcomes, summaries and sync events; evidence lists
  come from the shared writer so they cannot drift from the visits. Case 6 has a delayed sync and a
  paid click in the gap. Case 5's summary says the later conversion is not by itself proof the
  block was wrong (rule 10).
- `factory.ts`: seeded filler to 48 visitors around the golden cases, judged by the same engine.
  Syncs can be delayed or fail; a failed platform can still deliver paid clicks; no paid click
  lands on a platform once its exclusion is active. One filler visitor carries a manual override so
  the D3 vocabulary is complete on screen.
- `selectors.ts`: display status, counts, exposure as a visible sum (absent when any cost is
  missing), the table row, D7 sorts with undecided rows always last, filters by search, status,
  traffic and platform, the merged journey for the timeline. `format.ts`: complete timestamps,
  relative times from a fixed reference (2026-09-13T12:00Z), durations, money.
- 82 tests: determinism, size, unique IPs, every status present, per-visitor reconciliation of
  counts, timings, decision references, sync chains and the no-paid-after-active rule, each golden
  case's contract, engine agreement with the golden cases, sorts, filters, journey order, and the
  formatters. Paid-visit share in the filler is about 70 percent.
