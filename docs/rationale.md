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
