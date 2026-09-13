# Handoff: how to build this

Read `docs/decisions.md` first. It is the product contract. Then `CLAUDE.md`.

## What is where
- `_import/design-system/` the Claude Design export. Tokens (`tokens/`, `styles.css`), ten
  components (`components/*/*.jsx` + `.d.ts` + `.prompt.md`), guideline cards, and a UI kit with
  three screens and fixtures. The readme inside explains its sources and rules.
- `_import/build-plan.md` the long-form plan this handoff compresses.
- `_import/infra/` reusable pieces from the previous build: Storybook 10 config, Vite config with a
  node unit-test project beside Storybook's browser project, tsconfigs, `check-tokens.mjs`, the CI
  workflow, and a seeded traffic generator with ten mechanics tests (to adapt to the new model).
- `docs/explorations/drawer-options.html` evidence for D2's rejected option.
- `_import/` is gitignored. Move what is needed into `src/`; never commit the raw export.

## Mapping the export into the repo
| Export | Repo |
| --- | --- |
| `tokens/*.css`, `styles.css` | `src/ui/tokens/` (adopt names as-is) and `src/ui/styles.css` |
| `tokens/tailwind-theme.css`, `tailwind.theme.js` | `src/ui/tokens/` as export layers, not imported by the app |
| `components/<group>/<Name>.jsx` + `.d.ts` | `src/ui/<Name>/<Name>.tsx` + `<Name>.module.css` + `<Name>.stories.tsx` |
| `components/<group>/<Name>.prompt.md` | the story brief: one story per variant it lists |
| `components/icon/Icon.jsx` | `src/ui/Icon/Icon.tsx` over `lucide-react`, not the CDN |
| `ui_kits/threat_monitoring/*Screen.jsx`, `AppShell.jsx` | composition references for `src/app/` |
| `ui_kits/threat_monitoring/fixtures.jsx` | shape reference only; real data comes from the generator |
| `guidelines/*.card.html` | a Foundations story, or `docs/explorations/` |
| `DashboardScreen.jsx` | not shipped |

## Phases (about six hours)
- **P0 Product contract.** Done: `docs/decisions.md`. First commit.
- **P1 Scaffold and install the system (45 min).** Vite + React + TS + Router; copy and adapt the
  infra; tokens in; components converted to TSX + CSS modules with raw pixels tokenised; Storybook
  wired to `styles.css`; deploy both targets once (two new Vercel projects).
- **P2 Stories (60 min).** Every component, variants from the prompt files. Meaningful states, not count.
- **P3 Data (75 min).** Types per the plan (decision with confidence and contributors; exclusion sync
  events including the delay case); eight golden cases hand-authored; a seeded factory fills to
  30 to 60 visitors; reconciliation tests.
- **P4 Prototype (90 min).** Table route with search, status and traffic filters, sort by recency
  and the optional keys; visitor route composed from DecisionSummary, VisitTimeline and
  EvidenceList; sidebar shell; empty and edge states; keyboard.
- **P5 Docs, QA, deploy (60 min).** `docs/success-criteria.md`, rationale and `docs/ai-workflow.md`
  in the user's words, README with both URLs, private-window check of every link.

## Process
- One branch and one PR per phase. The agent opens the PR; the user edits the description and merges.
- No product decision is made silently. If a choice is not in `decisions.md`, propose options and wait.
- Before any commit: typecheck, `check:tokens`, tests, app build, Storybook build.
- Commit messages describe the product outcome. No em dashes anywhere.
- `docs/ai-workflow.md` is appended as work happens: stage, what the agent produced, what the user directed or overrode.
- The rationale is written by the user from `decisions.md` and `ai-workflow.md`. The agent may draft; the user rewrites.

## Never commit
The export's `uploads/` (ClickGuard's own screenshots; already excluded), anything in `_import/`,
`.vercel/`, secrets, build output.
