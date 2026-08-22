# GoWith — Portable Coding-Agent Prompts

These prompts are designed to work with Kiro, Claude Code, Codex, Cursor, Windsurf, or another coding agent.

## MASTER CONTEXT PROMPT

```text
You are working on the GoWith project.

Before changing code:
1. Read all files in /docs.
2. Inspect the current repository.
3. Understand existing architecture.
4. Do not rebuild from scratch.
5. Preserve existing product decisions.
6. Do not expose hidden future features unless explicitly requested.

GoWith is a Companion Marketplace + Experience Marketplace.

Core tagline:
"Find someone to go with."

The product combines:
- companion discovery
- experience discovery
- booking
- secure payments
- booking-controlled chat
- companion verification
- moderation
- admin control

The UI must be dark, futuristic, premium, clean and responsive.

Important security rule:
Never trust the frontend for authorization.
All permissions must be enforced server-side.

Important chat rule:
Chat must remain locked until a confirmed booking reaches its start time.

Important verification rule:
Social login does not equal companion verification.
Companions must complete the platform verification workflow and be approved.

When making a change:
- inspect first
- plan
- implement
- test
- lint
- build
- document
- summarize changed files
- list remaining risks
```

## FEATURE IMPLEMENTATION PROMPT

```text
Implement the following GoWith feature:

FEATURE:
[DESCRIBE FEATURE]

Before coding:
- inspect the current implementation
- identify affected modules
- identify database changes
- identify API changes
- identify UI changes
- identify security implications

Then:
1. create a short implementation plan
2. implement backend
3. implement database migration
4. implement API validation and authorization
5. implement frontend
6. implement loading/error/empty states
7. add tests
8. run lint
9. run build
10. update documentation

Do not modify unrelated modules.
Do not remove existing functionality.
Do not hard-code configuration that belongs in admin/settings.
```

## BUG-FIX PROMPT

```text
Fix this GoWith bug:

[BUG]

Do not rewrite the feature.

First reproduce or inspect the failure.
Find the root cause.
Implement the smallest safe fix.
Add a regression test.
Run the relevant test suite.
Run lint/build.
Explain:
- root cause
- files changed
- test performed
- remaining risk
```

## SECURITY REVIEW PROMPT

```text
Perform a security review of the specified GoWith feature.

Check:
- authentication
- authorization
- RBAC
- IDOR
- rate limits
- input validation
- file uploads
- secrets
- SQL injection
- XSS
- CSRF where relevant
- WebSocket authorization
- chat access control
- admin access
- audit logging
- sensitive data exposure

Do not change code until you provide findings.
Classify each finding:
CRITICAL / HIGH / MEDIUM / LOW

Then propose fixes.
```

## UI IMPLEMENTATION PROMPT

```text
Implement this GoWith UI from the existing design system.

Requirements:
- preserve current visual language
- dark futuristic premium look
- responsive mobile/tablet/desktop
- minimal copy
- accessible controls
- loading/empty/error states
- reduced motion support

Do not introduce a new design system without approval.

Use reusable components.
Avoid duplicated styles.
```

## DATABASE CHANGE PROMPT

```text
Implement this database change:

[CHANGE]

Requirements:
- migration
- backward-safe migration where possible
- indexes
- constraints
- foreign keys
- appropriate nullability
- audit implications
- seed/update strategy if required
- tests

Do not manually modify production database schema.
```
