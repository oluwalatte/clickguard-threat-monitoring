# Success criteria: where each question is answered

Agent draft, 13 Sep 2026, for the user to rewrite. The eight questions are the ones set in
`decisions.md` before any code. This file records, for each, where the answer sits on the
page, what the reader sees there, and how the build proves it. The worked example is golden
case 1, the clearly malicious visitor `185.220.101.34`, read from the running prototype.

## The test

A customer opens one blocked visitor and, within about 30 seconds, can answer the six
questions below. Two more follow, because the brief's a-ha is "I'll leave it on", not just
"I understand".

The detail page is built in the order the questions are asked. The decision summary leads
and answers 1, 2, 4 and 6 without scrolling. The journey sits directly under it, beside the
evidence list, and answers 3, 5 and 7. Nothing sits between them.

The table answers a scanning version of the same questions before the page is opened:
Status with the decision time under the badge, Paid, Key evidence as up to four labels, and
Decision confidence (D14). The table is for finding the visitor; the detail is for auditing
the decision. A row opens on click anywhere in it, and the action button at its right edge is
the keyboard route.

## 1. Was this visitor blocked?

Answered by the status badge at the top left of the decision summary, and by the headline
under it.

What the reader sees: a red square marker and the word "Blocked", then "Blocked after
visit 4 of 5". The vocabulary is fixed by D3: Blocked, Monitoring, Not blocked, Not
evaluated, and Manually allowed as an override mark. The marker shape changes with the
status, so the answer does not depend on colour (rule 3). Red appears only here and on
destructive actions (rule 2).

In the table: the same badge in the Status column, and a status filter that shows one
status at a time with a count on each chip (D16).

Proof: StatusBadge stories including "Greyscale (shapes carry meaning)"; DecisionSummary
stories for every status; the unit test that maps every data status onto a badge tone with
red for blocked only.

## 2. When was the decision made?

Answered by the "Block decision made" field in the decision summary, and repeated as the
"Block decision" event in the journey.

What the reader sees: "11 Sep 2026, 14:53:20 UTC", a complete timestamp because this is the
auditable field (rule 6). In the journey the same moment appears as its own event, "at the
same time" as the visit it followed, so the reader can see what the system had seen when it
decided (D11).

In the table: the short form of the same timestamp under the badge in the Status cell (D14).

Proof: the golden case tests pin the decision time of every hand-authored case; the D11 test
checks the decision event follows the visit it was made after.

## 3. Which visits contributed?

Answered by the journey, in two layers (D17).

Collapsed, every visit shows its label, time, source, one line of engagement and tags only for
what changed or is unusual. Visit 1 of the example carries "Datacenter", "Bot: 93%" and "No
fingerprint"; visits 2 and 3 carry nothing new, which is itself the answer: nothing changed,
the pattern repeated.

The visit the decision followed is labelled "Decision visit" and opens by default. Under
"What this visit added to the evidence" it lists the evidence sentences in the evidence
list's own words: "4 paid clicks in 41 minutes", "No scroll and under 6 seconds on the page
across 4 of 4 visits", and so on. Visit 5, a direct return after the block, shows plainly that
it added nothing.

Each evidence item also says which visits it came from ("From 4 visits", or "From visit 3,
14:41:02" with a link to that visit), so the reader can move from evidence to visit as well
as from visit to evidence.

Proof: VisitTimeline stories for block then sync, sync delay with a paid click, organic return
after block, single visit and expanded evidence; the presenter test that attributes evidence
sentences to visits through their ids.

## 4. Which evidence mattered?

Answered by the explanation sentence in the decision summary first, then by the evidence list.

What the reader sees first: "Returned through four paid ads in 41 minutes and showed no
scroll or mouse movement on any visit, from a datacenter network." A sentence a person would
retell, before any score (D4, rule 4).

Then the evidence list, ranked: two "Primary contributor" items (the click pattern and the
absent engagement), four "Supporting context" items (automation likelihood, no mouse
movement, datacenter network, same keyword), and one "Unavailable" item (no fingerprint
because JavaScript was blocked). The raw measurement behind a statement is one disclosure
away ("Show raw value"). Mitigating evidence, where it exists, is shown in the info tone and
never hidden (golden cases 3 and 5).

In the table: the Key evidence column, up to four scannable labels per row, primary first,
then mitigating, then supporting, so an ambiguous row reads as ambiguous (D10a).

Proof: EvidenceItem stories for every kind including missing; EvidenceList "Contradictory
stays visible"; the data tests that every evidence item carries a plain sentence and most a
scannable label.

## 5. Which traffic cost the advertiser money?

Answered by the "Paid exposure" field in the decision summary, by the paid and organic
markers in the journey, and by the calculation in the evidence footnote.

What the reader sees: "$38.40 across 4 paid clicks before the decision". Where a paid click
landed after the decision, the line says so: "$16.80 across 3 paid clicks before the
decision, plus $5.60 for 1 after it" (golden case 6). Where a platform did not report a cost,
the line says "cost not reported for every click" rather than guessing. The footnote shows
the sum: "$9.60 + $9.60 + $9.60 + $9.60 = $38.40. Nothing is estimated." (D6, rule 10).

In the journey, paid visits carry the accent tone and the platform, campaign and cost per
click in their record; organic and direct visits carry the neutral tone. In the table, the
Paid column counts paid visits beside total Visits, and the Paid traffic filter slices on it.

Proof: the exposure tests pin the line and the footnote for golden cases 1, 2 and 6 and check
that no copy uses "saved", "prevented" or "protected".

## 6. Is the conclusion strong or ambiguous?

Answered by the confidence label beside the status badge, and by the first sentence of the
evidence footnote.

What the reader sees: "High confidence", one of three decision labels (High, Moderate,
Conflicting evidence) and never a percentage (D5). The footnote says what the label means:
"High confidence: an automation signal sits behind the pattern." For golden case 5 the label
reads "Conflicting evidence" and the footnote says to read the journey before trusting the
conclusion. A Monitoring visitor always carries "Conflicting evidence" or "Insufficient
evidence", so no undecided row is blank (D5, amended).

In the table: the Decision confidence column, sortable, with a filter in the Filters menu.

Proof: DecisionSummary stories for every confidence label; the data tests that reach the
authored confidence on every golden case and that Monitoring rows always carry a label.

## 7. Did the block work?

Answered by the exclusion sync block in the decision summary and by the sync events in the
journey.

What the reader sees: "Exclusion active. The exclusion is active on every platform this
visitor used. No paid clicks since." with one row per platform: "Google Ads, Active, since 11
Sep 2026, 15:02:10 UTC, 9 minutes after the decision". The decision and the exclusion
becoming active are two events with two timestamps (D11), and the gap between them is real:
golden case 6 shows a paid click landing in it, and the exposure line counts it.

Where the block has not worked yet, the block says so in amber: "Exclusion sync pending" with
"queued 7 minutes ago", or "Delayed" with "not confirmed 25 minutes after it was queued".
Where it failed, in red: "Meta Ads rejected the exclusion. This visitor can still reach the
site through that platform." Two generated visitors are caught mid-sync so both amber states
are visible in the table without opening a golden case (P4e).

In the table: enforcement appears only as an exception, a flagged line under the decision
time reading "Sync pending", "Sync delayed" or "Sync failed" (D14).

Proof: DecisionSummary stories for active, pending with a paid click since, failed and two
platforms; SyncFlag stories; the data tests that the generated set includes failed, delayed
and pending at the clock and that no event is dated after it.

## 8. What can I do if it's wrong?

Not answered by the prototype, by decision (D9). No control on the page changes a verdict,
because a responsible override needs permissions, an audit history and platform sync
behaviour that the prototype does not model, and a superficial button would claim otherwise.

What the prototype does instead: it makes the case for the decision auditable enough that
the customer can judge it, and it keeps room for the answer. The status vocabulary includes
Manually allowed, the timeline has an override event, and the decision summary can show an
override on top of the original decision without erasing it. Stories exist for all three, so
the shape of the eventual answer is on record. No generated visitor carries an override, and
the table offers no filter for one, because the workflow behind it is not modelled.

## How this was checked

- The example text above was read from the running prototype on 13 Sep 2026, not from the
  fixtures. The two mid-sync visitors and golden case 6 were opened for criterion 7.
- Every component named here has a Storybook story per state, run with accessibility checks
  as errors. The data and presenter tests referenced are in `src/data` and `src/app`.
- The 30-second claim has not been timed with a customer. It is a design target, met on the
  page structure: 1, 2, 4 and 6 are above the fold in the summary, 3, 5 and 7 are one scroll
  below in the journey and evidence.

## Still open

- The page-level hierarchy around the journey (D17's last line) is undecided. It does not
  change where any criterion is answered.
