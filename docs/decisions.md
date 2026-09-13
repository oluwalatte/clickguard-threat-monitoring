# Decisions: the product contract

Written before any code, from my answers to the open questions. Each decision names what was
rejected and why, because the rationale is assembled from this file. The exit test: someone can
describe the product model from this log without seeing the interface.

## The product model

1. A visitor is identified by IP address.
2. The same visitor may return many times; each return is a visit with its own source and signals.
3. Only some visits come from paid advertising, and only those cost the advertiser money.
4. ClickGuard evaluates evidence cumulatively across the whole journey.
5. At a particular visit the system may decide to block, and the IP is then sent to the advertising
   platforms' exclusion lists. The decision and the exclusion becoming active are two events, and
   there can be a gap between them in which a paid click still gets through.

The product is an explanation of an automated decision, not a traffic dashboard. The customer
question is: why did ClickGuard block this visitor, and was that justified?

## Success criteria

A customer opens one blocked visitor and, within about 30 seconds, can answer:

1. Was this visitor blocked?
2. When was the decision made?
3. Which visits contributed?
4. Which evidence mattered?
5. Which traffic cost the advertiser money?
6. Is the conclusion strong or ambiguous?

And two more, because the brief's a-ha is "I'll leave it on," not just "I understand":

7. Did the block work? (the exclusion is active; no paid clicks since)
8. What can I do if it's wrong? (out of scope for the prototype; see D9)

Criteria 1, 2, 4 and 6 are answered by the decision summary, so it leads the detail page. Criteria
3, 5 and 7 are answered by the journey, so it sits directly under it with nothing between.

## D1. The row is a visitor, not a visit
Decided: one table row per IP; visits live in the detail view.
Rejected: a visit-level table. It implies visits are judged independently, which contradicts
cumulative blocking.

## D2. Detail is a dedicated route
Decided: `/threat-monitoring` and `/threat-monitoring/:visitorId`.
Rejected: a drawer. I explored four drawer information orders on a previous build (see
`docs/explorations/drawer-options.html`); a drawer keeps the table in view but long evidence trails
get cramped, deep-linking is awkward, and narrow screens force it into a page anyway. A route gives
the journey room, supports sharing and browser back, and behaves the same at every width.

## D3. Status vocabulary
Decided: Blocked, Monitoring, Not blocked, plus Manually allowed as an override mark and Not
evaluated for insufficient history.
Rejected: "Allowed" on its own. It conflates the system's judgement with a person's override, and a
customer reading "Allowed" cannot tell which happened. "Not blocked" states the system's finding
without asserting the visitor is good. "Monitoring" says evaluation is still running rather than
labelling a visitor suspicious. Manually allowed is an override layered on top, shown in the info
tone with a hollow-ring marker, never in a status colour.
Rejected: "Watching" (too casual for an audit surface) and "Suspicious" (a verdict without evidence).

## D4. Plain-language evidence before scores
Decided: every verdict leads with a sentence a person would retell ("Returned through four paid ads
in 41 minutes and showed no scroll or mouse movement on any visit"), then ranked contributors, then
raw signals on expansion.
Rejected: a risk score as the explanation. A number asks for trust; the brief's whole problem is
that the customer already has to take our word for it.

## D5. Confidence as three labels
Decided: High confidence, Moderate confidence, Conflicting evidence (and no label when not blocked).
Rejected: a percentage. The mock decision model cannot produce a calibrated probability, and showing
one would claim precision the data does not have. Labels are what success criterion 6 needs: a
reader has to know whether to trust the conclusion or look closer, not whether it is 0.87 or 0.91.
"Conflicting evidence" makes the ambiguous case a first-class state instead of a smaller number.

## D6. Financial exposure
Decided: show paid visits before the block, total visits, and the paid versus organic mix. Show
spend only where cost-per-click exists in the data and the calculation is visible on the page (sum
of CPC on paid visits before the decision).
Rejected: "protected spend since the block." Prevented traffic is not modelled, so the number would
be invented, and the brief's third red flag is data that does not reflect the mechanics.

## D7. Default sort is recency
Decided: most recently active first, with block time, visit count, paid clicks and confidence as
optional sorts.
Rejected: spend as the default. Spend is derived from mock CPC values, so it is the least
trustworthy number on the screen, and sorting the whole table by it would put an invented figure in
charge of what the customer sees first. Recency reflects how the screen is used ("what changed since
I last looked") and depends on nothing assumed.

## D8. The Monitoring note
Decided: a Monitoring visitor shows two things and only two: what the system is watching, named as
the signals present so far, and why it has not blocked, named as the missing or contradicting
evidence. Template: "Monitoring: {signals so far}. Not blocked because {what is missing or conflicts}."
Example: "Monitoring: 3 paid visits in 12 minutes with shallow engagement. Not blocked because there
is no automation signal and the history is three visits long."
Rejected: a tipping count ("2 more clicks will block this visitor"). It exposes a rule that a
competitor, who is also an advertiser, could work around, and it claims a determinism the cumulative
model does not have.

## D9. No manual or bulk overrides in the core prototype
I considered manual and bulk overrides, but excluded them from the core prototype because the
brief's primary job is explaining cumulative blocking. Bulk intervention would bypass the
visitor-level investigation, while a responsible manual override requires permissions, audit
history and advertising-platform sync behaviour beyond the scope of this prototype. Without
modelling those properly, the action would be superficial.
The data model keeps room for a manual override so the status vocabulary (D3) is complete.

## D10. Invented signals
Added, because each makes a blocking decision easier to understand: network type (residential,
mobile, corporate, datacenter), click velocity (paid clicks over a stated period), device
consistency (whether one IP rapidly changes device or browser identity), and exclusion sync state
per advertising platform (pending, active, delayed, failed). All four are marked as invented for
this exercise in the README.

## D11. The decision event and the sync event are separate
Decided: the journey shows the block decision after the visit it followed, then the exclusion sync
as its own event when it becomes active. One golden case has a paid click land between the two.
Rejected: a single "blocked" marker. It hides the delay the mechanics describe and conflates when we
decided with when the platform acted.

## D12. Stack
Decided: Vite, React, TypeScript, React Router, CSS modules consuming shared CSS-variable tokens,
Storybook on the Vite builder, Vitest for data reconciliation tests.
The design system comes from the Claude Design export: its tokens are adopted as-is; its components
are converted from JSX with inline styles to TSX with CSS modules so hover and focus states live in
CSS, styles are not repeated as objects across components, and one script can prove no raw values
exist outside the token files. Its Tailwind v4 theme file is kept as an export layer and never
imported with preflight.

## Out of scope
Dashboard screen, manual and bulk overrides (D9), URL-persisted filters unless time allows, dark
theme, loading and error states for data that is local and synchronous.

## Golden cases (hand-authored before any generated rows)
1. Clearly malicious: datacenter IP, repeated paid clicks minutes apart, no engagement, high automation likelihood.
2. Clearly legitimate: residential, real engagement, valid form, conversion.
3. Ambiguous VPN: VPN present, strong engagement, valid form. Monitoring with conflicting evidence.
4. Monitoring: suspicious velocity, too little history to block.
5. Post-block organic return that converts: conflicting evidence, not proof of a false positive.
6. Sync delay: paid click after the decision, before the exclusion became active.
7. Location and device inconsistency with weak engagement.
8. Single visit: insufficient history, no strong signal.
