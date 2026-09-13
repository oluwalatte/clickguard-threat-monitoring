# ClickGuard Threat Monitoring

A working prototype of the Threat Monitoring feature and the design system it is built from.

- Prototype: (after deploy)
- Storybook: (after deploy)
- Rationale: `docs/rationale.md` (after P5)
- Product contract: `docs/decisions.md`

## Mechanics modelled
A visitor is an IP with many visits. Only paid visits cost money. Evidence accrues across the
journey; at one visit the system decides to block, and the exclusion becomes active on the
advertising platform as a separate event, sometimes after a further paid click.

Invented for this exercise: network type, click velocity, device consistency, exclusion sync state.
