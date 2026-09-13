# ClickGuard Threat Monitoring Success Criteria

This document shows where the prototype answers each customer question and how that answer is tested. The main example is the clearly malicious visitor `185.220.101.34` from the running prototype.

## The test

A customer should be able to open a blocked visitor and answer the first six questions within about 30 seconds. The final two questions cover whether the block took effect and what happens if the decision seems wrong.

The detail page follows the same order. The decision summary answers the most urgent questions first. The journey and evidence sections then show how the system reached its decision.

The table gives a shorter version of this information before the visitor is opened. It shows the status, decision time, paid visits, key evidence, confidence, and last activity. The table helps the customer find a visitor. The detail page helps them review the decision.

## 1 Was this visitor blocked

The status badge and the headline in the decision summary answer this question.

The customer sees a red square marker beside `Blocked`, followed by a clear statement such as `Blocked after visit 4 of 5`. Status is never communicated by colour alone. Each status also has a label and a distinct marker.

The table uses the same badge in the Status column. The customer can also filter the table by status.

**How it is checked**

- Storybook includes every status variant and a greyscale example.
- Tests confirm that only the Blocked status uses the blocked colour and marker.

## 2 When was the decision made

The decision summary shows the full block timestamp. The journey repeats it as a separate `Block decision` event.

The journey places this event directly after the visit that triggered it. This lets the customer see what the system knew at the time.

The table shows a shorter version of the decision time beneath the status badge. `Last seen` remains a separate field because a visitor may return after the decision.

**How it is checked**

- Tests confirm the decision time for every hand-written case.
- Tests confirm that each decision event follows the correct visit.

## 3 Which visits contributed

The visitor journey answers this in two levels.

Each collapsed visit shows its number, time, source, and a short engagement summary. It only highlights details that changed or were unusual. For example, the first visit may show `Datacenter`, `Bot 93%`, and `No fingerprint`. Later visits do not repeat those labels unless something changes.

The visit that triggered the decision is labelled `Decision visit` and opens by default. It explains what that visit added to the existing pattern. Each evidence item also links back to the visit or visits it came from.

A visit after the block is shown as part of the journey, but it is not described as evidence that caused the earlier decision.

**How it is checked**

- Storybook includes a standard journey, a sync delay, a return after blocking, a single visit, and expanded visit evidence.
- Tests confirm that evidence is linked to the correct visit IDs.

## 4 Which evidence mattered

The decision summary gives the short answer first. It uses a sentence a customer could repeat, such as:

> The visitor returned through four paid ads in 41 minutes, showed no scroll or mouse movement, and connected through a datacenter network.

The evidence section then separates the reasons into three groups:

- Primary contributors
- Supporting context
- Evidence that weakens the conclusion

Raw measurements stay collapsed until the customer asks to see them. Missing data is labelled as unavailable rather than left blank.

The table shows up to four short evidence labels. Primary and conflicting evidence appear before supporting details, so an ambiguous case still looks ambiguous.

**How it is checked**

- Storybook covers primary, supporting, conflicting, and unavailable evidence.
- Tests confirm that every evidence item has a plain-language sentence and a short table label.

## 5 Which traffic cost the advertiser money

The decision summary shows paid exposure before the block. The journey marks each visit as paid, organic, direct, or referral.

When cost-per-click data exists, the page shows the recorded total, for example `$38.40 across 4 paid clicks before the decision`. The calculation is available as supporting detail. If a paid click arrives after the decision but before exclusion becomes active, it is counted separately.

If cost data is incomplete, the page says so. It never fills the gap with an estimate. The copy does not claim that ClickGuard saved or protected money because prevented traffic is not part of the mock data.

The table keeps Visits and Paid as separate columns. This makes both values easy to compare and sort.

**How it is checked**

- Tests confirm the totals for the main paid-traffic cases.
- Tests confirm that the interface does not use unsupported words such as `saved`, `prevented`, or `protected`.

## 6 Is the conclusion strong or ambiguous

The confidence label appears beside the status. The prototype uses clear labels instead of a percentage:

- High confidence
- Moderate confidence
- Conflicting evidence
- Insufficient evidence

The page also explains the label. A high-confidence case includes a strong automation signal. A conflicting case tells the customer which evidence points in different directions.

Monitoring visitors always show either `Conflicting evidence` or `Insufficient evidence`. No confidence cell is left blank. Bot probability remains a visit-level signal and is not presented as decision confidence.

**How it is checked**

- Storybook includes every confidence state.
- Tests confirm that each Monitoring visitor has a confidence label.

## 7 Did the block take effect

The enforcement section shows whether the advertising platform accepted the exclusion. The journey also records the sync as a separate event.

Decision time and sync time remain separate because the platform may take time to apply the exclusion. A paid click can arrive during that gap.

The page shows one row for each relevant platform. The possible states are Active, Pending, Delayed, and Failed. A failure states the consequence directly, for example:

> Meta Ads rejected the exclusion. This visitor may still see the advertiser's ads on that platform.

The table only shows enforcement when attention is needed. A short warning such as `Sync pending` or `Sync failed` appears beneath the status.

**How it is checked**

- Storybook includes active, pending, delayed, failed, and multi-platform states.
- Tests confirm that sync events use valid times and that paid clicks during a delay are counted correctly.

## 8 What can the customer do if the decision is wrong

The prototype does not let the customer change a verdict.

A responsible override would need permissions, an audit history, and clear behaviour across advertising platforms. The prototype does not model those parts, so an allow button would promise more than it can deliver.

The design still leaves room for this workflow. `Manually allowed` exists as an override state in Storybook, and the timeline can show an override without deleting the original decision. The mock visitor data does not use the state, and the table does not offer an override filter.

## How this was checked

- The examples were reviewed in the running prototype on 13 September 2026.
- Storybook includes the states named in this document and runs accessibility checks.
- Data and presentation tests cover the hand-written cases and the supporting generated data.
- The 30-second target has not been tested with customers. It remains a design goal. The verdict, decision time, main reason, and confidence appear first. The journey, paid exposure, and sync state follow directly below.

