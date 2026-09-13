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
| P4 prototype | Reported that the hard requirement (the prototype renders the Storybook library's components) held in substance but not in form, and recommended the workspace-package move. Produced `packages/ui` as `@clickguard/ui`, the table route with URL-held search, filters and header sorts, the visitor route led by the decision summary with the journey and evidence beneath, four system additions the screens needed (SearchField, FilterChip, SignalTag, SyncFlag), an override event and per-platform sync rows, the data-to-props adapters with tests, and the fix that ships Storybook as a prebuilt deployment | Directed the package move as the first P4 commit so the library dependency is visible by name. On review of the built table: "Why" became "Key evidence" as up to four concise labels with the sentence moved to the detail; "Decision confidence" replaces "Confidence" because bot probability is a visit-level measure; Monitoring rows always read Conflicting or Insufficient evidence; conversion is evidence like deliverability; each visit names form, deliverability and conversion with "Not submitted" rather than a blank; "Manually allowed" leaves the data and the filter until the override workflow is modelled; "observed" rather than "evaluated" because Not evaluated rows exist (D10a, D5 and D9 amendments). Set the column order to the investigation sequence with decision time inside Status and enforcement shown in the table only as an exception (D14). Accepted the flagged calls: eight columns with percentage widths and a 1120px table minimum; Status sorts by verdict then most recent decision so the block-time sort survives; loading and error table states unreachable because the data is local
| P4b shell and pagination | Explained why the sidebar footer and pagination were missing (the shell was a P1 placeholder never revisited; pagination was never decided), proposed the scope, and produced `AccountRow` and `Pagination` as system components with stories, the page slice as a selector with tests, and the URL-held page | Chose pages of 20 for laptop height (D15) and the workspace row content, "Latte's workspace" with latte@clickguard.com (D13 amendment) |
| P4c filters | Confirmed the token rule holds (the check passes with no exceptions), compared the proposed toolbar with the built one, and named four product questions it left open: what a date range filters on, where Not evaluated goes, what deliverability and conversion mean for a visitor, and whether status stays multi-select. Produced `Select`, `Checkbox`, `FilterMenu` and `ActiveFilterChip` with `ActiveFilterBar` as system components with stories, the date range and secondary dimensions as selectors with tests, the chip derivation as an adapter with tests, and the recomposed toolbar with every filter still in the URL | Designed the toolbar: search, date range and status visible because they define the investigation set most often; the rest progressively disclosed in a Filters menu with removable chips; an All status so the whole list is one click away (D16). Chose any visit in range over last seen, kept Not evaluated as a fifth chip, set the exact labels "Submitted an invalid email at least once" and "Converted at least once" so a Converted slice never reads as proof of a false positive, and dropped multi-select status to keep the mode switch simple |
| P4d system audit | Audited every component and story in Storybook on review. Found and fixed: the disabled search field looked enabled and still offered its clear button; four stories whose interaction test left them in a state that contradicted their name (search field with value, checked checkbox, chips in a bar), so pairs of stories looked identical; the select's option list opened as the platform's own picker rather than under the field; long unbreakable table values (an IPv6 address) ran under the next column; and two fields borrowed a text token for their hover border | Directed the audit and named the first three. Chose wrapping over an ellipsis for long identifiers, on the agent's flag that hiding the end of an IPv6 hides the part that tells visitors apart |
| P4e sync tuning | On the data audit, reported that pending and delayed sync existed in the golden cases and stories but never at the reference clock in the generated data, because every chain had resolved to active or failed. Tuned the factory so the first two click farms are caught mid-sync: their journeys slide to end minutes before the clock, one inside the confirmation window and one past the 15-minute mark, with anything after the clock dropped. Added a test that pins both states and that nothing is dated after the clock | Directed the tuning so the enforcement gap (D11) is visible in the table without opening a golden case |
| P4d detail explorations | Built two canvases: the detail page (the recommended design as option A, an alternative as option B covering what A leaves open) and the visit row (three hierarchies with rationale). Added a back button through a new Button link variant. Built the chosen visit row into VisitTimeline and the data mapping | Asked for the recommended design plus one alternative, then three visit-row options with rationale. Chose option 1's collapsed row with option 2's expanded body (D17). Directed the back button styled as a text button in the accent colour with no left padding. The page-level choice is still open |
| P5 docs, QA, deploy | Drafted `docs/success-criteria.md`: for each of the eight questions, where it is answered on the page, what the reader sees on golden case 1 read from the running prototype, the table's scanning version, and the stories and tests that prove it. Criterion 8 is recorded as answered by decision (D9), not by the page. Drafted the five remaining rationale sections (detail pattern, status vocabulary and confidence, financial exposure, filter design, the AI workflow) from `decisions.md` and this log, each marked as a draft, then unmarked on review. Added a section on what was left out (D9). Made every table row open the visitor on click, keeping the action button as the keyboard route. QA: moved every story fixture date from February to September 2026 with relative labels recomputed by the app's own formatter against the fixed clock and nothing dated after it; checked every live URL and every repo-relative doc path with a cookie-free client (all as expected: prototype deep links resolve, Storybook returns 404 on unknown paths) | Directed the drafts to lose their draft markers; asked whether the rationale covered bulk actions, export and drawers. Chose a clickable row over pinning the Visitor column. Directed the QA pass: fixture dates and the link check | The rationale is mine to write, from `decisions.md` and this file. The agent may draft; I rewrite. Success criteria go into `docs/success-criteria.md` with where each is answered on the page |

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

### P4

- `src/ui` moved to `packages/ui` as the npm workspace package `@clickguard/ui`. The prototype
  depends on it by name and imports `@clickguard/ui/styles.css`; Storybook reads the same source
  files. TypeScript paths, Vite resolution and the token check point at the package. All gates
  and the story run passed unchanged after the move.
- System additions the screens needed, because the app may not style controls itself (rule 9):
  `SearchField` (native search input, always labelled, clear button), `FilterChip` with
  `FilterGroup` (aria-pressed toggles under a visible caption), `SignalTag` (neutral ink, info tone
  for mitigating signals, dashed for unavailable, never a status colour), `SyncFlag` (amber for
  pending and delayed, red for failed, glyph plus text, shown only on exceptions). The timeline
  gained an `override` event type; `DecisionSummary` gained the Insufficient evidence label and
  per-platform sync rows. A table cell's second line is system-styled support text, and table
  headers wrap at word boundaries. 79 stories pass with a11y as error.
- Table route: search by IP or location, status chips with counts, a traffic toggle, header sorts
  for recency (default), status then most recent decision, visits, paid clicks and decision
  confidence; undecided rows sink in either direction. Search, filters and sort live in the URL,
  so the breadcrumb restores the table. Columns per D14 with percentage widths and a 1120px table
  minimum; narrower panels scroll horizontally and below 760px the table stacks. The shell starts
  collapsed below that breakpoint.
- Every evidence item carries a scannable `label` from the engine; `keySignals` picks up to four
  per row, primary first, then mitigating, then supporting, so an ambiguous row reads as
  ambiguous. "No interaction" versus "Low interaction" comes from pointer movement; "No
  conversion" appears when a form was submitted without a purchase. Monitoring confidence is
  always `conflicting` or `insufficient`. No generated visitor carries a manual override.
- Visitor route: headline names the visit the decision followed; the summary sentence is the
  data's own; the sync block reports the worst platform state with one row per platform; exposure
  is a visible sum with the calculation in the evidence footnote (D6). Each visit lists interaction
  level, bot probability, VPN, network, form with deliverability, conversion, location and device,
  and carries its own signals; list items link back to their visit. Unknown addresses get an
  honest not-found state. `present.ts` holds the adapters with 18 unit tests.
- Storybook on Vercel: the CLI's local config only steers the CLI, and Vercel's remote build reads
  the repository's own `vercel.json`, which belongs to the prototype, so the Storybook project had
  been serving the prototype. It is now built locally and shipped through the Build Output API as
  a prebuilt deployment; no remote build runs. Verified by the live title and a 404 on unknown paths.

### P4b

- `AccountRow`: initials avatar in the accent surface with the accent ink, name and detail
  lines, avatar only when collapsed with the full text as title and accessible name.
- `Pagination`: a `nav` landmark with previous, next and numbered pages; the current page carries
  `aria-current` and changes weight as well as surface; the summary is a live region. Up to seven
  pages are listed in full, beyond that the ends and the neighbours of the current page.
- `paginate` in the selectors: pages of 20, clamped, derived on read; three tests. The route sorts
  through the data layer before slicing so headers and pages agree, and a `status` sort key was
  added there to match the Status column's verdict-then-recency order.
- The page parameter is dropped whenever search, filters or sort change.
- On review: the sidebar had been as tall as the page and scrolled away with it; the shell now
  holds it in a sticky, viewport-height rail so it stays in view top to bottom. Hover, focus
  and active are CSS states; stories now drive each one through a play function (Button,
  FilterChip, SearchField, SidebarNav items, table rows and row actions, Pagination, the
  evidence disclosure) so the state is visible and checked rather than trusted. 98 stories.

### P4c

- Four system additions, because the app may not style controls itself (rule 9): `Select`
  (native select, label visible by default or hidden with a leading glyph for the toolbar,
  option text that reads on its own), `Checkbox` (native input, accent colour from the tokens,
  label as the exact condition), `FilterMenu` (trigger carrying the active count, a non-modal
  dialog that focuses its first control on open, closes on Escape, Done or a click outside, and
  returns focus to the trigger) and `ActiveFilterChip` with `ActiveFilterBar` (an applied
  filter with one action, remove, grouped under a caption with Clear all). `Button` gained a
  `ref` prop so a composite can manage focus.
- The row gained country, every visit time, "invalid email at least once" and "converted at
  least once", all derived on read. `filterRows` takes one status, a date range with the
  reference clock, and the six secondary dimensions; `countryOptions` lists the countries in
  the data. Date presets are computed from `NOW`, so the slices are deterministic.
- Every filter still lives in the URL: `q`, `range`, `status`, `traffic`, `platform`,
  `country`, `confidence`, `email`, `converted`, beside `sort`, `dir` and `page`. Unknown
  values are ignored rather than trusted. A chip's remove and the menu's control edit the same
  parameter, so the two never disagree.
- Status counts are scoped by everything except status, so each chip says what choosing it
  would show, and All shows the size of the scoped list. The row-one Clear filters button went
  away: each visible control resets itself, the chip bar clears the secondary filters, and the
  empty state's action clears everything.
- The Filters panel anchors to the trigger's left edge and is capped at three field widths, so
  it stays on screen where the toolbar wraps.

### P4d

- A story's interaction test runs when the story opens, so a test that clicks Clear leaves
  "With value" empty and a test that unchecks leaves "Checked" unchecked. State-changing tests
  now live in their own stories (ClearButton, ToggleByLabel, RemoveAndClearAll) and the named
  states only assert.
- `SearchField` takes `disabled` explicitly: the field goes to the disabled surface and ink,
  the input refuses the pointer and the clear button is not rendered.
- `Select` keeps the native element and, where the browser supports `appearance: base-select`
  (Chromium 135 and later), renders the option list under the field from the tokens: overlay
  surface, default border, overlay shadow, and a check mark beside the chosen option. Other
  browsers keep their native picker. The rule sits under `@supports` so nothing else changes.
  An open-list story was tried and dropped: a synthetic click does not open the picker, so the
  story could not show its state.
- Table cells wrap at any point (`overflow-wrap: anywhere`) and every cell line has
  `min-width: 0`, so a fixed-layout column never lets a long value overlap the next one.
- `--border-hover` joins the tokens (the same grey the fields already used) so no component
  borrows `--text-muted` for a border. Exported to both Tailwind layers.
- The action column is sticky to the right edge of the table's scroll area, with its own
  background and a left edge, so the only way to open a row stays in view on the widths where
  the table scrolls sideways (between the stacked breakpoint and the table minimum). Pinning
  the Visitor column on the left was considered for the QA pass and rejected there in favour
  of a clickable row (D14 amendment).

### P4e

- `generateOne` takes an optional mid-sync mode. The chain is generated with confirmation
  ahead of the clock (pending: active 14 to 20 minutes after queueing; delayed: a delayed event
  at 15 minutes and active 30 to 60 minutes after that), then the whole journey slides so the
  decision sits 4 to 11 minutes before the clock for pending and 22 to 40 for delayed. Visits
  after the decision and events after the clock are dropped, so nothing is dated in the future
  and the decision still follows the last visit. The evaluation runs on the shifted visits, so
  the decision time is consistent with the events.
- The two are the first two click farms in the archetype mix, so the seed decides which IPs.
  Consuming different random numbers moved the rest of the filler slightly: the same 48 rows
  and status counts, one fewer Moderate confidence row (one remains, golden case 7).

### P4d, visit row

- `VisitTimelineItem` now carries `description` (source line), `summary` (engagement line),
  `changes` (signal tags), `contributed` (evidence sentences) and `record` (every field), plus
  `decisionVisit` and `defaultExpanded`. The old `meta` and `evidence` props are gone.
- `present.ts` computes changes against the previous visit (location, device identity, form,
  conversion, VPN, datacenter, automation, fingerprint) and attributes evidence sentences to
  visits through the evidence items' visit ids. The record names the device's first sighting and
  a location's previous value.
- Change tags were amber and red on the canvas; the build uses SignalTag tones because amber
  and red are Monitoring and Blocked (rule 2).

### P5

- Story fixtures now share the prototype's clock, 13 Sep 2026 12:00 UTC. The fixture day moved
  from 19 Feb to 12 Sep so the table rows keep distinct ages ("21 hours ago" to "3 days ago",
  computed with `formatRelative` against `NOW`); the two events that would have landed after the
  clock (an override and an organic return) moved to the morning of 13 Sep with their gaps
  recomputed with `formatLater`. Nothing in Storybook is dated after the clock.
- Link check, cookie-free client standing in for a private window: both roots, the table, a
  visitor deep link, a filtered and paged URL, an unknown visitor and an unknown path on the
  prototype all return 200 (the app renders its own not-found state); Storybook's root, a story
  URL, an iframe story and `index.json` return 200 and an unknown path returns 404. Every
  repo-relative path referenced from the README and docs exists.
