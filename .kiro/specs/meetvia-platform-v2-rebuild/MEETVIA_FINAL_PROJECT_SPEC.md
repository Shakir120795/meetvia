# Meetvia — Final Project Specification (v1)

> Ye document ab tak hue poore discussion ka final consolidated output hai.
> Isko base bana ke existing repo ([Shakir120795/meetvia](https://github.com/Shakir120795/meetvia)) ko extend/overwrite karke naya feature-set build karna hai.
> Design principle: **Backend mein sab kuch ready rahega, Super Admin decide karega frontend pe kya visible hoga.**

---

## 1. Business Positioning (Legal Clarity — Core Foundation)

**Meetvia is a verified tourism-companionship and visitor-assistance platform.**
Primary audience: **Foreign tourists** (main focus). Secondary: local city residents needing local companionship for outings.

### Explicit Scope of Service (to go in Terms & Conditions, verbatim base)
- Meetvia sirf tourism/companionship assistance provide karta hai — city tours, translation, local guidance, airport/hotel pickup assistance.
- Koi bhi sexual, romantic, ya adult service platform par **strictly prohibited** hai.
- Companions verified professionals hain jo sirf listed Experience categories provide karte hain.

### Zero-Tolerance Clause (verbatim, legal page mein)
> "Any companion or user found soliciting, offering, or requesting sexual services through this platform will be immediately banned and, where applicable, reported to law enforcement authorities."

### Approved Taglines (Admin-Editable — see Section 12)
- "Your Trusted Local Guide & Travel Companion"
- "Explore Cities with Verified Local Companions"
- "Safe, Verified Companionship for Travelers"

**Note:** Final legal wording ko launch se pehle lawyer se review karwana hai (parked for later, per user).

---

## 2. Tech Stack (Final)

| Layer | Technology |
|---|---|
| Frontend | Next.js (React), Tailwind CSS |
| 3D Hero | React Three Fiber + drei (simple geometric shapes, mouse-parallax) |
| Backend | Node.js + Express + TypeScript |
| Database | **PostgreSQL** (migrated from MongoDB) |
| ORM | **Prisma** |
| Cache/Sessions/Locks | **Redis** |
| Containerization | Docker + docker-compose |
| Auth | JWT (stateless), OTP via Redis TTL |
| File Storage | Local (adapter pattern, S3/Cloudinary-ready) |
| Payment | Razorpay (gateway-abstracted) |
| Notifications | Email + In-app + WhatsApp Business API |

### Migration Note
Existing Mongoose models (Services, Cities, FAQs, Testimonials, HeroSlides, Legal Pages, Theme, Social Links) migrate to Prisma/Postgres schema before new feature work begins. CMS logic stays the same — only persistence layer changes.

---

## 3. Core Database Schema (Prisma Models — Conceptual)

### Identity & Access
```
User            (customer — id, name, email, phone, password_hash, auth_provider, provider_id, email_verified, phone_verified, is_verified)
Companion       (separate entity/login — id, name, email, phone, password_hash, bio, profile_photo, cityId, gender, languages_spoken[], serves_tourists, serves_locals, specialization_tags[], verification_status, verification_level, verification_expires_at, report_count, rating_avg, booking_mode, payout_frequency, is_active)
AdminUser       (id, name, email, password_hash, created_by, is_super_admin, is_active)
Permission      (id, key, label)
AdminRolePermission (adminUserId, permissionId)
OtpVerification (identifier, otp_code_hash, purpose, expires_at, is_used, attempt_count) — Redis-backed
```

### Verification
```
VerificationDocument (companionId, document_subtype [ID_PROOF/SELFIE_MATCH/ADDRESS_PROOF/CONSENT_FORM], file_url, status, reviewed_by, reviewed_at, rejection_reason, expiry_date)
```

### Marketplace / CMS (existing, extended)
```
City            (existing + is_tourist_hub, tourist_info)
Experience      (existing "Service" model extended + category, target_audience [TOURIST/LOCAL/BOTH], price_inr, price_usd)
CompanionExperience (companionId, experienceId, price, is_available)
MeetingPoint    (cityId, name, address, latitude, longitude, category [CAFE/HOTEL_LOBBY/TOURIST_SPOT/MALL/RESTAURANT], is_active) — admin-curated public-place-only list
```

### Booking & Payments
```
Booking (userId, companionId, companionExperienceId, cityId, meetingPointId, date, start_time, scheduled_end_time, actual_end_time,
          status [REQUESTED/PENDING_PAYMENT/CONFIRMED/ACTIVE/COMPLETED/CANCELLED/DISPUTED/EXPIRED],
          cancelled_by, cancellation_reason, refund_percentage_applied, overrun_flag,
          approved_by, approved_at, price, created_at)

BookingExtension (bookingId, requested_by, extra_hours, extra_price, status [PENDING/APPROVED/REJECTED], approved_by)

BookingCheckIn (bookingId, actor_type [USER/COMPANION], checkin_type [ARRIVAL/DEPARTURE], latitude, longitude, distance_from_meeting_point_meters, timestamp)

Payment (bookingId, amount, gateway, status [PENDING/PAID/REFUNDED/FAILED], transaction_id,
          platform_commission, companion_payout_amount, payout_status, payout_date)

CompanionPayout (companionId, period_start, period_end, total_bookings_included, total_amount, status, processed_at)
```

### Communication & Safety
```
Conversation (bookingId, mode [NONE/STRUCTURED_MESSAGES/FULL_CHAT snapshot], status [LOCKED/ACTIVE/CLOSED], unlocked_at, closed_at)
Message      (conversationId, sender_type, message_type [PREDEFINED/FREEFORM], content, flagged_reason, created_at)
PredefinedMessage (text, sender_type, is_active)
SafetyAlert  (bookingId, alert_type [LOCATION_MISMATCH/TIME_OVERRUN/NO_DEPARTURE_CHECKIN], status [OPEN/ACKNOWLEDGED/RESOLVED], created_at, resolved_by)
CompanionStrike (companionId, reason [CANCELLATION/NO_SHOW/REPORT], created_at)
```

### Trust & Content
```
Review   (bookingId, reviewer_type [USER/COMPANION], rating, text, is_reported, is_hidden, created_at)
Report   (reporter_type, reporter_id, target_type [PROFILE/BOOKING/MESSAGE], target_id, reason, status [OPEN/REVIEWED/RESOLVED])
CompanionMedia (companionId, media_type [PROFILE_PHOTO/GALLERY_PHOTO], file_url, status [PENDING_REVIEW/APPROVED/REJECTED], reviewed_by, reviewed_at)
```

### System / Admin Control
```
SiteFeatureToggle (key, value [JSON], is_enabled) — the central admin-control table, see Section 12
SEOMeta   (entity_type, entity_id, title, description, og_image)
Translation (entity_type, entity_id, locale, field_name, translated_text)
SupportTicket (raised_by_type, raised_by_id, category, subject, description, status, assigned_to)
AuditLog  (actor_type, actor_id, action, target_type, target_id, timestamp, ip_address)
NotificationTemplate (event_type, channel, subject, body_template, is_active)
Notification (recipient_type, recipient_id, type, title, message, is_read, channels_sent[], status_per_channel)
```

---

## 4. Authentication

- **Methods (all active at launch):** Email OTP, Google Login, Apple Login, WhatsApp OTP
- OTP stored in **Redis** with TTL (5-10 min), rate-limited, max 5 attempts
- Companion has a **fully separate login/table** from User — no shared identity
- Admin toggle: `login_methods_enabled` controls which methods are shown per platform

---

## 5. Search & Discovery

- **Backend implements ALL filters**: city, experience, date, language, gender_preference, price, rating, availability, distance, interests, accessibility, companion_type
- **Admin controls which filters are visible on frontend** via `search_filters_enabled` toggle
- **Launch default ON:** City, Experience, Date, Language, Gender Preference
- Indexes: `cityId`, `gender`, `languages_spoken`, `verification_status`

---

## 6. Pricing, Commission & Payouts

- Platform commission: **20%** (admin-adjustable via toggle)
- Companion sets own price per Experience (`CompanionExperience.price`)
- User sees total price (commission-inclusive); Companion dashboard shows net earning
- **Payout frequency: Companion's choice — Weekly or Monthly (no daily payouts)**
- Payout eligibility requires a buffer after `COMPLETED` status (dispute-safety window)
- Multi-currency (INR + USD) implemented in backend; **hidden on frontend for now**, admin can enable display later

---

## 7. Booking Flow, Cancellation & Refunds

### State Machine
```
REQUESTED → PENDING_PAYMENT → CONFIRMED → ACTIVE → COMPLETED
Alternate exits: CANCELLED, DISPUTED, EXPIRED
```

### Payment Timing — Admin Toggle
```
key: "payment_timing" → "PRE_CONFIRM" | "POST_CONFIRM"
```
Both flows implemented; admin switches globally. Recommended launch default: POST_CONFIRM (companion accepts first, reduces drop-off/fake-booking risk).

### Booking Mode — Admin Controlled (not companion-controlled)
```
Companion.booking_mode: "INSTANT" | "ADMIN_APPROVAL_REQUIRED"
```
- Approval decisions are made by **Admin or permitted Sub-Admin** (`approve_bookings` permission) — not by the companion.
- Global default set via `default_booking_mode` toggle; per-companion override possible.

### Cancellation & Refund Policy (Admin-Configurable)
```
key: "cancellation_policy"
value: {
  grace_period_minutes: 30,       // full refund within 30 min of booking creation, regardless of meetup proximity
  full_refund_hours: 24,          // 24+ hrs before meetup → 100% refund
  partial_refund_hours: 6,        // 6-24 hrs before meetup → 50% refund
  partial_refund_percent: 50,     // <6 hrs before meetup → 0% refund
}
```

### No-Show Handling
| Scenario | Result |
|---|---|
| Companion no-show | Full refund to user + Strike to companion |
| User no-show | No refund |
| Detection | Check-in button (both sides) + auto-DISPUTED on mismatch |

---

## 8. Availability & Meetup Safety

### Companion Availability
```
AvailabilitySlot (companionId, day_of_week/specific_date, start_time, end_time, is_recurring, status)
BlackoutDate     (companionId, date, reason)
```
- Recurring availability, blackout dates, booking buffer, travel buffer — all admin-default-configurable
- **Slot locking via Redis** (temp hold ~15 min on REQUESTED, auto-release if not confirmed) — prevents double-booking

### Meetup Location Safety
- **No freeform meeting addresses.** Booking must select from admin-curated `MeetingPoint` list (public places only: cafes, hotel lobbies, tourist spots, malls, restaurants) — enforces "public place only" T&C rule at the system level.
- **Check-in verification:** Both parties tap "I've Arrived" at meetup time → one-time GPS capture compared against the selected `MeetingPoint` (200m tolerance). Mismatch → warning → repeated mismatch → `SafetyAlert`.
- **No continuous location tracking** — only arrival/departure checkpoints (privacy-preserving).

### Duration Overrun Handling
- **Mutual extension:** Either party can request more time via `BookingExtension`; requires other party's approval + extra payment at companion's rate.
- **Unapproved overrun (Scenario B — confirmed):** If `scheduled_end_time` + grace period passes with no departure check-in and no approved extension → system auto-notifies both parties → if no response within a set window → `SafetyAlert` raised to Admin for review.

---

## 9. Communication System

```
key: "communication_mode" → "NONE" | "STRUCTURED_MESSAGES" | "FULL_CHAT"
```
- **NONE** — no conversation object created, no UI shown
- **STRUCTURED_MESSAGES** — predefined, admin-manageable message options only (e.g. "Running late", "Reached location") — zero freeform text, zero contact-leak risk
- **FULL_CHAT** — freeform text with multi-layer moderation:
  1. Normalize message (strip spaces/symbols/word-numbers) before scanning
  2. Regex + keyword detection for phone/email/social-handle patterns
  3. Real-time soft-block on detection + warning to sender
  4. Escalation: Warning → Restricted → Suspended (tracked via `CompanionStrike`/user equivalent)
  5. Auto chat-expiry after booking completion
- Conversation snapshots the mode active at booking-confirmation time, so admin changes don't retroactively affect in-progress bookings.
- Chosen for launch consideration: **STRUCTURED_MESSAGES recommended**, but all three fully built and switchable by Super Admin.

---

## 10. Verification System

- Multi-document: ID Proof, Selfie/Photo-Match, Address Proof (optional), Consent Form
- Verification tiers: **Basic** (ID confirmed) and **Premium** (ID + photo-match + consent + track record)
- Re-verification required annually (`verification_expires_at`)
- `rejection_reason` stored for transparency to companion
- Report-count threshold auto-triggers re-review

---

## 11. Admin Dashboard Structure

1. **Overview/Dashboard** — pending verifications, flagged messages, open reports, revenue snapshot
2. **Companions** — list, verification queue (approve/reject with reason), tier management
3. **Users** — list, booking history, suspend/ban
4. **Experiences** — CRUD, target_audience, category, pricing templates
5. **Meeting Points** — CRUD of admin-curated public locations per city
6. **Bookings** — list, detail/timeline, manual admin intervention, approval queue (for ADMIN_APPROVAL_REQUIRED mode)
7. **Payments & Payouts** — transactions, refunds, payout batches, revenue reports
8. **Communication/Moderation** — predefined messages, FULL_CHAT flagged queue, escalation levels
9. **Reports** — open/reviewed/resolved, action history
10. **Reviews** — moderation, dispute handling
11. **Support Tickets** — category-based queue, assignment
12. **Site Settings** — theme/colors, **Feature Toggles (Section 12)**, cities, legal pages, taglines
13. **Analytics** — bookings trend, popular cities/experiences, tourist vs local split

### Admin Roles — Dynamic RBAC
- **Super Admin** creates Admin/Sub-Admin accounts and assigns **granular permissions** (no fixed role list — fully custom per admin)
- Example permission keys: `manage_companions`, `review_verification`, `manage_bookings`, `approve_bookings`, `moderate_chat`, `manage_payments`, `manage_support`, `manage_site_settings`, `manage_meeting_points`, `view_analytics`
- Every privileged view (verification docs, flagged chats) is recorded in `AuditLog`

---

## 12. Central Admin Feature-Control System (`SiteFeatureToggle`)

**Governing principle for this entire build: backend implements every feature completely; Super Admin decides what is visible/active on the frontend, and can change it anytime without a code deploy.**

Confirmed toggle keys so far:

| Key | Purpose |
|---|---|
| `communication_mode` | NONE / STRUCTURED_MESSAGES / FULL_CHAT |
| `payment_timing` | PRE_CONFIRM / POST_CONFIRM |
| `default_booking_mode` | INSTANT / ADMIN_APPROVAL_REQUIRED |
| `search_filters_enabled` | array of which search filters show on frontend |
| `commission_percentage` | platform commission (default 20) |
| `cancellation_policy` | grace period, refund tiers |
| `availability_defaults` | booking/travel buffer, slot hold duration |
| `multi_currency_display` | show/hide USD alongside INR |
| `login_methods_enabled` | which auth methods are shown |
| `language_XX_enabled` | per-language i18n toggle |
| `data_retention_policy` | chat/doc/audit-log retention days |
| `ENABLE_REVIEWS`, `ENABLE_TWO_WAY_REVIEWS` | review system toggles |
| `ENABLE_MULTI_PHOTO_GALLERY` | companion gallery toggle |
| **`site_taglines`** | array of admin-approved taglines, admin picks active one(s), editable anytime |
| **`legal_scope_statement`** | the explicit "scope of service" text block used across legal pages / about / footer |

This table is the backbone of admin control — nearly every feature discussed above reads its visibility/behavior from here rather than from hardcoded logic.

---

## 13. Legal & Compliance

- Explicit **Scope of Service** and **Zero-Tolerance Clause** (Section 1) — content stored via `legal_scope_statement` toggle so admin can refine wording anytime pre-lawyer-review.
- Companion onboarding includes an explicit signed declaration: will only provide listed Experience categories, will meet only at platform-verified public MeetingPoints, will not solicit/offer adult services.
- `AuditLog` on all privileged data access (verification docs, flagged messages).
- No indefinite storage of precise location — only arrival/departure check-in points, governed by `data_retention_policy`.
- Report/flagging mechanism kept visible on homepage/footer (not buried).
- **Final legal wording to be reviewed by an India-based lawyer before public launch** (explicitly deferred by user — tracked here as an open item).

---

## 14. SEO, Support & DevOps

- SEO: per-page meta via `SEOMeta`, sitemap.xml, SEO-friendly city/experience URLs
- Support: `SupportTicket` model, category-based (booking/payment/safety/other), safety category triggers priority WhatsApp+email alert to admin
- Environments: local → staging → production (never develop directly on production)
- CI/CD: Git → CI → Tests → Build → Staging → QA → Production
- Backups: daily PostgreSQL backup + retention policy + **periodic restore tests** (a backup isn't valid until restore is verified)
- Monitoring: CPU/RAM/disk/DB/Redis/API errors/response time/SSL expiry/backup failures
- `.env` never committed; `.env.example` maintained

---

## 15. UI / Design Direction

- **Vibe:** Clean/Minimal foundation + Bold accents + Premium polish
- **Primary color:** Deep Teal (admin-editable via existing theme system, CSS-variable driven, no hardcoded colors)
- **Typography:** Serif accent headings + clean sans body
- **Hero:** React Three Fiber, simple floating geometric shapes, mouse-parallax, lightweight (2-4 shapes max)
- Fresh full redesign (not an incremental restyle) of the existing CMS-driven frontend

---

## 16. Open Items (Explicitly Deferred, Not Forgotten)

- [ ] Final legal T&C / Privacy Policy wording — lawyer review before launch
- [ ] VPS/hosting provider — parked, to revisit (Contabo/Hetzner/Hostinger compared)
- [ ] Exact WhatsApp Business API provider selection (Meta direct vs Twilio/Gupshup)

---

## 17. Build Approach Going Forward

1. Migrate existing Mongoose CMS models → Prisma/PostgreSQL (no functional change)
2. Set up Docker Compose (Postgres + Redis + backend + frontend)
3. Implement new schema (Sections 3–12) module by module, feature-flagged behind `SiteFeatureToggle` throughout
4. Rebuild frontend UI per Section 15 direction, wired to the same feature toggles
5. Every new module ships **admin-controllable** by default — this is the standing rule for all future feature work on this repo, not just what's listed here
