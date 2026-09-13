# Rationale

Written by the user from `decisions.md` and `ai-workflow.md`. Sections arrive as the work does;
the outline follows the build plan. Drafts by the agent are marked; the rest is in the user's words.

## Signal placement

The brief's behavioural signals exist at visit level, while the table represents each
visitor's cumulative journey. I kept identity, location, status, journey size and decision
timing in the overview and summarised only the most important evidence in each row, as
concise labels that can be compared across rows. Interaction level, bot probability, VPN,
email deliverability and conversion stay attached to the visit where they were recorded, so
the table stays scannable without removing the evidence needed to audit the decision.

I added network type, click velocity and device consistency because they make cumulative
patterns easier to read. Network type separates ordinary residential traffic from datacenter
infrastructure, click velocity gives repeated paid clicks their time context, and device
inconsistency can reveal automated identity changes. Exclusion sync is shown separately as an
enforcement state: it says whether the decision reached the advertising platform, not why the
decision was made.

## Table columns

I ordered the table around the customer's investigation sequence: identify the visitor,
understand the verdict, assess the size and paid portion of the journey, review the strongest
evidence, judge confidence and check recency. Visits and paid visits stay separate because
they are independently useful sorting dimensions. Decision time is attached to the verdict,
while detailed platform enforcement is deferred to the visitor view unless a sync problem
needs attention.

## Progressive disclosure in the visitor detail

I structured the visitor detail around progressive disclosure. The verdict, the primary
reasons, the tipping event and the confidence explanation stay immediately visible because
they answer why the visitor was blocked. Supporting signals, repeated visit metadata and raw
model values stay available for auditability but are collapsed by default. This lets a customer
understand the decision quickly without losing the evidence needed for a deeper investigation.

## Detail pattern

Agent draft, 13 Sep 2026, for the user to rewrite. Sources: D2, D17, `docs/explorations/drawer-options.html`,
`docs/explorations/detail-options.html`, `docs/explorations/visit-row-options.html`.

The question the product has to answer is why one visitor was blocked and whether that was
justified, so the detail view is the product and the table is how you reach it. I gave the
detail a route of its own rather than a drawer. I had four drawer information orders rendered
on one canvas with the same visitor in each, and the drawer lost on three counts: a long
evidence trail gets cramped beside the table, a shareable explanation needs a deep link, and
below a laptop width a drawer becomes a page anyway. A route gives the journey room, survives
the browser back button, and behaves the same at every width.

The page follows the order of the success criteria. The decision summary comes first because
it answers four of the six questions without scrolling: the status, when it was decided, the
one-sentence reason, and how sure the system is. The journey sits directly under it because
that is where the remaining questions live: which visits contributed, which of them cost
money, and whether the block took effect. The evidence list sits beside the journey so the
reader can move in either direction, from a visit to what it added or from a statement to the
visits it came from.

Inside the journey, a visit shows what changed, not everything it knows. I had three
hierarchies drawn for the visit row and chose the collapsed row from one with the expanded
body from another. Collapsed, a visit carries its source, one line of engagement and tags only
for what is new or unusual since the previous visit. Defaults such as "VPN: No" never appear,
so a run of visits that repeat the same pattern reads as exactly that. The visit the decision
followed is labelled as the decision visit and opens by default, listing what it added to the
evidence in the evidence list's own sentences and then the complete record with every field
present, so absence is never a blank. I rejected showing every field on every visit because
it put forty facts in front of the reader before they knew which visit mattered, and a
one-line ledger because it lost the narrative.

The decision and the exclusion becoming active are two events in the journey with two
timestamps, never one marker, because the mechanics have a gap between them and a paid click
can land in it. Golden case 6 exists to show that gap.

## Status vocabulary and confidence

Agent draft, 13 Sep 2026, for the user to rewrite. Sources: D3, D5, D8, rules 2 to 4.

The status words are Blocked, Monitoring, Not blocked and Not evaluated, with Manually
allowed as an override mark layered on top. I rejected "Allowed" on its own because it
conflates the system's finding with a person's decision, and a customer reading it cannot
tell which happened. "Not blocked" states what the system found without asserting that the
visitor is good. "Monitoring" says evaluation is still running rather than labelling someone
suspicious. I rejected "Watching" as too casual for an audit surface and "Suspicious" as a
verdict without evidence.

Colour follows the vocabulary and never works alone. Red is Blocked and destructive actions,
nothing else. Amber is Monitoring. Green is a successful sync or a positive outcome. A
suspicious-but-unblocked signal is never red, because a customer who sees red assumes a block
happened. Every status also carries a marker shape and a text label, and there is a greyscale
story in the system that proves the shapes alone still tell the statuses apart.

Confidence is three labels, not a number: High confidence, Moderate confidence, Conflicting
evidence. The mock decision model cannot produce a calibrated probability, and a percentage
would claim a precision the data does not have. What the reader needs is whether to trust the
conclusion or look closer, not whether it is 0.87 or 0.91. "Conflicting evidence" makes the
ambiguous case a first-class state rather than a smaller number, and it is the label golden
cases 3 and 5 carry: a VPN with real engagement and a valid form, and an organic return that
converts after a block. Neither is proof the system was wrong, and the label says so without
pretending the case is clean.

A Monitoring visitor always carries either Conflicting evidence or Insufficient evidence, so
no undecided row is blank, and the column is named Decision confidence because bot
probability is a different measure that belongs with the visit it was recorded on. Plain
language comes before any of this: the summary leads with a sentence a person would retell,
then ranked contributors, then raw signals on expansion. Scores support; they never lead.

The Monitoring note follows one template: what the system is watching, named as the signals
so far, and why it has not blocked, named as the missing or contradicting evidence. I rejected
a tipping count ("2 more clicks will block this visitor") because it exposes a rule that a
competitor, who is also an advertiser, could work around, and because it claims a determinism
the cumulative model does not have.

## Financial exposure

Agent draft, 13 Sep 2026, for the user to rewrite. Sources: D6, D7, rule 10.

Only paid visits cost the advertiser money, so the page shows paid visits before the block,
total visits and the paid versus organic mix, and it shows spend only where a cost per click
exists in the data and the calculation is on the page. The exposure line reads "$38.40 across
4 paid clicks before the decision", and the footnote under the evidence spells out the sum,
"$9.60 + $9.60 + $9.60 + $9.60 = $38.40. Nothing is estimated." Where a paid click landed after
the decision, the line says so and counts it separately. Where a platform did not report a
cost for every click, the line says the cost is not reported rather than filling the gap.

I rejected "protected spend since the block". Prevented traffic is not modelled, so the
number would be invented, and the brief's third red flag is data that does not reflect the
mechanics. The same rule governs the copy: nothing on the page says money was saved, and a
later conversion is never described as proof that an earlier block was wrong.

Spend is also why the table does not sort by it. Spend is derived from mock cost-per-click
values, so it is the least trustworthy number on the screen, and sorting the whole table by
it would put an invented figure in charge of what the customer sees first. The default sort is
recency, because that is how the screen is used ("what changed since I last looked") and it
depends on nothing assumed. Block time, visit count, paid clicks and confidence are the other
sorts, each independently useful.

## Filter design

Agent draft, 13 Sep 2026, for the user to rewrite. Sources: D16, D14, D9 amendment.

I kept search, date range and status visible because they are the most common ways to define
the investigation set. Lower-frequency dimensions, platform, traffic type, location, email
deliverability and conversion, are progressively disclosed within a Filters menu whose trigger
carries the count of what is applied. Active filters remain visible as removable chips under
the toolbar, balancing fast access with a compact interface, and the same arrangement produces
meaningful filtered-empty states: the empty state names how many filters are active and what
clearing them would show, and says plainly that an empty list does not mean the account is
clean.

Status is a single-select mode switch with an All option. Without All the customer cannot
easily return to the complete traffic. I dropped multi-select because it made the mode switch
harder to read for a benefit no investigation needed. Not evaluated stays as a fifth chip
because it is part of the vocabulary and golden case 8 is one; folding it into Not blocked
would have contradicted the vocabulary. There is no Manually allowed filter because the
override workflow is not modelled and no visitor in the data carries one.

The date range is a set of presets ending now, never a calendar, and a visitor is in range
when any of its visits is. I rejected filtering on last seen because it hides an old journey's
recent return, and on decision time because undecided visitors would vanish. A journey that
started before the window and came back inside it is exactly what cumulative blocking is
about.

Email deliverability and conversion are recorded per visit, so the visitor-level filters read
"Submitted an invalid email at least once" and "Converted at least once", with those exact
labels on the control and on the chip. The wording matters: a Converted slice is evidence of a
purchase and must never read as a list of false positives.

Every filter lives in the URL beside the sort and the page, so the table a customer was looking
at is the table they come back to from a visitor.

## The AI workflow

Agent draft, 13 Sep 2026, for the user to rewrite. Source: `docs/ai-workflow.md`.

I used an AI coding agent throughout, and the first thing it taught me was how not to use it.
Before any product contract existed I let it build a prototype end to end in a separate
repository. It made a drawer detail, a 220-row generator and 48 stories, and it made product
decisions as it went, which is the thing the brief says it is buying from me. I rejected that
build and changed the process: the agent proposes, I decide, nothing is decided silently.

The contract came first. I wrote the six questions a customer must answer within about thirty
seconds, and auditing the rejected build against them exposed two gaps that became
requirements: no timestamp on the decision, and no way to tell a borderline block from a
strong one. Then I answered the agent's open questions in writing, with what I rejected and
why, and that log became `decisions.md`. The rule for what counts as my decision is simple: I
can say, unprompted, why I made it and what I rejected. Where the agent proposed options and I
chose, the log says so. Implementation is the agent's and is recorded as such.

The agent's job was then to make the contract visible. It rendered four drawer orders on one
canvas so I could reject the drawer with evidence rather than taste. It converted the design
export to components with one script that proves no raw colour or pixel exists outside the
token files. It wrote the decision engine, eight hand-authored golden cases and a seeded
generator, with tests that keep the generated filler consistent with the contract. It built
the table and the detail, and on my review of the built table I changed things it had
implemented faithfully to an earlier decision: the "Why" column became four scannable labels
with the sentence moved to the detail, and Monitoring rows gained a label so none was blank.
Those changes are amendments in the log, dated, because the built thing taught me something
the written thing had not.

The agent also flagged its own calls. A time box it exceeded, a contrast failure inherited
from the export that it fixed by darkening the accent one step, a fixed reference clock so
relative times are deterministic, a table minimum width that scrolls at mid widths. I accepted
each in writing, and where one turned out to hide a problem, the action button scrolling off
screen, it came back as a fix with its own decision.

What I would keep: writing the contract before the code, one phase per branch with a pull
request I edit before merging, and a running log appended as work lands rather than
reconstructed at the end. What I would not repeat: letting a capable tool start before I had
said what the product was for.
