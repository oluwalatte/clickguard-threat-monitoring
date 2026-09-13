# Final QA record

Walked on 13 September 2026 against the current main branch (commit 39cd134 and the P5 docs on
top of it), in Chromium, at 1440px and at a 375px phone width. Mechanical checks were scripted
against the rendered page; the rest were looked at. Every item in the build plan's final checklist
is listed with its result and where the evidence is.

## Product integrity

| Check | Result | Evidence |
| --- | --- | --- |
| One row represents one visitor, an IP | Pass | 20 rows on a page, 20 distinct IPs; `id === ip` is asserted for every visitor in `data.test.ts` |
| Repeat visits are visible in chronological order | Pass | Every journey is asserted strictly increasing in `data.test.ts`; golden case 1 renders visits 1 to 4, the decision, the sync, then a direct return |
| Paid, organic, direct and referral visits are distinguishable | Pass | Each row carries its type label and a typed marker; golden case 5 shows paid then organic, golden case 1 shows a direct return |
| The block event appears after the correct visit | Pass | Golden case 1 renders `paid, paid, paid, paid, block, sync-pending, sync-active, direct`; the decision visit is labelled and open |
| Block time and exclusion sync time are not conflated | Pass | The summary shows the block time as its own field and the platform's state and time in the sync block; the journey lists them as separate events (D11) |
| Primary evidence is in plain language | Pass | First evidence item on golden case 1: "4 paid clicks in 41 minutes"; tests reject "score", "threshold" and "probability" in every summary |
| Contradictory evidence is visible in ambiguous cases | Pass | Golden case 3 lists two mitigating items under "Conflicting evidence"; the table keeps a mitigating tag in the row (D10a) |
| No unsupported savings claim | Pass | The rendered table and detail contain no "saved", "prevented" or "protected"; a test rejects them in the exposure copy (D6) |

## Interaction

| Check | Result | Evidence |
| --- | --- | --- |
| Search changes visible results | Pass | `?q=185.220` lists one row, 185.220.101.34 |
| Status filtering works | Pass | `?status=blocked` lists 13 rows, every badge Blocked |
| Sorting works on real values | Pass | Visits descending gives 7, 7, 7, 7, 6 with the header marked `aria-sort="descending"` |
| Filtered-empty state explains and offers reset | Pass | "2 filters are active. Clearing them would show all 48 visitors. An empty list here does not mean the account is clean." with a Clear filters button |
| Table state is preserved after viewing a visitor | Pass | From `?status=blocked&sort=totalVisits&dir=desc&page=1`, opening a visitor and pressing the back button returns to exactly that URL |
| Every golden case row opens | Pass | All eight golden addresses render their detail with the IP as the title; not-blocked and not-evaluated cases render their honest headlines |

## Accessibility and layout

| Check | Result | Evidence |
| --- | --- | --- |
| All interactive elements are reachable by keyboard | Pass | No non-native clickables on the page; 48 focusable native controls on the table route; Tab reaches the Filters button, the chips, the sortable headers and the row action "View visitor: 41.190.3.77, Lagos, Nigeria" |
| Focus is visible | Pass | The focused control matches `:focus-visible` with a 2px solid indigo outline from `base.css`; hover and focus stories exist for every interactive component |
| Status has text or an icon in addition to colour | Pass | Every badge on the page has a marker shape and a text label; the greyscale story shows the shapes alone |
| Table content remains usable on narrow screens | Pass | At 375px the table stacks into label and value rows and the rail collapses to icons; no horizontal overflow on the detail |
| Long IP, location and evidence content do not break layout | Pass | The Long content story renders an IPv6 address, a long location and seven signal tags; the table's cells wrap and the action column stays pinned |
| Dates and tabular numbers are consistently formatted | Pass | No ISO strings anywhere on the rendered pages; all timestamps come from `format.ts`; `tabular-nums` is set on `body` |
| Loading, error, empty and missing-data states are readable | Pass | Loading and error bodies are stories only, because local data cannot produce them (out of scope in `decisions.md`); filtered-empty and the unknown-address state are reachable and explain themselves; missing costs read "cost not reported" |

## Design system

| Check | Result | Evidence |
| --- | --- | --- |
| App and Storybook import the same component source | Pass | `src/app` imports from `@clickguard/ui` only; Storybook's stories glob is `packages/ui/src`; nothing in `src/` reaches into a component folder |
| Semantic tokens are used for repeated visual decisions | Pass | `check:tokens` reports zero raw values and zero reviewed exceptions |
| Domain components have meaningful stories and variants | Pass | 124 stories across 20 components, run in Chromium with axe violations as failures |
| No duplicate Storybook-only implementations | Pass | `src/app` holds composition only (shell, routes, page layout, adapters); no component is defined outside the package |
| Component API names reflect product semantics | Pass | Status kinds, evidence kinds, sync states, decision visit, key signals and confidence labels follow `decisions.md` |

## Delivery

| Check | Result | Evidence |
| --- | --- | --- |
| Prototype URL works without authentication | Pass | 200 from an unauthenticated request on the root and on a deep link |
| Storybook URL works without authentication | Pass | 200 on the root and on a story iframe; the page title is Storybook's |
| Repository is accessible to reviewers | Pass | The GitHub repository is public |
| README contains run and build commands | Pass | "Working on it" and "Deploying" sections |
| Rationale is included | Pass | `docs/rationale.md` in the user's words; `docs/success-criteria.md` maps every question to the page |
| No secrets or local environment files committed | Pass | No `.env`, `.vercel/`, build output or `node_modules` in the tracked files |
| App, tests and Storybook production builds pass | Pass | typecheck, `check:tokens`, 113 unit tests, app build and Storybook build; CI green on every merge |
| Submission email includes the links | Not the repository's | For the user |

## Not tested

The 30-second target has not been tested with customers. It remains a design goal.
