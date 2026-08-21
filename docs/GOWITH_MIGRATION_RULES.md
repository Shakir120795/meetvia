# GoWith Migration Rules

## Source of Truth

- GitHub is the code source of truth.
- The GoWith master migration documents define the target scope and implementation order.
- Existing Meetvia functionality must be preserved unless a migration/rollback path exists.

## Golden Development Loop

Inspect → Plan → Implement → Local test → Browser/device test → Automated tests → Lint → Build → Commit → GitHub → VPS/Staging → Health check

## Non-Negotiable Rules

1. Do not rebuild the project from scratch.
2. Do not perform destructive database replacement.
3. Do not commit secrets.
4. Server-side authorization is mandatory.
5. Admin privileges require RBAC and audit logs.
6. Advanced features remain behind server-enforced feature flags until enabled.
7. Booking controls chat entitlement.
8. Social login does not equal companion verification.
9. Money uses integer minor units or Decimal; never floating point.
10. Timestamps are stored in UTC; destination timezone is preserved where required.
11. Every important business rule gets automated tests.
12. Every completed feature is manually tested locally.
13. Future/incomplete features must not be exposed publicly.

## Build Order

Stage 0 — Preserve
Stage 1 — GoWith Core
Stage 2 — Travel
Stage 3 — Advanced Safety
Stage 4 — Intelligence
Stage 5 — Monetization
Stage 6 — Global
Stage 7 — Mobile

## Conversation Rule

Project work follows point-to-point execution. No unrelated suggestions or scope expansion unless required to safely complete the current phase.
