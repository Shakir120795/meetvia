# Meetvia — Agent Build Plan (Phased Execution Document)

> **For the coding agent reading this file:** This is the authoritative build plan for the Meetvia project.
> Read this entire file before writing any code. Then read the companion file `MEETVIA_FINAL_PROJECT_SPEC.md`
> in the same directory for full architectural/feature detail — this file tells you WHAT ORDER to build things in
> and WHEN each phase is considered done; the spec file tells you WHAT each thing should look like.
>
> **Golden rules for every phase:**
> 1. Work inside the **existing repository** (`meetvia`). Do not create a parallel/duplicate project. Extend and refactor the existing structure.
> 2. Before starting a phase, inspect the current repo state (folder structure, existing models, existing routes) so new work stays consistent with what already exists.
> 3. Do not skip ahead to a later phase before the current phase's "Definition of Done" is satisfied.
> 4. Every new feature must read its visibility/behavior from a `SiteFeatureToggle` entry wherever the spec says "admin-controlled" — never hardcode a behavior that the spec marks as admin-configurable.
> 5. Keep changes incremental and commit after each completed phase with a clear commit message referencing the phase number.
> 6. If the repo has existing tests (Jest/Supertest), do not break them. Add new tests for new modules.
> 7. Never invent business logic not covered in the spec file — if something is ambiguous, implement the simplest safe default and leave a `// TODO(spec-gap):` comment rather than guessing silently.
> 8. Work on a dedicated git branch (e.g. `feature/full-rebuild`), not directly on `main`.

---

## Phase 0 — Foundation & Database Migration

**Goal:** Move the project from MongoDB/Mongoose to PostgreSQL/Prisma and stand up the new infra, with zero functional change to existing features.

Tasks:
1. Add `docker-compose.yml` services: `postgres`, `redis` (alongside existing backend/frontend services if containerized already; otherwise containerize them too).
2. Install and configure Prisma in the backend.
3. Recreate all **existing** Mongoose models as Prisma models with equivalent fields: SiteSettings, Theme, HeroSlide, Service, City, FAQ, Testimonial, LegalPage, SocialLink, Media, Inquiry, CompanionApplication (or equivalent existing "companion application" entity).
4. Rewrite existing controllers to use Prisma Client instead of Mongoose queries. Keep API contracts (request/response shapes) identical — this is a persistence-layer swap only, not a feature change.
5. Set up `.env.example` with the variable list from the spec (Section 14 of the spec doc).
6. Verify all existing public API endpoints and admin CRUD endpoints still work exactly as before against Postgres.
7. Set up basic CI (GitHub Actions) running lint + tests on push.

**Definition of Done:**
- App runs fully on Docker Compose with Postgres + Redis, no MongoDB dependency remains.
- All pre-existing endpoints return identical shapes/behavior to before migration.
- Existing tests (if any) pass; new tests cover the migrated CRUD paths.

---

## Phase 1 — Authentication System (User, Companion, Admin)

**Goal:** Build the three separate identity systems.

Tasks:
1. Implement `User` model + Email OTP flow (OTP generated, hashed, stored in Redis with TTL, rate-limited, max attempt count).
2. Implement Google and Apple OAuth login for `User`.
3. Implement WhatsApp OTP login (behind an abstraction layer so the provider can be swapped later — see spec Section 9/14 notification abstraction).
4. Implement a **separate** `Companion` login (its own table, its own JWT scope) — do not merge with `User`.
5. Implement `AdminUser` + dynamic RBAC: `Permission` and `AdminRolePermission` tables, middleware that checks a required permission key per admin route.
6. Implement the `SiteFeatureToggle`-driven `login_methods_enabled` control so the frontend only shows enabled methods.
7. Add `AuditLog` writes for admin authentication events.

**Definition of Done:**
- All four login methods work for User; Companion has fully separate auth; Admin RBAC blocks/allows routes correctly based on assigned permissions.
- Super Admin can create a new Admin and assign specific permissions, and that admin's dashboard only shows permitted sections.

---

## Phase 2 — Companion Profiles & Verification

**Goal:** Companion onboarding and the verification pipeline.

Tasks:
1. Companion profile fields per spec (bio, city, languages_spoken, gender, serves_tourists/serves_locals, specialization_tags).
2. `VerificationDocument` model + upload flow (ID Proof, Selfie/Photo-Match, Address Proof, Consent Form).
3. Admin verification queue UI/API: approve/reject with `rejection_reason`.
4. Verification tiers: Basic / Premium, with `verification_expires_at` and a scheduled job to flag expired verifications for re-review.
5. `CompanionMedia` model with PENDING_REVIEW/APPROVED/REJECTED photo moderation flow.
6. Companion onboarding must include the explicit signed declaration text from spec Section 13.

**Definition of Done:**
- A companion can apply, upload documents/photos, and see status change as admin reviews.
- Verified companions display a tier badge; unverified/expired companions are excluded from public search.

---

## Phase 3 — Experiences, Cities & Search/Discovery

**Goal:** Extend the existing CMS "Service" concept into the full Experience marketplace with admin-controlled filters.

Tasks:
1. Extend `Experience` model (category, target_audience, price_inr, price_usd) — build on the existing Service CRUD, don't duplicate it.
2. `CompanionExperience` join model (companion-set pricing per experience).
3. Extend `City` model (is_tourist_hub, tourist_info).
4. Build search/filter API supporting **all** filters from the spec (city, experience, date, language, gender_preference, price, rating, availability, distance, interests, accessibility, companion_type) — implement all of them in the query layer.
5. Implement `SiteFeatureToggle` key `search_filters_enabled` and have the frontend read it to decide which filter UI to render. Launch default: city, experience, date, language, gender_preference = ON.
6. Add necessary Postgres indexes (cityId, gender, languages_spoken, verification_status).

**Definition of Done:**
- Full filter set works end-to-end via API even if hidden on frontend.
- Admin can toggle a filter and it appears/disappears on the search UI without a deploy.

---

## Phase 4 — Meeting Points & Availability

**Goal:** Admin-curated public meetup locations and companion scheduling.

Tasks:
1. `MeetingPoint` CRUD (admin-only) per city, with category and coordinates.
2. `AvailabilitySlot` (recurring + specific-date) and `BlackoutDate` for companions.
3. Booking/travel buffer settings via `availability_defaults` toggle.
4. Redis-based temporary slot locking (hold ~15 min on booking REQUESTED, auto-release if not confirmed).

**Definition of Done:**
- Companion can set a weekly recurring schedule and blackout dates.
- Two simultaneous booking attempts on the same slot cannot both succeed (race condition test passes).
- Booking creation only allows selecting a `MeetingPoint` from the curated list — no freeform address field exists in the booking form.

---

## Phase 5 — Booking Engine

**Goal:** The full booking state machine.

Tasks:
1. Implement `Booking` model with full status enum: REQUESTED, PENDING_PAYMENT, CONFIRMED, ACTIVE, COMPLETED, CANCELLED, DISPUTED, EXPIRED.
2. Implement `payment_timing` toggle (PRE_CONFIRM / POST_CONFIRM) and branch booking creation logic accordingly from a single service function (no duplicated logic paths).
3. Implement `default_booking_mode` (INSTANT / ADMIN_APPROVAL_REQUIRED) with per-companion override; approval action is restricted to Admin/Sub-Admin with `approve_bookings` permission — companions cannot self-approve.
4. Implement auto-EXPIRED transition if a companion (or admin, in approval mode) does not act within a configurable timeout.
5. Implement cancellation logic reading `cancellation_policy` toggle (grace_period_minutes, full_refund_hours, partial_refund_hours, partial_refund_percent) exactly as specified.
6. Implement no-show handling rules (companion no-show → full refund + strike; user no-show → no refund), tied to check-in data from Phase 6.

**Definition of Done:**
- Full booking lifecycle testable end-to-end for both PRE_CONFIRM and POST_CONFIRM modes.
- Cancellation refund percentage calculated correctly for all documented time windows including the 30-minute grace period.
- Admin can flip `payment_timing` and `default_booking_mode` toggles and see behavior change without redeploy.

---

## Phase 6 — Meetup Safety (Check-in, Extensions, Overrun Alerts)

**Goal:** Real-world meetup verification and duration-overrun handling.

Tasks:
1. `BookingCheckIn` (ARRIVAL/DEPARTURE) with one-time GPS capture and distance-from-meeting-point calculation (200m tolerance rule).
2. Mismatch handling: warning to user on first mismatch; repeated mismatch creates a `SafetyAlert` (type LOCATION_MISMATCH).
3. `BookingExtension` flow: either party requests extra time, other party approves, extra payment triggered, booking's scheduled_end_time updated.
4. Scheduled background job: if `scheduled_end_time` + grace period has passed with no DEPARTURE check-in and no approved extension, notify both parties; if no response within the configured window, raise a `SafetyAlert` (type TIME_OVERRUN / NO_DEPARTURE_CHECKIN) visible in the admin dashboard.

**Definition of Done:**
- Simulated test: booking overruns its scheduled time with no extension → SafetyAlert appears in admin queue within the expected window.
- Simulated test: check-in from a location far from the selected MeetingPoint triggers the mismatch flow.

---

## Phase 7 — Payments, Commission & Payouts

**Goal:** Money flow, correctly and safely.

Tasks:
1. Payment provider abstraction (Razorpay first implementation).
2. Payment intent creation, webhook handling (server/webhook is the source of truth for payment status — never trust frontend-reported status).
3. `commission_percentage` toggle (default 20) applied to compute `platform_commission` / `companion_payout_amount` on each Payment.
4. `CompanionPayout` batch job respecting each companion's chosen `payout_frequency` (WEEKLY or MONTHLY only — no daily payout option should exist in the UI or scheduler).
5. Payout eligibility must respect a post-completion buffer window (do not include a booking in a payout batch until its dispute-safety window has passed).
6. Admin payment/payout views (transactions, refunds, revenue reports).

**Definition of Done:**
- End-to-end payment flow works with test/sandbox credentials.
- A completed booking's commission split is calculated and stored correctly.
- Payout batching correctly groups only eligible, non-disputed bookings per companion's chosen frequency.

---

## Phase 8 — Communication System

**Goal:** Booking-scoped, admin-controlled messaging.

Tasks:
1. `Conversation` + `Message` models; conversation created on booking CONFIRMED, snapshotting the currently-active `communication_mode`.
2. Implement all three modes fully: NONE (no conversation UI at all), STRUCTURED_MESSAGES (predefined messages only, admin-managed via `PredefinedMessage`), FULL_CHAT (freeform with moderation).
3. FULL_CHAT moderation pipeline: normalize message text → regex/keyword scan for contact-info patterns → real-time soft-block with warning → escalation levels tracked (warning/restricted/suspended) → auto chat-expiry after booking completion.
4. `communication_mode` toggle drives which mode is active for new bookings; existing bookings keep their snapshot mode.

**Definition of Done:**
- Switching the toggle changes behavior only for new bookings, not retroactively.
- FULL_CHAT moderation test: a message containing an obfuscated phone number (e.g. spaced digits) is correctly blocked.
- STRUCTURED_MESSAGES mode rejects any freeform text attempt at the API level, not just the UI level.

---

## Phase 9 — Reviews, Reports & Moderation

Tasks:
1. `Review` model — only creatable against a COMPLETED booking, one review per (booking, reviewer_type) pair. Two-way reviews (User↔Companion) both supported, gated by `ENABLE_REVIEWS` / `ENABLE_TWO_WAY_REVIEWS` toggles.
2. `Report` model with target types PROFILE/BOOKING/MESSAGE, admin resolution workflow.
3. Review dispute flow (companion can flag a review as unfair; admin can hide, not delete, a review — audit trail preserved).

**Definition of Done:**
- A user cannot review a booking that isn't COMPLETED or that they don't own.
- Admin can hide a disputed review and it disappears from public display while remaining in the database with a hidden flag and audit entry.

---

## Phase 10 — Admin Dashboard (Full Build-Out)

**Goal:** Every module above needs an admin UI, unified.

Tasks: Build out all dashboard sections per spec Section 11 (Overview, Companions, Users, Experiences, Meeting Points, Bookings, Payments & Payouts, Communication/Moderation, Reports, Reviews, Support Tickets, Site Settings, Analytics), gated by the RBAC permission system from Phase 1.

Special sub-task: build the **Feature Toggle management screen** — a single UI area where Super Admin can see and edit every `SiteFeatureToggle` key listed in spec Section 12, including `site_taglines` and `legal_scope_statement`, without needing separate custom screens per toggle wherever reasonably generic (a generic JSON/typed-form editor per toggle key is acceptable).

**Definition of Done:**
- Every backend module built in Phases 1-9 has a working corresponding admin screen.
- A newly created Sub-Admin with only 2 permissions sees only those 2 sections in the dashboard nav.
- Super Admin can change any toggle (including taglines/legal text) and see it reflected on the public frontend without a redeploy.

---

## Phase 11 — Notifications

Tasks:
1. `Notification` + `NotificationTemplate` models.
2. Channel implementations: Email (Nodemailer/Resend/SMTP), In-app (DB-driven), WhatsApp (Business API, behind a provider-abstraction layer).
3. Wire up all events from the spec: booking confirmed/rejected, payment success/failed, verification approved/rejected, new booking request, new report, flagged message, delayed/structured-message updates, booking reminders.

**Definition of Done:**
- Each listed event fires a notification through the correct channel(s) to the correct recipient type, using an editable template.

---

## Phase 12 — Frontend UI Rebuild & 3D Hero

**Goal:** Full visual redesign per spec Section 15, built on top of (not replacing) the CMS data layer.

Tasks:
1. Establish the design system: CSS variables for colors (Deep Teal primary, off-white base, warm charcoal contrast), typography (serif headings + clean sans body), all sourced from the existing/extended Theme settings — never hardcode colors.
2. Rebuild core pages (home, search/discovery, companion profile, booking flow, city pages) in the new visual direction.
3. Build the Hero section using React Three Fiber + drei: 2-4 simple floating geometric shapes, mouse-parallax and subtle scroll movement, kept lightweight for mobile performance.
4. Wire every UI element that the spec marks admin-controlled (filters, communication mode UI, currency display, taglines, language switcher) to read from the relevant `SiteFeatureToggle`.

**Definition of Done:**
- Lighthouse performance score on the hero page remains acceptable on a mid-tier mobile device (no jank from the 3D scene).
- Visual QA against the agreed direction (clean/minimal + bold + premium, teal accent).
- Every admin toggle changes the frontend without requiring a rebuild/redeploy.

---

## Phase 13 — SEO, Legal Pages & Support

Tasks:
1. `SEOMeta` per entity, sitemap.xml generation, SEO-friendly URLs for city/experience/companion pages.
2. Legal pages populated with the Scope of Service + Zero-Tolerance Clause language from spec Section 1/13 (sourced from `legal_scope_statement` toggle, editable by admin), flagged clearly for pending lawyer review before public launch.
3. `SupportTicket` system with category-based routing; SAFETY category triggers a priority WhatsApp+email alert to admin.

**Definition of Done:**
- Legal pages render the current admin-set scope/tagline text.
- A safety-category support ticket triggers an immediate notification to admin (not just queued silently).

---

## Phase 14 — DevOps, i18n/Currency Infra & Launch Readiness

Tasks:
1. i18n infrastructure (`Translation` model + next-intl or next-i18next) implemented and functional, but only English enabled by default at launch (`language_XX_enabled` toggles for others left OFF, ready to flip).
2. Multi-currency backend fully functional (`price_inr`/`price_usd`), `multi_currency_display` toggle OFF by default.
3. Staging environment stood up, CI/CD pipeline (Git → CI → Tests → Build → Staging → QA → Production).
4. Daily automated PostgreSQL backups with a scheduled restore test (a backup is not considered valid until a restore has been verified).
5. Monitoring for CPU/RAM/disk/DB/Redis/API errors/response time/SSL expiry/backup failures.
6. Run through the full production checklist from spec Section 14 before go-live.

**Definition of Done:**
- A restore-from-backup has been performed successfully at least once in staging.
- Full production checklist items are all checked off.
- App is live on the chosen VPS with HTTPS, secure cookies, monitoring and alerting active.

---

## Post-Launch Standing Rule

Every feature built **after** this plan is completed must still follow the core governing principle from the spec: implement fully in the backend, gate visibility/behavior through a `SiteFeatureToggle`, and let the Super Admin control it from the dashboard. This is not a one-time instruction — it applies to all future work on this repository.
