# GoWith — Master Project Prompt

## 1. Project Identity

**Product name:** GoWith  
**Core tagline:** **Find someone to go with.**

GoWith is a **Companion Marketplace + Experience Marketplace**.

The product must NOT feel like a generic marketplace, classifieds website, dating app, or simple booking directory.

The core product idea is:

> A user chooses where they are going, what they want to do, and when. GoWith helps them find a suitable verified companion.

Examples of experiences:
- Travel
- Event
- Coffee
- Explore
- Talk / Conversation
- Movie
- Food
- Shopping
- Photography

The experience catalog must remain admin-controlled so new categories can be added later without rebuilding the frontend.

---

## 2. Critical Product Rule

The website/app must be **clean, premium, minimal and futuristic**.

Do not overload users with text, cards, filters or information.

The UI should communicate the product visually first.

Primary CTA:

> **Find someone to go with.**

---

## 3. Current Homepage Direction

Homepage order:

1. Futuristic intro / reveal
2. Main hero
3. Browse Companions
4. Trust / safety highlights
5. How It Works
6. About GoWith
7. Contact Us
8. Footer

### Futuristic intro

Dark futuristic environment with:
- subtle city silhouette
- particles
- grid
- orbital/ring effects
- cinematic glow
- minimal status indicators

Headline:

> Sometimes, you just need someone.

Supporting message:

> Discover verified companions for the places, moments and experiences you don't want to experience alone.

CTA:

> FIND SOMEONE TO GO WITH

### Main hero

Main headline:

> Find someone  
> to go with.

Supporting copy:

> Verified companions for the moments you don't want to experience alone.

Discovery controls:
- Where are you going?
- What are you looking for?
- When?

Example:
- Delhi
- Travel
- Today

Quick experience options:
- Travel
- Event
- Coffee
- Explore
- Talk

CTA:

> FIND MY COMPANION

Right side:
- futuristic city environment
- phone/app preview
- companion visual
- Verified card
- rating card

---

## 4. Navigation

Current main navigation:

- Home
- Browse
- How It Works
- About
- Contact
- Become a Companion

Right:
- Log in
- Sign up

Do not put Help or Safety in the primary navigation.

Those belong in the footer / support area.

---

## 5. Marketplace Model

There are two connected marketplace concepts:

### Companion Marketplace

Users discover:
- companion profiles
- city
- availability
- experience interests
- ratings
- verification status
- profile information allowed by platform policy

### Experience Marketplace

Users discover:
- Travel
- Event
- Coffee
- Explore
- Talk
- Movie
- Food
- Shopping
- Photography
- future categories

Experience categories are data-driven and admin controlled.

Never hard-code the entire category system into the UI.

---

## 6. Authentication

Customer login must support:

### Primary
- Mobile number + OTP

### Optional social login
- Google
- Facebook
- Apple

Social login identifies the account.

**Important: social login does NOT automatically make a companion verified.**

---

## 7. Companion Verification

Companion verification is a separate process.

A companion must submit the platform verification form.

Possible verification data:
- identity details
- profile information
- required documents
- profile photos
- city
- availability
- experience categories
- other compliance fields configured by admin

Verification states:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
NEEDS_CHANGES
APPROVED
REJECTED
SUSPENDED
```

Only approved companions receive the public:

> ✓ Verified

badge.

Verification rules must be configurable from admin.

---

## 8. Booking

Booking is the event that controls access to communication.

Basic lifecycle:

```text
REQUESTED
PENDING_PAYMENT
CONFIRMED
ACTIVE
COMPLETED
CANCELLED
DISPUTED
EXPIRED
```

### Critical chat rule

**Chat must NOT be available before the booking's active time.**

Chat becomes available only when:
- booking is confirmed
- booking start time has arrived
- booking is not cancelled/suspended

When the active window ends, chat access can become read-only or follow the platform's retention policy.

---

## 9. Chat & Contact Protection

Users may attempt to share:
- mobile numbers
- WhatsApp numbers
- Instagram handles
- Facebook profiles
- Telegram usernames
- email addresses
- external social links
- QR codes
- screenshots containing social handles

The platform must have a communication safety layer.

### Text detection

Detect patterns such as:
- phone numbers
- emails
- URLs
- social usernames
- WhatsApp links
- Telegram links
- Instagram/Facebook/X links

Action should be configurable:
- allow
- warn
- mask
- block
- flag for moderation

### Image detection

Images sent in chat should optionally pass through:
1. image safety/moderation check
2. OCR
3. social/contact information detection

If OCR detects a prohibited contact detail:
- configurable mask/block/warn
- create moderation event
- preserve evidence according to retention policy

Do not rely only on client-side filtering.

All enforcement must also happen server-side.

---

## 10. Admin Chat Access

Admin/moderator dashboard must be able to:
- search users
- search companions
- open conversations
- inspect messages
- inspect moderation events
- delete prohibited messages
- suspend users
- block communication
- export audit information where permitted

**Admin message editing is NOT required.**

Every moderation action must create an audit log.

Users should see appropriate moderation/system indicators when a message is removed.

Admin access to private communications must be role-based and audited.

---

## 11. Customer Data

Customer accounts should support storing:
- user ID
- mobile number
- social provider IDs where applicable
- name
- profile data
- location data where consented/required
- booking history
- verification/risk status
- timestamps

Location handling must follow privacy and consent requirements.

Do not store precise location indefinitely unless there is a legitimate product requirement and retention policy.

---

## 12. Admin Control

The admin panel is a first-class product.

Admin should eventually control:

### Content
- homepage sections
- banners
- text
- FAQs
- experience categories
- cities
- featured companions
- footer links

### Companions
- approve/reject verification
- suspend/unsuspend
- edit allowed profile fields
- availability
- pricing/configuration
- featured status

### Users
- search
- view profile
- suspend
- risk flags
- booking history

### Bookings
- search
- status
- payment state
- cancellations
- disputes

### Chat
- moderation
- message removal
- conversation access
- flags
- reports

### Platform settings
- booking rules
- chat activation rules
- moderation rules
- verification rules
- notification templates
- experience categories
- city availability

### Analytics
- users
- companions
- bookings
- revenue
- conversion
- cancellations
- disputes
- moderation events

---

## 13. Hidden / Future Features

The architecture must support future features without exposing them in the current client UI.

Examples:
- advanced experience matching
- AI companion matching
- recommendation engine
- dynamic pricing
- subscriptions
- companion tiers
- loyalty
- wallet/credits
- advanced location matching
- real-time availability
- referral system
- promotions
- advanced fraud detection
- AI moderation
- OCR-based social-contact detection
- advanced analytics

Do not build all future features now.

Build extension points and feature flags.

---

## 14. Engineering Principle

The project must be developed as a real production system, not as a prototype glued together.

Required principles:
- modular architecture
- API versioning
- typed contracts
- validation
- RBAC
- audit logging
- secure file storage
- server-side authorization
- rate limiting
- structured logging
- error handling
- automated tests
- migrations
- backups
- monitoring
- feature flags
- environment configuration
- CI/CD

Never put secrets in frontend code.

Never trust client-side authorization.

---

## 15. AI Coding Instructions

When using Kiro, Claude Code, Codex, Cursor, or another coding agent:

1. Read all project documentation first.
2. Do not rebuild the project from scratch.
3. Inspect the current repository before modifying anything.
4. Preserve existing decisions.
5. Ask before making architecture-breaking changes.
6. Make small, testable changes.
7. Run tests/build/lint after changes.
8. Update documentation when architecture changes.
9. Never silently remove existing features.
10. Never expose hidden/future features without explicit instruction.
11. Keep UI responsive.
12. Keep backend authorization server-side.
13. Add database migrations for schema changes.
14. Add audit logs for privileged actions.
15. Do not hard-code business rules that should be admin-configurable.

---

## 16. Definition of Done

A feature is not complete until:
- UI works
- mobile layout works
- API works
- validation exists
- authorization exists
- database migration exists if needed
- error states exist
- loading states exist
- tests exist
- logs are meaningful
- documentation is updated
- build passes
- lint passes
- no secrets are committed
