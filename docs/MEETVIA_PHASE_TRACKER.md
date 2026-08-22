# MeetVia — Phase Implementation Tracker

**Branch:** `migration-stage-0`

**Rule:** A phase is COMPLETE only after frontend + backend/API + database + admin (where applicable) + integration + code-level acceptance are complete. Final VPS deployment happens after the full project build and is not a prerequisite for continuing implementation.

## Current status

| Phase | Specification | Current status | Notes |
|---|---|---|---|
| 0 | Documentation & Repository | 🟡 Foundation exists | Repo, environments, Prisma/PostgreSQL and MeetVia docs foundation exist; documentation path cleanup and final QA remain. |
| 1 | Website Foundation | 🟡 IMPLEMENTATION COMPLETE / VERIFICATION PENDING | Full-stack acceptance pass implemented. Final automated CI/build/test verification is still required before the phase gate can be closed. |
| 2 | Authentication | 🟡 Foundation exists | User/session/OTP/role schema and auth foundation exist; Phase 2 remains locked until Phase 1 acceptance closes. |
| 3 | Companion Marketplace | ❌ Not complete | Schema/foundation exists; later marketplace requirements remain. |
| 4 | Companion Verification | ❌ Not complete | Verification workflow remains. |
| 5 | Experience Marketplace | ❌ Not complete | Experience model/foundation exists; complete marketplace remains. |
| 6 | Booking Engine | ❌ Not complete | Booking state machine, availability and notifications remain. |
| 7 | Payments | ❌ Not complete | Provider integration, webhook authority, refunds and admin view remain. |
| 8 | Chat | ❌ Not complete | Booking-controlled realtime chat remains. |
| 9 | Safety / Moderation | ❌ Not complete | Detection, moderation, reports and enforcement remain. |
| 10 | Admin Control | 🟡 Foundation exists | Full operational admin remains a later phase. |
| 11 | Safety, Reliability & QA | ❌ Not complete | Full project QA remains after feature phases. |
| 12 | Production Launch | ⏳ Later | Final VPS/domain/HTTPS/deployment happens after the full project build. |
| 13 | Post-Launch Stabilization | ⏳ Future | Starts after production launch. |
| 14 | Future Features | ⏳ Future | AI, referrals, subscriptions, wallet, dynamic pricing, advanced analytics, etc. |

## Phase 1 acceptance pass

### Public website / frontend
- MeetVia navbar, responsive mobile navigation and theme toggle retained.
- Futuristic hero retains animated orbit/depth treatment and visible CMS slides.
- Hero now provides city, experience, date and time discovery controls and routes the complete selection to `/companions`.
- Companion marketplace consumes the discovery parameters and exposes matching city/experience/availability filters.
- Companion preview cards now link directly to live companion profiles.
- How It Works, Safety, Services, Become a Companion, About, Cities, FAQ, Testimonials and Contact sections remain integrated with loading/empty/error behavior where applicable.
- Services now use canonical Prisma `id` values and render their CMS-defined CTA text/link.
- Contact form now uses CMS service options and CMS safety acknowledgement text, validates inline, preserves values on failure, shows a clear success state and provides the WhatsApp continuation CTA.
- Companion application and public social/footer/FAQ/testimonial consumers use canonical `id` identifiers.
- Legacy GoWith utility-class branding was removed from the public visual layer.

### Backend / API / PostgreSQL
- Prisma/PostgreSQL remains authoritative for CMS and companion data.
- Public companion search now supports `q`, city, experience/category, date and time availability filters.
- Date/time discovery maps to the companion availability weekday/time window.
- Existing contact inquiry persistence and Telegram notification isolation remain intact.
- Existing admin CMS controllers continue to use canonical Prisma `id` contracts.

### Admin / CMS
- Hero CMS supports create/edit/visibility/delete/reorder using Prisma `id`.
- FAQ, Services, Cities and Testimonials admin identifier contracts are aligned to Prisma `id`.
- Site settings remain the source for contact/WhatsApp/safety acknowledgement content.
- CMS-backed public sections retain their empty/error/loading handling.

### Automated acceptance added
- Companion discovery API filter tests added.
- Phase 1 GitHub Actions workflow added for backend Prisma generation + typecheck/build/tests and frontend lint/build.

## Remaining Phase 1 gate

The implementation pass above is complete, but Phase 1 **MUST NOT** be marked COMPLETE until the repository verification gate passes:

- GitHub Actions backend job passes.
- GitHub Actions frontend job passes.
- No remaining Phase 1 acceptance failures.
- Final manual/browser verification is performed by the developer on the local build.

## Phase advancement gate

Do not start Phase 2 implementation until the Phase 1 verification gate above passes.
