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

Amended 13 Sep 2026, on review of the built table: a Monitoring visitor always carries one of
two labels, "Conflicting evidence" when the signals disagree and "Insufficient evidence"
otherwise, so no Monitoring row is ever blank. The three decision labels are unchanged. The
column is named "Decision confidence" because bot probability is a different measure and
belongs with the visit it was recorded on.

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
Amended 13 Sep 2026: no visitor in the prototype's data carries an override, and the table
offers no "Manually allowed" filter, because the workflow behind it is not modelled. The
badge and the type remain for when it is.

## D10. Invented signals
Added, because each makes a blocking decision easier to understand: network type (residential,
mobile, corporate, datacenter), click velocity (paid clicks over a stated period), device
consistency (whether one IP rapidly changes device or browser identity), and exclusion sync state
per advertising platform (pending, active, delayed, failed). All four are marked as invented for
this exercise in the README.

## D10a. Signals in the table are concise labels; the sentence lives in the detail
Decided 13 Sep 2026, on review of the built table: the overview keeps identity, location,
status, journey size and decision timing, and shows each visitor's key evidence as up to four
scannable labels ("4 paid clicks / 41 min", "No interaction", "Datacenter", "Bot: 96%"). The
full plain-language sentence, the per-visit interaction level, bot probability, VPN state,
email deliverability and conversion live in the visitor detail, attached to the visit they were
recorded on. Conversion is evidence in its own right, like deliverability. Exclusion sync
stays beside the status as enforcement information and is never listed as evidence.
Rejected: a full sentence per row (informative, but impossible to compare across rows) and
another full-width column (the table is already dense).

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

## D13. The shell has a sidebar, and the sidebar is a component
Decided: `SidebarNav` from the export ships in the system with active, collapsed and badged
states; only Threat Monitoring is a live destination.
Why: the table is one surface in a product, and the shell places it where it lives in
ClickGuard's real information architecture, which was sampled from the product rather than
invented. It is also a system proof the table cannot give: navigation must use the accent for
"you are here" without competing with status colour.
Rejected: a bare page (reads as a demo, not a feature) and a sidebar as page chrome with no
states (time spent with nothing for the system to show).
Cost: about 25 minutes, and a hard rule that no other destination gets built.
Amended 13 Sep 2026: the sidebar's footer carries the workspace row from the product's own
shell (an initials avatar, "Latte's workspace", latte@clickguard.com). Identification only; it
opens nothing, because no account workflow is modelled.

## D14. Table columns follow the investigation sequence
Decided 13 Sep 2026, on review of the built table: Visitor, Status, Visits, Paid, Key
evidence, Decision confidence, Last seen, then the action that opens the journey. The reading
order is who, what was decided, how much behaviour accumulated, why, how certain, how recent.
Visits and paid visits stay separate because they are independently useful sorts. Decision
time sits inside the Status cell under the badge. Platform enforcement stays out of the table
unless there is an exception (sync pending, delayed or failed), which appears as a flagged line
under the decision time; the per-platform picture lives in the visitor detail.
Rejected: a Decided column (timing belongs with the verdict) and listing every platform in the
Status cell (it would mix the verdict, its time and enforcement in one cell).

## D15. The table is paginated, twenty rows a page
Decided 13 Sep 2026: pages of 20, because that fits a laptop screen at the table's row height
and gives three pages on the prototype's data, so the control is exercised. The page lives in
the URL beside the filters and sort; any change to what is listed or how it is ordered returns
to page one. Sorting happens before the page slice, so a page is a window onto the whole
ordered list. The summary reads "1 to 20 of 48 visitors".
Rejected: rendering every row (scannable at 48, not how the product behaves) and virtualised
scrolling (hides the size of the list and breaks find-in-page).

## D16. The toolbar: three filters visible, the rest disclosed
Decided 13 Sep 2026, before the P4c build. Search, date range and status stay visible because
they are the most common ways to define the investigation set. Lower-frequency dimensions,
paid or unpaid traffic, advertising platform, country, decision confidence, email
deliverability and conversion, are progressively disclosed inside a Filters menu whose
trigger carries the count of what is applied. Applied secondary filters stay visible as
removable chips under the toolbar with a Clear all, balancing fast access with a compact
interface. It also produces meaningful filtered-empty states.
- Status is a single-select mode switch, and All is a real option. Without All the customer
  cannot easily return to the complete traffic. Multi-select was dropped because it made the
  mode switch harder to read for a benefit no investigation needed.
- Not evaluated stays as a fifth status chip. It is part of the D3 vocabulary and golden case 8
  is one; folding it into Not blocked would contradict D3.
- Date range is a set of presets ending now (All time, last 24 hours, 7 days, 30 days), never a
  calendar. A visitor is in range when any visit falls in it, because a journey that started
  before the window and returned inside it is exactly what cumulative blocking is about.
  Rejected: filtering on last seen (hides an old journey's recent return) and on decision time
  (undecided visitors would vanish).
- Email deliverability and conversion are per visit, so the visitor-level filters read
  "Submitted an invalid email at least once" and "Converted at least once", with those exact
  labels on the control and on the chip, so a Converted slice never reads as proof of a false
  positive (rule 10).
Rejected: every dimension always visible (the table drowned under two rows of chips) and a
single Filters menu for everything (search and date range buried; status stops being a fast,
understandable mode switch).

## D17. A visit in the journey shows what changed; the record is one disclosure away
Decided 13 Sep 2026, from `docs/explorations/visit-row-options.html`: option 1's collapsed row
with option 2's expanded body. Collapsed, a visit shows its label and time, where it came
from, one line of engagement (time on page, scroll, outcome) and tags only for what changed
since the previous visit or is unusual: a new location, a new device identity, an
undeliverable or valid email, a conversion, a VPN, a datacenter, an automation signal, a
missing fingerprint. Defaults such as "VPN: No" and "Form: Not submitted" never appear
collapsed. Expanded, the visit lists what it added to the evidence, in the evidence list's own
sentences, then the complete record with every field present so absence is never blank. The
visit the decision followed is named "Decision visit" and opened by default; the block marker
after it carries the weight, so the row itself carries no extra rule.
Tags use the SignalTag tones, never a status colour (rule 2): the decisive one is the strong
primary style, mitigating ones the info tone.
Rejected: every field on every visit (forty facts before the reader knows which visit
mattered), a one-line ledger (loses the narrative line), and colouring change tags amber or
red (those colours are Monitoring and Blocked).
The page-level hierarchy around the journey is a separate decision, still open.

## Out of scope
Dashboard screen, manual and bulk overrides (D9), a calendar date picker (D16), dark theme,
loading and error states for data that is local and synchronous.

## Golden cases (hand-authored before any generated rows)
1. Clearly malicious: datacenter IP, repeated paid clicks minutes apart, no engagement, high automation likelihood.
2. Clearly legitimate: residential, real engagement, valid form, conversion.
3. Ambiguous VPN: VPN present, strong engagement, valid form. Monitoring with conflicting evidence.
4. Monitoring: suspicious velocity, too little history to block.
5. Post-block organic return that converts: conflicting evidence, not proof of a false positive.
6. Sync delay: paid click after the decision, before the exclusion became active.
7. Location and device inconsistency with weak engagement.
8. Single visit: insufficient history, no strong signal.
