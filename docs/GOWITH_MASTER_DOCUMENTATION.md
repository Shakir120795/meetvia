# GoWith Full Feature Documentation

This file consolidates the official GoWith full-feature documentation supplied for implementation. The original source documents are preserved below by filename.

# ===== SOURCE: 00_MASTER_PROJECT_PROMPT.md =====

# GoWith — Master Project Prompt

## Product Identity

GoWith is a premium companion marketplace focused on helping people find someone to go with them — for travel, local activities, events, dining, city exploration, and social experiences.

Primary tagline:

> Find someone to go with.

The product should feel modern, safe, human, trustworthy, and premium rather than like a generic classifieds marketplace.

## Core Product

GoWith connects:

- Customers looking for companions
- Companions offering their time and presence
- Administrators managing safety, quality, content, and operations

The first release is a clean Companion Marketplace. Advanced Experience Marketplace functionality is planned for later phases.

## Core Principles

1. Safety and trust first.
2. Human profiles over anonymous listings.
3. Clean premium UI.
4. Mobile-first responsive design.
5. Server-authoritative business rules.
6. Admin moderation for safety-sensitive content.
7. Reusable APIs for future mobile apps.
8. Do not break existing working functionality.
9. Implement requirements in documented phase order.
10. Complete and test a phase before moving to the next phase.

## Required Development Workflow

For every implementation step:

1. Inspect the existing repository.
2. Identify existing implementation and dependencies.
3. Make the smallest safe change.
4. Implement frontend, backend, database, and admin pieces required by the feature.
5. Test the feature.
6. Run typecheck/build/tests where applicable.
7. Fix errors before continuing.
8. Commit changes to GitHub.
9. Do not start the next step until the current step is actually complete.

## Branding Direction

The visual direction is GoWith, not Meetvia.

The interface should combine:

- premium travel marketplace
- modern companion platform
- subtle futuristic/3D elements
- warm human imagery
- trustworthy safety cues

Avoid:

- dating-app appearance
- adult-service appearance
- cheap classifieds appearance
- excessive gradients
- cluttered cards
- generic template styling

## Hero Direction

The hero should communicate the product immediately:

> Find someone to go with.

It should use a premium 3D visual treatment where appropriate, with companion/travel context rather than abstract technology-only graphics.

## Roles

Core roles:

- CUSTOMER
- COMPANION
- ADMIN

Authorization must be enforced server-side.

## Authentication Foundation

The platform supports authenticated customer and companion accounts. Authentication/session state must be controlled by the backend and represented safely in the frontend.

Required foundations include:

- account creation/login
- OTP authentication where specified
- session lifecycle
- logout
- profile management
- role assignment
- account status

## Admin Principle

The admin panel is a first-class part of the product. Any feature that requires moderation, approval, configuration, or operational control must have its corresponding admin implementation.

## Completion Rule

A phase is complete only when its required frontend + backend + database + admin + integration + testing work is complete. A page existing alone does not mean the feature is complete.

# ===== SOURCE: 01_PRODUCT_BLUEPRINT.md =====

# GoWith Product Blueprint

## Vision

GoWith makes it easy for people to find a trusted person to accompany them.

## Primary User Journeys

### Customer

1. Discover companions.
2. Search/filter by relevant criteria.
3. Open a companion profile.
4. Review verification/trust information.
5. Request/contact/book according to the active phase.
6. Complete the journey safely.

### Companion

1. Create account.
2. Build profile.
3. Submit companion application/profile.
4. Complete verification requirements.
5. Become discoverable after approval.
6. Receive customer requests.

### Admin

1. Authenticate securely.
2. Review users and applications.
3. Moderate companion profiles/content.
4. Manage site configuration/content.
5. Monitor operational activity.

## Product Positioning

GoWith is a marketplace for companionship and shared experiences. It is not a dating platform and not an adult-service marketplace.

## Trust Signals

Trust should be visible through:

- profile completeness
- verification status
- clear rules
- moderation
- reporting/safety controls
- transparent booking/request flows

# ===== SOURCE: 02_TECHNICAL_ARCHITECTURE.md =====

# GoWith Technical Architecture

## Architecture

Web frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion / GSAP where useful

Backend:

- Express.js
- TypeScript
- versioned REST API

Database:

- PostgreSQL / Prisma foundation used by the current implementation where applicable

The backend is authoritative for:

- authentication
- authorization
- profiles
- marketplace visibility
- moderation
- bookings/requests
- safety rules
- payments

## API

Use versioned routes under `/api/v1/`.

Public and authenticated endpoints must return stable JSON structures.

## Security

Never trust frontend role/state for authorization.

Validate:

- authentication
- ownership
- role
- account state
- moderation state
- input constraints

## Database

Database state is authoritative. Frontend local storage may cache session information but must not become the source of truth for business rules.

## Media

Use a storage abstraction so development can use local storage and production can migrate to S3-compatible storage without changing business logic.

# ===== SOURCE: 03_FEATURE_SPECIFICATION.md =====

# GoWith Feature Specification

## Foundation

- public landing page
- navigation
- footer
- responsive design
- authentication
- profile
- role system
- session system

## Marketplace

- companion discovery
- search
- filters
- companion profiles
- location information
- availability
- pricing where applicable
- verification indicators

## Companion Onboarding

- application
- profile creation
- media
- services/capabilities
- location
- availability
- verification submission

## Requests / Booking

- customer request
- companion response
- status lifecycle
- booking details
- cancellation rules
- payment integration when enabled

## Safety

- report
- block
- moderation
- emergency/safety guidance
- admin review

# ===== SOURCE: 04_ADMIN_BLUEPRINT.md =====

# GoWith Admin Blueprint

## Admin Areas

- Dashboard
- Users
- Companions
- Applications
- Verification
- Reports
- Bookings/Requests
- Content
- Media
- Settings
- Audit Logs

## Admin Requirements

Admin actions must be protected server-side.

Moderation actions must record:

- actor
- target
- action
- reason where applicable
- timestamp

## User Management

Admin can view/manage account states such as:

- ACTIVE
- SUSPENDED
- DEACTIVATED

## Companion Moderation

Admin can:

- review applications
- approve
- reject
- request changes
- suspend
- restore

# ===== SOURCE: 05_CHAT_SAFETY_SPEC.md =====

# GoWith Chat & Safety Specification

## Safety Principles

Communication must be designed around user safety.

Required capabilities when chat is introduced:

- authenticated participants only
- conversation ownership validation
- reporting
- blocking
- moderation
- rate limiting
- abuse prevention

## Messaging

Messages must be associated with the authenticated sender and conversation. The frontend must never be trusted to supply arbitrary sender identity.

## Moderation

Admin/moderation tools must be able to review reported content according to privacy and operational requirements.

# ===== SOURCE: 06_UI_UX_SPECIFICATION.md =====

# GoWith UI/UX Specification

## Visual Direction

Premium, minimal, travel-oriented, human, trustworthy.

## Design Language

Use:

- generous spacing
- strong typography hierarchy
- high-quality imagery
- rounded but controlled surfaces
- subtle motion
- clear calls to action
- accessible contrast

Avoid:

- excessive card borders
- repetitive boxed layouts
- visual clutter
- generic dashboard aesthetics on the public website

## Hero

The hero should be visually strong and can use a 3D companion/travel scene. It should maintain fast loading and graceful fallback.

## Marketplace Cards

Companion cards should prioritize:

- photo
- name
- location
- verification/trust indicator
- short description
- relevant service/experience information
- clear CTA

Cards should feel like premium travel marketplace cards rather than dense admin boxes.

## Responsive

Mobile-first. All important journeys must work on mobile, tablet, and desktop.

# ===== SOURCE: 07_CODING_AGENT_PROMPTS.md =====

# GoWith Coding Agent Prompts

## General Rule

Read the repository before modifying it. Preserve working functionality.

## Implementation Prompt

Implement exactly the requested feature from the current GoWith phase. Do not invent adjacent features. Check frontend, backend, database, and admin requirements before coding. Validate inputs server-side. Add tests where applicable. Run typecheck/build/tests. Commit only after verification.

## Bug Fix Prompt

Reproduce/inspect the existing issue. Identify the smallest root cause. Fix without rewriting unrelated code. Verify the affected flow and existing regression-sensitive flows.

# ===== SOURCE: 08_DEVELOPMENT_ROADMAP.md =====

# GoWith Development Roadmap

Development proceeds in controlled phases.

## Phase 1 — Website Foundation

- GoWith branding/UI direction
- public landing page
- futuristic intro
- final hero
- 3D hero treatment
- browse companions preview foundation where required by the specification
- how it works
- about
- contact
- footer
- responsive design

## Phase 2 — Authentication & Account Foundation

- customer authentication
- OTP/session where specified
- logout
- social authentication where specified
- user profile
- roles
- account states

## Phase 3 — Companion Marketplace

- companion discovery
- search/filter
- companion profiles
- companion data
- availability/pricing foundations

## Phase 4 — Verification

- companion verification
- verification workflow
- admin review
- verification states

## Phase 5 — Experience Marketplace

- experience creation
- discovery
- experience detail
- experience management

## Phase 6+ — Requests, Booking, Payments, Chat, Safety, Admin Expansion

Each phase must be completed before the next begins.

# ===== SOURCE: 09_ENVIRONMENT_AND_DEPLOYMENT.md =====

# GoWith Environment & Deployment

## Local Development

The current build must be run locally during development so the UI and functionality can be visually and functionally verified.

## GitHub

Changes are committed and pushed after verification.

## AWS

The deployment target uses the existing AWS/VPS workflow. Pull the verified GitHub changes on the server and rebuild/restart as required.

## Environment

Secrets must remain outside source control. Use `.env` / environment configuration and maintain `.env.example` documentation.

# ===== SOURCE: 10_ACCEPTANCE_CHECKLIST.md =====

# GoWith Acceptance Checklist

## General

- [ ] Existing working functionality preserved
- [ ] Frontend implemented
- [ ] Backend implemented where required
- [ ] Database implemented where required
- [ ] Admin implemented where required
- [ ] Responsive UI
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Validation
- [ ] Authorization
- [ ] Typecheck
- [ ] Build
- [ ] Relevant tests
- [ ] Local visual verification
- [ ] Git commit

## Phase Completion

A phase cannot be marked complete until every required checklist item for that phase passes.

# ===== SOURCE: 11_GITHUB_VPS_DEPLOYMENT.md =====

# GoWith GitHub / VPS Workflow

## Development

1. Work on the repository.
2. Test locally.
3. Commit.
4. Push to GitHub.
5. Pull on AWS/VPS.
6. Install/update dependencies if needed.
7. Generate database client/migrations if required.
8. Typecheck/build.
9. Restart the application process.
10. Verify the deployed flow.

## Golden Rule

Do not move forward because code merely exists in GitHub. The feature must be verified.

# ===== SOURCE: 12_RELEASE_PHASES_AND_FEATURE_ORDER.md =====

# GoWith Release Phases & Feature Order

## Phase 1

Website Foundation.

Required focus:

- GoWith brand direction
- landing page
- 3D hero
- public sections
- responsive UI

## Phase 2

Authentication and account foundation.

## Phase 3

Companion marketplace.

## Phase 4

Verification.

## Phase 5

Experience marketplace.

## Later

Requests/booking → payments → chat → safety → advanced admin/operations.

## Strict Rule

Do not start the next phase until the current phase is fully implemented and verified.

# ===== SOURCE: 13_GITHUB_AGENT_WORKFLOW.md =====

# GoWith GitHub Agent Workflow

## Before Coding

- inspect repository
- inspect current branch
- inspect relevant files
- inspect existing APIs/components
- inspect schema

## During Coding

- one logical step at a time
- preserve existing functionality
- no unrelated refactors
- no unnecessary dependencies

## After Coding

- test
- typecheck
- build
- review diff
- commit

## Conversation Workflow

User may say `next` to continue. The agent should continue only the current phase and only the next required step.

Do not provide unnecessary suggestions or unrelated discussion.

# ===== SOURCE: 14_MASTER_BUILD_PROMPT.md =====

# GoWith Master Build Prompt

Build GoWith as a production-quality companion marketplace using the existing repository as the base.

The implementation must be incremental and safe.

For each feature:

- frontend
- backend
- database
- admin
- integration
- validation
- tests

must be considered together.

Do not declare completion until the complete workflow works end-to-end.

## Product Tone

The platform should feel:

- premium
- friendly
- travel-oriented
- trustworthy
- modern
- human

## Core Tagline

**Find someone to go with.**

# ===== SOURCE: 15_LOCAL_DEVELOPMENT_AND_PREVIEW.md =====

# GoWith Local Development & Preview

Local development is mandatory during implementation.

## Required Loop

1. Modify code.
2. Run frontend/backend locally.
3. Open the affected page.
4. Check desktop.
5. Check mobile/responsive behavior.
6. Exercise the affected API flow.
7. Fix visual/functional issues.
8. Then commit/push.

Do not rely only on static code inspection for UI work.

# ===== SOURCE: 16_FULL_FEATURE_MODULE_CATALOG.md =====

# GoWith Full Feature Module Catalog

## Public

- Home
- Companion discovery
- Companion profile
- Experiences
- About
- Contact
- Legal/safety pages

## Customer

- Authentication
- Profile
- Discovery
- Requests
- Bookings
- Payments
- Chat
- Reports/blocking

## Companion

- Onboarding
- Profile
- Verification
- Services/experiences
- Availability
- Requests
- Earnings/payment information where applicable

## Admin

- Dashboard
- Users
- Companions
- Verification
- Experiences
- Requests/bookings
- Reports
- Content
- Media
- Settings
- Audit logs

# ===== SOURCE: 17_FULL_FEATURE_BUILD_ORDER.md =====

# GoWith Full Feature Build Order

1. Website Foundation
2. Authentication & Account
3. Companion Marketplace
4. Verification
5. Experience Marketplace
6. Requests / Booking
7. Payments
8. Chat
9. Safety / Reporting
10. Full Admin Operations
11. Final QA / Security / Deployment

Every item follows the one-step-at-a-time rule.

# ===== SOURCE: 18_INTERNAL_MASTER_BUILD_PROMPT.md =====

# GoWith Internal Master Build Prompt

This is the internal implementation rule set for the coding agent.

## Non-Negotiable Rules

1. Continue from the existing repository.
2. Never restart the project from scratch.
3. Never break working functionality intentionally.
4. Follow the documented phase order.
5. Work one step at a time.
6. Complete the current step before moving to the next.
7. A phase is complete only after full-stack verification.
8. Frontend-only implementation is not sufficient where backend/admin/database work is required.
9. Server-side authorization is mandatory.
10. Do not add features that are not required.
11. Do not provide unnecessary suggestions during implementation.
12. Keep conversation point-to-point.

## Phase Gate

The agent must explicitly verify:

- required feature files exist
- APIs work
- database operations work
- admin operations work where required
- frontend flow works
- error states work
- build/typecheck/tests pass

Only then can the phase be marked complete.

# ===== SOURCE: README.md =====

# GoWith Full Feature Internal Documentation

This directory contains the complete internal product, technical, UI/UX, admin, development, release, and deployment documentation for GoWith.

The documents are the implementation source of truth for future development.

# ===== SOURCE: README_FULL_FEATURE.md =====

# GoWith Full Feature Documentation

Use this documentation set as the authoritative reference for implementing the GoWith platform.

The product is a companion marketplace with a premium travel-oriented experience. Development must proceed phase-by-phase and step-by-step. Existing working functionality must be preserved. A phase is not complete until its full-stack implementation and verification are complete.
