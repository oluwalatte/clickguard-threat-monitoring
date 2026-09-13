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
  `scripts/deploy-storybook.mjs`, which resolves the second project by name through the CLI
  and swaps in `vercel.storybook.json`. The first version needed a hand-written id file; the
  user asked for that to go, so the script now links a throwaway temp directory instead. Vercel truncates auto-generated `.vercel.app` names at 35 characters, so the
  full `clickguard-threat-monitoring-storybook.vercel.app` domain was added to the project by
  hand; the truncated alias also still resolves. Vercel did not detect Vite on the first app
  deploy, so `vercel.json` pins the framework, build command and output directory.

**Judgement calls the agent made and flagged:** stories in P1 (one per component); sidebar
items beyond Threat monitoring shown but inert until P4 decides; CI on Node 24 to match
Vercel; the time box (45 minutes) was exceeded because converting ten components with
tokenised pixels is closer to two hours.

## P2. Stories

**Agent proposed** one story per meaningful variant or state from the prompt files, the
readme's component table and the DS6 matrix, with interaction tests where cheap, and story
data hand-written from the decisions' own example sentences rather than the kit fixtures
(which carry em dashes, verdict-changing actions and an invented "prevented waste" figure).

**User directed:** proceed with the next phase; D13 (the sidebar as a component) had landed on
main, which settled the one open P1 question.

**Agent produced:**

- 60 stories across the ten components and Foundations. Fixtures in `src/ui/stories/`
  cover the golden cases the components must show: block then sync, a paid click between
  the decision and the exclusion becoming active, an organic return that converts after the
  block (worded as conflicting evidence, not proof), a failed sync, and a single visit.
- Interaction tests with `storybook/test`: loading blocks the click, raw-value and
  visit-evidence disclosures toggle `aria-expanded`, table sort updates `aria-sort` and the
  live region and reorders rows, the row action fires on Enter with the visitor in its
  accessible name, the active nav item carries `aria-current`.
- The a11y addon set to fail the story test run on violations. Running every story in
  Chromium found two contrast failures inherited from the export: the accent indigo as text
  (secondary buttons at 4.06:1, paid visit labels at 3.69:1 on the canvas) and white on the
  accent (primary button at 4.06:1). The export's own contract promises 4.5:1, so this is a
  fix, not a new decision. Added `--action-primary-ink` (indigo-700, 8.1:1 on white) for
  accent text and `--action-primary-fill` (indigo-600, 5.5:1 under white) with hover and
  active steps for filled controls. The accent itself is unchanged for surfaces, borders and
  the focus ring. Both Tailwind exports carry the new tokens.
- `npm test` still runs only the unit project; the Storybook browser project runs locally
  with `npx vitest run --project storybook` because CI has no browsers installed.

**Judgement calls flagged:** the primary button is now one indigo step darker than the
sampled product colour, for contrast. The Icon registry story is the only "count" story; it
exists so an unknown icon name is caught by TypeScript, not by eye.

## P3. Data

**Agent proposed** types that encode the mechanics rather than describe them, eight
hand-authored golden cases, a seeded factory to 48 visitors, and reconciliation tests for the
claims the interface will make.

**User directed:** merge P2 with a merge commit and move to P3. No further direction; the
data contract is fully specified by `decisions.md` and the build plan's section 6.

**Agent produced:**

- `types.ts`: visitor by IP; visits with per-visit location and device so a journey can
  show inconsistency; paid-only platform, campaign and cost; a decision with the visit it
  followed, one of three confidence labels, a plain-language summary and ranked evidence; a
  monitoring state with the D8 note; exclusion sync as its own chronological events per
  platform (pending, delayed, active, failed); room for a manual override (D9). Nothing
  derived is stored.
- `engine.ts`: the mock decision model. It walks a journey cumulatively, decides at the
  first visit over the line, and writes evidence as sentences. The internal score picks the
  visit; it is never stored or shown. Confidence is high only with an automation signal,
  conflicting whenever contradictory evidence exists. Monitoring notes follow the D8
  template. A VPN with repeated paid clicks stays under evaluation until a purchase.
- `golden.ts`: the eight cases with authored outcomes, summaries and sync events. Their
  evidence lists come from the shared evidence writer, so they cannot drift from the visits.
  Case 6 has a delayed sync and a paid click in the gap. Case 5's summary says the later
  conversion is not by itself proof the block was wrong (rule 10).
- `factory.ts`: seeded filler around the golden cases, judged by the same engine. Sync
  events can be delayed or fail; a failed platform can still deliver paid clicks; no paid
  click lands on a platform once its exclusion is active. One filler visitor carries a
  manual override so the D3 vocabulary is complete on screen.
- `selectors.ts`: display status, counts, exposure as a visible sum (null when any cost is
  missing), the table row, D7 sorts with undecided rows always last, filters by search,
  status, traffic and platform, and the merged journey for the timeline.
- `format.ts`: complete timestamps, relative times from a fixed reference, durations.
- 82 tests: determinism, size, unique IPs, every status present, per-visitor reconciliation
  of counts, timings, decision references, sync chains and the no-paid-after-active rule,
  each golden case's contract, engine agreement with the golden cases, sorts, filters,
  the journey order, and the formatters.

**Judgement calls flagged:** the reference "now" is fixed at 2026-09-13T12:00Z so relative
times are deterministic. The monitoring threshold and the VPN rule were tuned so the engine
reaches the authored status on every golden case; that test is what keeps the filler
consistent with the contract. Paid-visit share in the filler is about 70 percent.

## P4. Prototype

**User directed:** first, confirm the hard requirement that the prototype imports and renders
the components from the Storybook library. The agent reported that the substance held (one
implementation, one entry point, no copies) but the form did not (a path alias, not a named
package), and recommended the workspace-package move the build plan had anticipated. The user
chose it as the first P4 commit.

**Agent produced:**

- `packages/ui` as the workspace package `@clickguard/ui`. The prototype depends on it by
  name and imports `@clickguard/ui/styles.css`; Storybook documents the same source files.
  TypeScript paths, Vite resolution and the token check point at the package. All gates and
  the 60-story browser run passed unchanged after the move.
- Two additions to the system because the app must not style controls itself (rule 9):
  `SearchField` (native search input, always labelled, clear button) and `FilterChip` with
  `FilterGroup` (aria-pressed toggles under a visible caption). The timeline gained an
  `override` event type in the info tone so a manual override reads as a person's action in
  the journey. Stories and interaction tests for each; 69 stories now pass with a11y as error.
- A cell's second line in the table is now styled by the system as support text, so the app
  passes two spans and makes no visual decision.
- Table route: search by IP or location, status chips with counts, a traffic toggle, and
  header sorting for recency (default), block time, visits, paid clicks and confidence (D7).
  Undecided rows sink in either direction. Search, filters and sort live in the URL, so the
  breadcrumb from a visitor restores the table as it was. The filtered-empty state names how
  many filters are active and says an empty list is not a clean account.
- Visitor route: the decision summary leads (criteria 1, 2, 4, 6), the journey sits directly
  under it beside the evidence (criteria 3, 5, 7). Headline names the visit the decision
  followed; the summary sentence is the data's own; the sync block reports the worst platform
  state and whether paid clicks got through since; exposure is a visible sum with its
  calculation in the evidence footnote (D6). Every visit carries its own signals; list items
  link back to the visit they came from. Unknown addresses get an honest not-found state.
- The shell starts collapsed below the narrow breakpoint so phones keep their width for the
  stacked table.
- `present.ts` holds the adapters from data to component props, with 10 unit tests.

**Judgement calls flagged:** eight columns with percentage widths and a 1120px table minimum;
narrower panels scroll the table horizontally, and below 760px it stacks. The table's "Why"
column shows the full Monitoring note rather than a truncated preview, because the note is the
only explanation of why the visitor is not blocked. Loading and error table states exist in
the system but are not reachable in the prototype: the data is local and synchronous (out of
scope in `decisions.md`).

### P4 review, 13 Sep 2026

**User found** the Storybook Vercel project serving the prototype. Cause: the CLI's local
config only steers the CLI; Vercel's remote build reads the repository's own `vercel.json`,
which belongs to the prototype. **Fix:** Storybook is built locally and shipped as a prebuilt
deployment through Vercel's Build Output API, so no remote build runs and what renders
locally is what ships. Verified: the live title is Storybook's and unknown paths return 404.

**User directed** the table changes now recorded as D10a and the D5 and D9 amendments: "Why"
becomes "Key evidence" with up to four concise labels per row and the sentence moves to the
detail; "Decision confidence" replaces "Confidence"; Monitoring rows always read "Conflicting
evidence" or "Insufficient evidence"; "Manually allowed" leaves the data and the filter until
the override workflow is modelled; conversion joins deliverability as evidence; per-visit
detail names form, deliverability and conversion explicitly with "Not submitted" where no form
exists; the page description says "observed" because the table includes Not evaluated.

**Agent produced:** a `label` on every evidence item from the engine, a `keySignals` selector
that keeps the first mitigating signal visible in an ambiguous row, "No conversion" evidence
when a form was submitted without a purchase, "No interaction" versus "Low interaction"
from pointer movement, `SignalTag` in the system (neutral ink, info tone for mitigating,
dashed for unavailable, never a status colour), the insufficient label in DecisionSummary, and
the per-visit signal list. The rationale's "Signal placement" section is the user's text,
lightly shortened, in `docs/rationale.md`.

### Table column order, 13 Sep 2026

**User directed** the column order now recorded as D14, with decision time inside the Status
cell and platform state surfaced in the table only as an exception. The column rationale is
the user's text in `docs/rationale.md`.

**Agent produced:** `SyncFlag` in the system (amber for pending and delayed, red for failed,
glyph plus text, shown only on exceptions), per-platform rows in `DecisionSummary` so a mixed
picture such as Google Ads active and Meta Ads pending is never flattened, a short timestamp
form for scanning ("11 Sep, 14:53"), and the Status column sorting by verdict and then most
recent decision so the block-time sort from D7 survives the removal of the Decided column.
