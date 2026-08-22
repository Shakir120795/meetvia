# GoWith — Admin Dashboard Blueprint

## Admin Roles

Recommended:

```text
SUPER_ADMIN
ADMIN
VERIFICATION_REVIEWER
MODERATOR
SUPPORT_AGENT
FINANCE
ANALYST
CONTENT_MANAGER
```

Do not give every admin role full access.

## Dashboard

Top metrics:
- total users
- active users
- companions
- verified companions
- pending verification
- bookings today
- revenue
- cancellations
- reports
- active conversations

## Companion Verification

Queue:
- pending
- needs changes
- approved
- rejected
- suspended

Reviewer sees:
- profile
- submitted information
- documents
- photos
- verification history
- previous decisions

Actions:
- approve
- reject
- request changes
- suspend

Every action creates an audit record.

## Chat Moderation

Moderator can:
- search conversation
- view messages
- view attachments
- view moderation flags
- delete message
- restrict user
- suspend account
- create report

Moderator cannot:
- silently alter message content
- impersonate a user

## Content Management

Admin-controlled:
- hero text
- homepage copy
- experience categories
- city availability
- featured profiles
- FAQs
- legal links
- footer content
- banners

## Feature Flags

Examples:

```text
ENABLE_EXPERIENCE_MARKETPLACE
ENABLE_SOCIAL_LOGIN
ENABLE_IMAGE_OCR
ENABLE_AI_MODERATION
ENABLE_REVIEWS
ENABLE_REFERRALS
ENABLE_SUBSCRIPTIONS
ENABLE_COMPANION_TIERS
```

Feature flags should support:
- enabled/disabled
- environment
- role
- percentage rollout where useful
