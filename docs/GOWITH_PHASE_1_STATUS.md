# GoWith Stage 1 — Core Marketplace

Status: IN PROGRESS

## Scope

- Branding / GoWith homepage
- Customer authentication
- Users / profiles
- Companion registration and profile
- Companion verification
- Destinations
- Experiences
- Search / discovery
- Booking
- Payment foundation
- Controlled chat
- Basic safety
- Reviews
- Admin controls

## Completed in this build pass

- GoWith-oriented visual direction and 3D hero foundation
- User / role / profile / social-account / session / OTP Prisma models
- OTP hashing and generation helpers
- Customer OTP request/verification controller
- Customer OTP validation schemas
- Customer auth route module

## Still required before Stage 1 is complete

- Mount customer auth route in server
- Prisma migration execution/verification
- Session authentication middleware for customer APIs
- Companion marketplace models/APIs/UI
- Verification workflow
- Destination/experience models/APIs/UI
- Search/discovery
- Booking state machine
- Payment foundation
- Booking-gated chat
- Basic safety/report/block
- Reviews
- Customer/companion dashboards
- Admin controls and audit coverage
- Local automated tests, lint and production build verification

Do not mark Stage 1 complete until every item above is implemented and verified.
