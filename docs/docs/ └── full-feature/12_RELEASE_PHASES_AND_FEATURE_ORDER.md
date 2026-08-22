# GoWith — Release Phases & Feature Order

## Main Objective

GoWith should go live as quickly as possible with the **core product complete and stable**.

Future/advanced features must NOT delay the first production launch.

## Golden Rule

Build in this order:

```text
Foundation
   ↓
Authentication
   ↓
Companion Marketplace
   ↓
Experience Marketplace
   ↓
Verification
   ↓
Booking
   ↓
Payment
   ↓
Chat
   ↓
Safety / Moderation
   ↓
Admin Control
   ↓
Notifications
   ↓
Testing
   ↓
Production
   ↓
Future Features
```

---

# PHASE 0 — Documentation & Repository

Goal: create the project skeleton.

Build:
- GitHub repository
- branch strategy
- monorepo structure
- coding rules
- environment system
- CI
- documentation
- design system foundation

Do NOT build advanced features.

---

# PHASE 1 — Website Foundation

Build:
- GoWith landing page
- futuristic intro
- final hero
- Browse Companions preview
- How It Works
- About
- Contact
- footer
- responsive design

Goal:

> A polished public website that can already be shown to clients/investors.

---

# PHASE 2 — Authentication

Build:
- mobile OTP
- session
- logout
- Google login
- Facebook login
- Apple login
- user profile
- basic roles

Goal:

Every customer can be uniquely identified.

---

# PHASE 3 — Companion Marketplace

Build:
- companion onboarding
- companion profile
- city
- experience categories
- pricing
- availability
- photos
- rating foundation
- search
- filters
- profile page

Goal:

A real customer can discover companions.

---

# PHASE 4 — Companion Verification

Build:
- verification form
- document upload
- verification state machine
- admin review
- approve/reject/request changes
- verified badge
- suspension

Goal:

Only approved companions appear as verified.

---

# PHASE 5 — Experience Marketplace

Build:
- experience categories
- city/experience discovery
- experience selection
- admin-controlled categories
- future-ready category schema

Initial categories:

```text
Travel
Event
Coffee
Explore
Talk
Movie
Food
Shopping
Photography
```

The database must allow adding new categories without code changes.

---

# PHASE 6 — Booking Engine

Build:
- availability
- booking request
- booking confirmation
- booking state machine
- cancellation
- booking history
- notifications

State machine:

```text
REQUESTED
→ PENDING_PAYMENT
→ CONFIRMED
→ ACTIVE
→ COMPLETED
```

Alternative exits:

```text
CANCELLED
DISPUTED
EXPIRED
```

---

# PHASE 7 — Payments

Build:
- payment provider abstraction
- payment intent
- success/failure
- webhook handling
- refunds
- transaction records
- admin payment view

Never trust frontend payment status.

Server/webhook is authoritative.

---

# PHASE 8 — Chat

Build only after booking exists.

Rules:

```text
No confirmed booking → chat locked

Confirmed booking
+
start time reached
+
accounts active
→ chat enabled
```

Build:
- WebSocket
- messages
- read status
- attachments
- reports
- block
- conversation history

---

# PHASE 9 — Chat Safety

Build:
- phone detection
- email detection
- URLs
- social handles
- WhatsApp
- Telegram
- Instagram
- Facebook
- X
- image OCR
- moderation events
- configurable enforcement

Do not make detection rules hard-coded.

Admin must control them.

---

# PHASE 10 — Admin Dashboard

Build the operational control panel.

Sections:

```text
Dashboard
Users
Companions
Verification
Bookings
Payments
Messages
Reports
Reviews
Cities
Experiences
Content
Notifications
Settings
Feature Flags
Audit Logs
Analytics
```

Goal:

Admin should be able to operate the platform without database editing.

---

# PHASE 11 — Safety, Reliability & QA

Build:
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

---

# PHASE 12 — Production Launch

Launch only the features marked:

```text
MVP = REQUIRED
```

Do not wait for future features.

Production launch checklist:
- domain
- HTTPS
- VPS
- GitHub deployment
- database
- backups
- monitoring
- email/SMS
- payment gateway
- legal pages
- privacy
- terms
- safety
- support process

---

# PHASE 13 — Post-Launch Stabilization

For the first period after launch:

Focus on:
- bugs
- crashes
- booking failures
- payment failures
- chat issues
- moderation false positives
- performance
- user feedback

Do NOT immediately start adding many new features.

---

# PHASE 14 — FUTURE FEATURES

Only after the core system is stable.

Future features:

```text
AI companion matching
AI recommendations
Advanced location matching
Subscriptions
Companion tiers
Referral system
Promotions
Loyalty
Wallet / credits
Dynamic pricing
Advanced fraud detection
Advanced analytics
Personalized home feed
AI moderation improvements
QR/social-contact detection
Multi-city expansion automation
```

These must be implemented as independent modules.

## Feature Flag Rule

Future features should be hidden behind:

```text
FeatureFlag
```

Example:

```text
ENABLE_AI_MATCHING=false
ENABLE_REFERRALS=false
ENABLE_SUBSCRIPTIONS=false
ENABLE_DYNAMIC_PRICING=false
```

This allows development without exposing incomplete features.

---

# MVP Definition

MVP is:

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

Anything beyond this is not allowed to delay launch unless it is required for safety, legal compliance or core reliability.
