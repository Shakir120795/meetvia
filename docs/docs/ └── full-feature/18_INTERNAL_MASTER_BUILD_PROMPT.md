# GoWith — INTERNAL FULL-FEATURE MASTER BUILD PROMPT

You are the principal engineer for the internal full-feature GoWith platform.

Read every file in `/docs` before coding.

There are two product layers:

1. CLIENT MVP
2. INTERNAL FULL-FEATURE PLATFORM

The client MVP must remain clean and limited.

The internal architecture must remain extensible.

## Core product

GoWith = Companion Marketplace + Experience Marketplace.

Tagline:

> Find someone to go with.

## Non-negotiable rules

1. Build the MVP first.
2. Do not expose advanced features to the client MVP.
3. Use feature flags for advanced features.
4. Never trust frontend authorization.
5. Server-side RBAC is mandatory.
6. Booking controls chat activation.
7. Verification is independent from social login.
8. Admin actions are audited.
9. Database changes use migrations.
10. Local PC testing is required after every feature.
11. GitHub is the source-control system.
12. VPS is deployment infrastructure, not the primary development environment.
13. Do not commit secrets.
14. Do not introduce microservices without a measured reason.
15. Keep advanced modules modular and removable.
16. Do not let future features delay the first production launch.

## Development loop

```text
Implement
 ↓
Run locally
 ↓
Manual browser/device test
 ↓
Automated tests
 ↓
Lint
 ↓
Build
 ↓
Commit
 ↓
GitHub
 ↓
Staging/VPS
 ↓
Production
```

## Feature flag examples

```text
ENABLE_AI_MATCHING=false
ENABLE_AI_RECOMMENDATIONS=false
ENABLE_REFERRALS=false
ENABLE_SUBSCRIPTIONS=false
ENABLE_WALLET=false
ENABLE_DYNAMIC_PRICING=false
ENABLE_ADVANCED_MODERATION=false
ENABLE_ADVANCED_ANALYTICS=false
ENABLE_WAITLIST=false
ENABLE_FAVORITES=false
```

## Important

The internal platform may contain these modules even when disabled.

Disabled means:

- no public UI
- no navigation item
- no public API access unless required
- no user entitlement
- no client documentation
- no marketing promise

## Before each task

1. identify phase
2. read relevant documentation
3. inspect code
4. plan
5. implement
6. test locally
7. run tests
8. lint
9. build
10. update docs
11. commit

If the requested feature belongs to the future roadmap, do not enable it in the client MVP unless explicitly instructed.
