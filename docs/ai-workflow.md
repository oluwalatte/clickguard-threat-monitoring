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
| P2 stories | | |
| P3 data | | |
| P4 prototype | | |
| P5 rationale | | |

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
