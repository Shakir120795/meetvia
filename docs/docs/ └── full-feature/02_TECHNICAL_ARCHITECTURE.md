# GoWith — Technical Architecture

## Recommended Production Stack

The architecture is portable, but this stack is recommended for speed and maintainability.

### Web
- Next.js
- TypeScript
- Tailwind CSS
- component library/design system

### Mobile
- React Native + Expo
- TypeScript
- Android APK/AAB
- iOS build

### Backend
- Node.js
- NestJS or a similarly modular TypeScript backend
- REST API
- WebSocket for chat/realtime events

### Database
- PostgreSQL
- Prisma or TypeORM

### Cache / Queue
- Redis

### Object Storage
- S3-compatible storage

### Search
Start with PostgreSQL search.
Introduce OpenSearch/Elasticsearch only when justified.

### Admin
Use the same backend APIs with a separate admin frontend or protected admin area.

---

## High-Level Architecture

```text
                    ┌────────────────────┐
                    │      Web App       │
                    │     Next.js        │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │     API Gateway    │
                    │ Auth / Rate Limit  │
                    └─────────┬──────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
┌──────▼──────┐       ┌───────▼──────┐       ┌──────▼──────┐
│ Auth Module │       │ Marketplace  │       │ Booking     │
│ OTP/OAuth   │       │ Companion    │       │ Payments    │
└─────────────┘       │ Experience   │       │ Cancellation│
                      └──────────────┘       └─────────────┘
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ PostgreSQL         │
                    └─────────┬──────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
          ┌────▼────┐    ┌────▼────┐    ┌────▼─────┐
          │ Redis   │    │ Object  │    │ Queue /  │
          │ Cache   │    │ Storage │    │ Workers  │
          └─────────┘    └─────────┘    └──────────┘

             ┌──────────────────────────────┐
             │ Moderation / OCR / Safety   │
             └──────────────────────────────┘

             ┌──────────────────────────────┐
             │ Admin Dashboard             │
             └──────────────────────────────┘
```

## Modules

Recommended backend modules:

```text
auth
users
companions
verification
experiences
cities
availability
search
bookings
payments
chat
moderation
reports
reviews
notifications
media
admin
analytics
settings
audit
```

## Database Core Entities

```text
User
Role
SocialAccount
CompanionProfile
VerificationCase
VerificationDocument
City
ExperienceCategory
Experience
AvailabilitySlot
Booking
Payment
Conversation
ConversationParticipant
Message
MessageAttachment
ModerationEvent
Report
Review
Notification
AdminAction
AuditLog
FeatureFlag
PlatformSetting
```

## API Versioning

Use:

```text
/api/v1/...
```

Do not expose database implementation details through the API.

## Security

Required:
- Argon2/bcrypt where passwords exist
- OTP abuse protection
- refresh token rotation
- secure cookies where applicable
- CSRF protection where applicable
- rate limiting
- request validation
- file type validation
- malware scanning for uploads
- signed object-storage URLs
- RBAC
- audit logging
- encryption in transit
- encryption at rest where supported

## Deployment

Use separate environments:

```text
development
staging
production
```

Never develop directly on production.

## Backups

At minimum:
- automated PostgreSQL backups
- point-in-time recovery where supported
- object storage versioning
- periodic restore tests
