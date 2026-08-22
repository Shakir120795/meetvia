# GoWith — Local Development & Preview Workflow

## Purpose

GoWith must be continuously runnable on the developer's local PC.

This allows the team to see exactly what has been built before pushing it to GitHub or deploying to the VPS.

## Development Loop

```text
Task
 ↓
Code
 ↓
Run locally
 ↓
Browser/device preview
 ↓
Manual test
 ↓
Fix
 ↓
Automated tests
 ↓
Lint
 ↓
Production build
 ↓
Git commit
 ↓
GitHub
 ↓
VPS/Staging
 ↓
Production
```

## Local Stack

Typical local services:

```text
Web       → localhost:3000
API       → localhost:4000
Admin     → localhost:3001
Postgres  → localhost/container
Redis     → localhost/container
Worker    → local/container
```

Exact ports are decided during Phase 0.

## One Command Development

The repository should eventually provide a simple command such as:

```bash
npm run dev
```

or:

```bash
docker compose up
```

This should start the services required for normal development.

If multiple processes are required, use a documented workspace/dev runner rather than manually starting many unrelated commands.

## Local Database

Use a separate development database.

Never point local development at production.

Database changes must be made through migrations.

Example:

```text
database/
├── migrations/
├── seeds/
└── scripts/
```

## Local Seed Data

The local environment should have safe demo data:

- demo users
- demo companions
- demo cities
- demo experiences
- demo availability
- demo bookings
- demo reviews

Do not use real customer data.

## External Services

Use test/sandbox adapters where available.

Examples:

```text
OTP      → mock/test provider
Payments → sandbox
Email    → local preview/test provider
Storage  → local/S3-compatible dev storage
Push     → development credentials
```

## Browser Verification

After every meaningful feature:

1. open local URL
2. test primary user flow
3. test error state
4. test loading state
5. test empty state
6. check responsive layout
7. check browser console
8. check API logs

## Responsive Verification

Check at minimum:

```text
360px
390px
430px
768px
1024px
1440px
```

## Mobile

For React Native:

- Android emulator/device
- iOS simulator where available

The web app and mobile app must be tested independently.

## Feature Completion Template

Before marking a feature complete, record:

```text
Feature:
Phase:
Local URL:
How to test:
Expected result:
Automated tests:
Lint:
Build:
Known limitations:
```

## Important Rule

A feature that only compiles but has not been manually tested locally is **NOT DONE**.

The developer must be able to see and test the current state of the project at every phase.
