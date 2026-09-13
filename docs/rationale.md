# ClickGuard Threat Monitoring Rationale

ClickGuard blocks invalid traffic across a visitor's full journey. The customer does not see that decision happen, so the interface has to explain it clearly afterward. I designed the prototype around one question: why was this visitor blocked, and was the decision justified?

The table helps the customer find a visitor. The detail page shows the journey, the evidence, and the point where ClickGuard made its decision.

## Table and signal placement

Each table row represents one visitor, identified by IP address. This matches the way blocking works. Individual visits sit inside the visitor's journey.

The columns follow the customer's investigation order. They show the visitor, status, total visits, paid visits, key evidence, decision confidence, and last activity. Visits and Paid remain separate because both values are useful and can be sorted independently.

Decision time sits beneath the status because it belongs to the verdict. Last seen remains separate because a visitor may return after the decision. Platform enforcement stays in the detail page unless a sync problem needs attention. In that case, the table shows a short warning beneath the status.

Detailed interaction, bot probability, VPN use, email deliverability, and conversion data remain attached to the visit where they were recorded. The table only shows short evidence labels. This keeps it easy to scan and avoids hiding differences between visits behind one visitor-level value.

I added network type, click velocity, and device consistency because they make suspicious patterns easier to understand. Network type separates residential traffic from datacenter infrastructure. Click velocity gives repeated paid clicks a clear time frame. Device consistency shows when one IP changes device or browser identity unusually quickly. Exclusion sync is shown separately because it describes enforcement, not the reason for the decision.

## Visitor detail and progressive disclosure

I used a dedicated detail page instead of a drawer. A long journey needs more room than a drawer provides. A page also has a stable URL, works with the browser back button, and behaves consistently on smaller screens.

The first section shows the verdict, the main reasons, the visit that triggered the decision, and an explanation of confidence. The customer can understand the decision before reading the full journey.

The evidence section separates primary contributors, supporting context, and evidence that weakens the conclusion. This makes moderate and conflicting cases easier to judge. Raw measurements remain available, but they are collapsed by default.

Each collapsed visit shows its number, time, source, and a short engagement summary. It only highlights information that changed or was unusual. Repeated defaults, such as `VPN No` or `Form not submitted`, remain hidden until the visit is expanded. The decision visit opens by default, and a marker directly after it explains what that visit added to the existing pattern.

I rejected showing every field for every visit because it made the page difficult to scan. I also rejected a one-line journey because it removed the detail needed to understand the decision. The final structure gives a clear summary first and keeps the full record available.

## Status confidence and enforcement

The main status words are Blocked, Monitoring, Not blocked, and Not evaluated. `Manually allowed` is a separate override state rather than a system verdict. I rejected `Allowed` on its own because the customer would not know whether the system made that decision or a person overrode it.

Every status uses a text label and a marker shape, so colour never carries the meaning alone. Red is reserved for a block, failure, or destructive action. Amber represents Monitoring. Green is used for successful sync or a positive outcome.

Decision confidence uses plain labels rather than percentages. The mock model does not produce a calibrated decision probability, so a percentage would suggest false precision. Monitoring visitors always show either Conflicting evidence or Insufficient evidence. Bot probability remains a separate visit-level signal.

The block decision and the advertising platform's exclusion have separate timestamps. A paid click may arrive while the exclusion is pending. The journey shows both events, and the exposure total counts any click that lands during that delay separately.

## Paid exposure and filters

Spend appears only when the platform supplies a cost for every relevant click. The page shows the calculation as supporting detail. If cost data is incomplete, it says so instead of filling the gap.

I did not use `protected spend` or `prevented ad waste`. The mock data does not record traffic that would have arrived after a block, so those figures would be guesses. A later conversion is treated as conflicting evidence, not proof that an earlier block was wrong.

Search, date range, and status remain visible because they are the most common ways to narrow the table. Platform, paid traffic, location, confidence, email deliverability, and conversion sit inside the Filters menu. Active filters appear as removable chips, and the empty state explains when filters have removed every result.

A visitor is included in a date range when at least one visit falls inside it. This preserves older journeys that return during the selected period. Filter and sort state is stored in the URL, so the table returns to the same view after the customer opens a visitor.

## Actions left out

I did not include manual or bulk overrides in the core prototype. Bulk blocking repeats work ClickGuard already performs, while bulk allowing bypasses the visitor-level review.

A responsible manual override needs permissions, an audit history, and clear rules for each advertising platform. The prototype does not model those systems. Storybook still includes the `Manually allowed` state to show how a future override could appear without deleting the original verdict or evidence.

## Use of AI

I used an AI coding tool for implementation, data generation, tests, and repetitive component work. I kept the product decisions in a written log and reviewed the output against the customer questions before accepting it.

An early version used a drawer, generated 220 visitors, and created more stories than the assessment needed. It also made product choices during implementation. I rejected that version and defined the product contract before rebuilding.

The contract set the customer questions, status vocabulary, data model, and evidence hierarchy. Reviewing the early version exposed two missing details: the exact decision time and a clear distinction between strong and borderline decisions.

I also changed choices after reviewing the working interface. The original Why column used long sentences, so I replaced them with short evidence labels and moved the full explanation to the detail page. I added confidence labels to Monitoring rows so none were left blank.

AI helped produce the code, but I chose the information hierarchy, terminology, scope, interaction patterns, ambiguous cases, and the evidence shown at each level. I would use the same approach again: define the product contract first, record decisions as they are made, and review the working interface after each implementation phase.

## Limitations and next steps

The prototype explains decisions; it does not make them. The evidence engine is a mock built to
reproduce eight hand-written cases and generate consistent filler, so its weights and thresholds
stand in for the production model's explainability contract. Replacing them is the first step:
the interface needs each decision to arrive with ranked, plain-language reasons, and the model
has to be able to supply them.

The 30-second target is a design goal, not a measurement. The verdict, its time, the main reason
and the confidence label sit first on the page, and the journey and evidence follow directly
below, but no customer has timed it. Testing that with PPC operators would also check the
vocabulary: whether "Not blocked", "Monitoring", "Conflicting evidence" and "Insufficient
evidence" read as intended to people who run campaigns.

Exclusion sync is modelled as pending, delayed, active and failed events with their own times,
which lets the page show a paid click landing in the gap. How each advertising platform reports
that state, and how quickly, is assumed rather than known. The same applies to prevented traffic:
the page shows only recorded cost, and no saved-spend figure will be honest until the platforms
report what an exclusion actually stopped.

Manual and bulk overrides were left out on purpose. Adding them needs permissions, an audit
history that keeps the original decision and its evidence on record, and defined behaviour when
a platform has not yet applied or has rejected the exclusion. The data model and the status
vocabulary leave room for that work.

Finally, the table is paginated at twenty rows over local data. A production list needs
server-side search, filtering and sorting, a real date range rather than presets ending now, and
a decision on what "last seen" means when visits arrive continuously.
