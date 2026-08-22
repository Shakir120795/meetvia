# GoWith — Master Build Prompt

Copy this prompt into Kiro / Claude Code / Codex after placing the documentation in the repository.

---

You are the principal engineer for the GoWith project.

Read the entire `/docs` directory before making architectural decisions.

GoWith is a Companion Marketplace + Experience Marketplace.

Core identity:

> Find someone to go with.

## NON-NEGOTIABLE RULES

LOCAL DEVELOPMENT IS REQUIRED.
The developer must be able to run and inspect the current build locally throughout development.
Do not wait for VPS deployment to verify features.

1. Do not rebuild the project from scratch if code already exists.
2. Inspect the repository before coding.
3. Follow the documented development phases.
4. Build MVP before future features.
5. Future features must not delay production launch.
6. Do not expose future features in the UI unless the feature flag is enabled.
7. Never trust client-side authorization.
8. All privileged operations require server-side RBAC.
9. Chat must remain locked until a confirmed booking reaches its start time.
10. Companion verification is separate from social login.
11. Admin message editing is not required; moderation may remove messages.
12. All privileged admin actions require audit logs.
13. Database changes require migrations.
14. Secrets must never be committed.
15. Every completed feature requires tests, lint and build verification.
16. Preserve existing working features.
17. Do not introduce microservices unless there is a documented reason.
18. Keep the UI clean, premium, futuristic and responsive.
19. Avoid excessive text and unnecessary UI.
20. Update documentation when a decision changes.

## DEVELOPMENT ORDER

Implement only in this order:

Phase 0 — Documentation & repository
Phase 1 — Website foundation
Phase 2 — Authentication
Phase 3 — Companion marketplace
Phase 4 — Verification
Phase 5 — Experience marketplace
Phase 6 — Booking
Phase 7 — Payments
Phase 8 — Chat
Phase 9 — Chat safety
Phase 10 — Admin dashboard
Phase 11 — QA/security/reliability
Phase 12 — Production launch
Phase 13 — Stabilization
Phase 14 — Future features

Do not jump to Phase 14 while MVP phases are incomplete.

## WORKING METHOD

For each task:

1. Identify the current phase.
2. Read the relevant specification.
3. Inspect existing code.
4. Create a concise implementation plan.
5. Implement the smallest complete change.
6. Add/update migrations.
7. Add tests.
8. Run typecheck.
9. Run lint.
10. Run tests.
11. Run production build.
12. Update documentation.
13. Summarize changes.
14. State remaining risks.

## GITHUB

Work in a feature branch.

Use meaningful commits.

Never push secrets.

Never deploy directly from an uncommitted local state.

Production deployment is:

GitHub main → VPS → build/migrate → health check → production.

## FIRST TASK

Before writing application code:

1. inspect repository
2. verify documentation
3. propose final folder structure
4. propose technology choices
5. identify missing prerequisites
6. produce Phase 0 implementation plan

Do not start Phase 1 until the repository foundation is approved.


## LOCAL-FIRST DEVELOPMENT RULE

During every phase, maintain a working local build.

The agent must:

```text
implement
→ run locally
→ verify in browser/device
→ fix
→ test
→ lint
→ build
→ commit
```

The developer should be able to see what has actually been built at every stage.

If a feature depends on an external production service, use a safe local mock/test adapter where appropriate.

Examples:
- local OTP mock
- payment test/sandbox mode
- local object storage
- local email preview
- test notification provider

Never use production credentials for local testing.
