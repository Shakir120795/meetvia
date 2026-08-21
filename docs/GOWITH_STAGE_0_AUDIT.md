# GoWith Stage 0 — Existing Meetvia Audit

## Baseline

- Repository: `Shakir120795/meetvia`
- Default branch: `main`
- Baseline commit: `665ec63d119fc5c22bfcb776b0b49f6db0f7239b`
- Baseline commit message: `Initial Meetvia commit`

## Existing Architecture

### Backend

- Express.js + TypeScript API
- Prisma ORM
- PostgreSQL datasource
- JWT-based admin authentication
- Joi validation
- Jest + Supertest + fast-check
- Local media upload layer
- Versioned API under `/api/v1`

The repository package configuration confirms Prisma/PostgreSQL dependencies and test/build scripts. `schema.prisma` defines the current PostgreSQL schema. 

### Frontend

The repository contains a Next.js/React frontend and existing Kiro platform specifications. The README describes the frontend as Next.js 16 + React 19 + Tailwind CSS + Framer Motion + GSAP.

### Admin

Current admin routes/controllers cover authentication, dashboard, media, site settings, theme, hero slides, services, FAQ, testimonials, cities, pages, footer, social links, inquiries, companion applications, and How It Works.

## Current Database Foundation

Current Prisma models include:

- AdminUser
- SiteSettings
- ThemeSettings
- HeroSlide
- Service
- Media
- FAQ
- Testimonial
- City
- ContactInquiry
- CompanionApplication
- LegalPage
- SocialLink
- HowItWorksStep

The migration must preserve these foundations and evolve `Service` toward Experience and `CompanionApplication` toward the new companion verification system.

## Current API Surface

Public routes currently include site settings, theme, hero slides, services, cities, FAQ, testimonials, pages, footer, How It Works, contact, and companion application endpoints.

Admin routes currently expose CRUD/management for the existing CMS modules and admin authentication.

A health endpoint exists at `/api/v1/health`.

## Stage 0 Risk Notes

1. Existing repository documentation contains a MongoDB/Mongoose description while the actual backend package and Prisma schema use PostgreSQL/Prisma. The actual code/schema is authoritative for migration work.
2. The existing admin model is a single `AdminUser` with JWT authentication; target architecture requires AdminUser + RBAC + audit logs.
3. Existing `Service` and `CompanionApplication` require additive migration/refactor rather than destructive replacement.
4. Existing media is local-storage oriented; target architecture needs a secure storage abstraction that can later support cloud storage.
5. Advanced GoWith modules do not exist yet and must be added phase-by-phase.

## Stage 0 Completion Status

- [x] Repository identified
- [x] Baseline commit identified
- [x] Existing schema inspected
- [x] Existing API entrypoint inspected
- [x] Existing admin surface identified
- [x] Migration rules added
- [ ] Local database backup/tag verified on developer machine
- [ ] Full local test/build execution verified on developer machine

## Next Implementation Phase

Stage 1 — GoWith Core, beginning with the identity/auth foundation and additive database migration.
