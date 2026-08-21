# MeetVia — Full-Stack Build Status

Last updated: 2026-08-22

## Source of Truth

`future_meetvia_full_feature_docs.zip` is the long-term full-feature reference package.

Branding rule: replace every `GoWith` / `gowith` reference from that package with **MeetVia**. Product requirements/features remain unchanged.

`RAVEN_ORACLE_MASTER_DOCUMENTATION.md` and Raven Oracle documentation are explicitly out of scope and must not be used for MeetVia decisions.

## Development Rules

- Build slowly, one requirement at a time.
- Do not advance to the next phase until the current phase is implemented and verified full-stack.
- Every feature must cover frontend + backend/API + database + admin where the requirement calls for admin control.
- Test locally before deployment, then verify on VPS.
- GitHub is source control; VPS is deployment infrastructure.
- Do not treat a database model/schema as a completed feature.
- Do not mark a feature complete merely because it compiles.
- Keep advanced/future features behind feature flags and out of the client MVP until explicitly released.

## Current VPS State

- Branch: `migration-stage-0`
- Frontend PM2: online on port `3000`
- Backend PM2: online on port `5000`
- PostgreSQL: connected through Prisma
- Frontend production build: successful
- Direct local HTTP response on `localhost:3000`: HTTP 200
- Public access requires the AWS/network layer to allow the configured entry point.

## What Has Been Implemented / Found Existing

### Foundation
- Git repository and branch foundation
- Next.js/TypeScript frontend
- Node/Express backend
- Prisma + PostgreSQL
- Environment/API foundation
- User/customer/role/session/OTP-related backend foundation
- Error/logging/API foundation
- CMS/content data foundation
- Admin/backend foundations already present in the repository

### Public Website
- MeetVia navbar and responsive mobile navigation
- Sign-in/Profile navigation state
- Theme toggle
- Futuristic/animated hero treatment
- Hero slide data integration
- How It Works
- Safety section
- Services preview
- Browse Companions preview foundation
- Become a Companion
- About
- Cities
- FAQ
- Testimonials
- Contact
- Footer
- Terms, Privacy, Refund and Safety policy pages
- MeetVia branding restored across the touched navbar/footer/home/hero surfaces

### Current Homepage additions
- `frontend/src/components/home/CompanionPreview.tsx`
- Homepage integration for companion preview
- MeetVia metadata and organization JSON-LD

## Phase Status

### Phase 0 — Documentation & Repository
Status: **PARTIAL / NEEDS VERIFICATION**

Need to verify against the reference package:
- coding standards
- environment system
- architecture decisions
- CI
- complete documentation structure
- design-system foundation

### Phase 1 — Website Foundation
Status: **IN PROGRESS — NOT COMPLETE**

Reference requirements:
- futuristic intro / reveal
- final hero
- Browse Companions preview
- How It Works
- About MeetVia
- Contact
- Footer
- responsive design

Implemented foundation exists, but acceptance verification is still required. In particular, the hero still needs to be compared against the exact product blueprint (discovery controls: city, experience, date/time; primary CTA and intended visual composition), and all homepage requirements need browser/manual verification.

### Phase 2 — Authentication
Status: **FOUNDATION EXISTS — NOT COMPLETE**

Reference requirements:
- mobile OTP
- session management
- logout
- Google login
- Facebook login
- Apple login
- user profile
- basic roles

Remaining/verify:
- complete OTP end-to-end
- social login providers
- session security/rotation
- logout verification
- profile flow
- RBAC enforcement
- rate limits/abuse protection
- frontend/backend/admin integration tests

### Phase 3 — Companion Marketplace
Status: **NOT COMPLETE**

Required:
- companion onboarding
- companion profile
- city
- experience categories
- pricing
- availability
- photos/media
- rating foundation
- search
- filters
- profile page

### Phase 4 — Companion Verification
Status: **NOT COMPLETE**

Required:
- verification form
- document upload
- verification state machine
- admin review
- approve/reject/request changes
- verified badge
- suspension

### Phase 5 — Experience Marketplace
Status: **NOT COMPLETE**

Required:
- admin-controlled experience categories
- city/experience discovery
- experience selection
- data-driven categories
- initial categories: Travel, Event, Coffee, Explore, Talk, Movie, Food, Shopping, Photography

### Phase 6 — Booking Engine
Status: **NOT COMPLETE**

Required:
- availability
- booking request
- confirmation
- booking state machine
- cancellation
- booking history
- notifications

States include `REQUESTED`, `PENDING_PAYMENT`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, with `CANCELLED`, `DISPUTED`, and `EXPIRED` exits.

### Phase 7 — Payments
Status: **NOT COMPLETE**

Required:
- payment-provider abstraction
- payment intent
- success/failure
- webhook handling
- refunds
- transaction records
- admin payment view

Server/webhook must remain authoritative for payment state.

### Phase 8 — Chat
Status: **NOT COMPLETE**

Required:
- conversation creation
- booking-controlled activation
- WebSocket/realtime
- message persistence
- attachments
- moderation
- report message
- admin moderation

Chat must remain locked until the booking rules permit access.

### Phase 9 — Safety & Moderation
Status: **NOT COMPLETE**

Required:
- phone/email/contact detection
- URL/social-handle detection
- image OCR/moderation pipeline
- moderation rules
- user reports
- account restrictions
- audit logs

### Phase 10 — Admin Control
Status: **FOUNDATION EXISTS — NOT COMPLETE**

Required operational areas:
- Overview
- Users
- Companions
- Verification
- Bookings
- Payments
- Messages
- Reports
- Reviews
- Cities
- Experiences
- Content
- Notifications
- Settings
- Feature Flags
- Audit Logs
- Analytics

Admin roles must be least-privilege and actions audited.

### Later — Mobile / Growth / Intelligence / Scale
Not to be activated before the core production product is stable.

Includes:
- React Native/Expo mobile app
- favorites / saved searches / waitlists
- promotions / referrals
- subscriptions
- wallet/credits
- companion tiers
- dynamic pricing
- AI companion matching
- AI recommendations
- advanced location matching
- fraud/risk engine
- advanced moderation/OCR/QR
- advanced analytics
- A/B testing
- multi-city expansion
- data warehouse/recommendation pipelines
- advanced observability/disaster recovery

## Full-Feature Build Order

```text
Foundation
  -> Authentication
  -> Companion Marketplace
  -> Verification
  -> Experience Marketplace
  -> Booking
  -> Payments
  -> Chat
  -> Safety / Moderation
  -> Admin Control
  -> Notifications
  -> Testing
  -> Production
  -> Future Features
```

## Immediate Work Remaining

1. Finish and verify **Phase 1** against the uploaded full-feature documentation.
2. Complete Phase 1 frontend + backend/API + admin/CMS integration where applicable.
3. Run local/manual browser verification for every Phase 1 requirement.
4. Run automated tests, lint and production build.
5. Verify the same build on VPS.
6. Only after Phase 1 acceptance, proceed to Phase 2 authentication.

## Completion Rule

Do **not** write `Phase X COMPLETE` until all required frontend, backend, database, admin, integration, testing and acceptance items for that phase are actually verified.
