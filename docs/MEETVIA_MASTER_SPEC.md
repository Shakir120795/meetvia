# MeetVia — Master Feature Specification

> Canonical project specification derived from `future_meetvia_full_feature_docs.zip`.
>
> Branding normalization: every `GoWith` reference from the source package is treated as `MeetVia` for this project.
>
## Source-of-truth rules

1. This document and the repository are the working source of truth for implementation.
2. Do not require the user to resend the feature ZIP for normal phase tracking.
3. Do not use `RAVEN_ORACLE_MASTER_DOCUMENTATION.md` or Raven Oracle material for MeetVia.
4. A phase is not complete until frontend + backend/API + database + admin (where applicable) + integration + verification are complete.
5. Do not advance to the next phase while the current phase has unmet acceptance requirements.
6. Future/advanced modules must be feature-flagged and must not block MVP launch.

## Release order

```text
Foundation
→ Authentication
→ Companion Marketplace
→ Experience Marketplace
→ Verification
→ Booking
→ Payment
→ Chat
→ Safety / Moderation
→ Admin Control
→ Notifications
→ Reviews
→ QA
→ Production
→ Growth / Future Features
```

## Phase requirements

### Phase 0 — Documentation & Repository
- GitHub repository and branch strategy
- monorepo structure
- coding rules
- environments
- CI
- documentation
- design-system foundation

### Phase 1 — Website Foundation
- futuristic intro
- final hero
- Browse Companions preview
- How It Works
- About
- Contact
- Footer
- responsive design
- polished public-facing website

### Phase 2 — Authentication
- mobile OTP
- session management
- logout
- Google login
- Facebook login
- Apple login
- user profile
- basic roles
- rate limits

### Phase 3 — Companion Marketplace
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
- verification form
- document upload
- verification state machine
- admin review
- approve/reject/request changes
- verified badge
- suspension

### Phase 5 — Experience Marketplace
- experience categories
- city/experience discovery
- experience selection
- admin-controlled categories
- extensible category schema
- initial categories: Travel, Event, Coffee, Explore, Talk, Movie, Food, Shopping, Photography

### Phase 6 — Booking Engine
- availability
- booking request
- confirmation
- booking state machine
- cancellation
- booking history
- notifications
- statuses: REQUESTED/PENDING_PAYMENT/CONFIRMED/ACTIVE/COMPLETED plus CANCELLED/DISPUTED/EXPIRED

### Phase 7 — Payments
- provider abstraction
- payment intent
- success/failure
- webhook handling
- refunds
- transaction records
- admin payment view
- server/webhook is authoritative for payment status

### Phase 8 — Chat
- booking-controlled conversation activation
- WebSocket
- messages
- read status
- attachments
- reports
- block
- conversation history

### Phase 9 — Chat Safety / Moderation
- phone/email/URL/social-handle detection
- WhatsApp/Telegram/Instagram/Facebook/X detection
- image OCR
- moderation events
- configurable enforcement
- admin-controlled rules

### Phase 10 — Admin Control
- dashboard
- users
- companions
- verification
- bookings
- payments
- messages
- reports
- reviews
- cities
- experiences
- content/CMS
- notifications
- settings
- feature flags
- audit logs
- analytics

### Phase 11 — Safety, Reliability & QA
- RBAC audit
- rate limiting
- abuse protection
- monitoring
- backups
- restore test
- error tracking
- automated tests
- security review
- performance testing

### Phase 12 — Production Launch
- domain
- HTTPS
- VPS
- GitHub deployment
- database
- backups
- monitoring
- email/SMS
- payment gateway
- legal/privacy/terms/safety
- support process

### Phase 13 — Post-Launch Stabilization
Prioritize bugs, crashes, booking/payment failures, chat issues, moderation false positives, performance, and user feedback.

### Phase 14 — Future Features
- AI companion matching
- AI recommendations
- advanced location matching
- subscriptions
- companion tiers
- referrals
- promotions
- loyalty
- wallet/credits
- dynamic pricing
- advanced fraud detection
- advanced analytics
- personalized home feed
- advanced moderation intelligence
- multi-city automation

## MVP definition

```text
Landing
+ Authentication
+ Companion Marketplace
+ Experience Marketplace
+ Verification
+ Booking
+ Payment
+ Booking-controlled Chat
+ Basic Safety
+ Admin Dashboard
+ Notifications
+ Reviews
+ Legal/Safety
```

Anything beyond MVP must not delay launch unless required for safety, legal compliance, or core reliability.

## Advanced module rule

Use feature flags for advanced modules, for example:

```text
ENABLE_AI_MATCHING=false
ENABLE_REFERRALS=false
ENABLE_SUBSCRIPTIONS=false
ENABLE_DYNAMIC_PRICING=false
```

Advanced modules must remain independent of the core launch path.
