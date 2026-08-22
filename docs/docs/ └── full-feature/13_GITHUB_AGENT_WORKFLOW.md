# GoWith — GitHub Coding-Agent Workflow

## Goal

Kiro, Claude Code, Codex or another coding agent should work through GitHub in controlled feature branches.

## Workflow

```text
Issue / Task
   ↓
Read docs
   ↓
Create feature branch
   ↓
Plan
   ↓
Code
   ↓
Test
   ↓
Lint
   ↓
Build
   ↓
Commit
   ↓
Push
   ↓
Pull Request
   ↓
CI
   ↓
Review
   ↓
Merge develop
   ↓
Staging
   ↓
Production PR
   ↓
main
   ↓
VPS pull/deploy
```

## Agent Rule

Never tell an agent:

> Build the whole app.

Instead give:

> Implement Phase X / Feature Y according to the project documentation.

This reduces hallucinated architecture and prevents premature future features.

## Before Every Task

Agent must inspect:

```text
README.md
docs/00_MASTER_PROJECT_PROMPT.md
docs/01_PRODUCT_BLUEPRINT.md
docs/02_TECHNICAL_ARCHITECTURE.md
docs/03_FEATURE_SPECIFICATION.md
```

Then inspect relevant source code.

## Task Template

```text
TASK:
[exact task]

PHASE:
[phase number]

SOURCE OF TRUTH:
[documentation file]

DO NOT:
- rebuild unrelated modules
- introduce future features
- change architecture without approval
- remove existing features

REQUIRED:
- tests
- validation
- authorization
- responsive UI
- error handling
- documentation update

DONE WHEN:
[list acceptance criteria]
```

## Commit Rule

One logical feature per commit where practical.

Good:

```text
feat(booking): create booking state machine
```

Bad:

```text
update everything
```

## Pull Request Requirements

Every PR should contain:

```text
Summary
Changes
Database changes
API changes
UI changes
Security impact
Tests
Screenshots for UI
Migration notes
Rollback notes
```

## CI Requirements

Pull requests should automatically run:

```text
install
typecheck
lint
unit tests
integration tests
build
```

Security scanning may also run.

## Production Rule

Only `main` deploys production.

A production deploy must reference a specific commit.

Never deploy an uncommitted working tree.


## Local Verification Gate

Every feature has a local verification gate before it is committed.

Agent must provide:

```text
Local URL
Feature implemented
Manual test steps
Expected result
Known limitations
```

Example:

```text
Local URL:
http://localhost:3000

Feature:
Mobile OTP login

Test:
1. Open login
2. Enter mobile
3. Request OTP
4. Enter OTP
5. Verify redirect

Expected:
User reaches dashboard.

Known limitations:
SMS provider is mocked locally.
```

The developer should visually inspect the result in the browser before approving the feature.

For mobile work, use the appropriate local emulator/device.

Do not mark a feature complete only because the code compiles.
