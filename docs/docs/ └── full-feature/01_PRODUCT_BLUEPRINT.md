# GoWith — Product Blueprint

## Product Position

GoWith combines:

**Companion discovery + experience discovery + booking + controlled communication.**

It should feel like a premium service platform rather than a conventional marketplace.

## Primary User Journey

```text
Landing
  ↓
Choose city
  ↓
Choose experience
  ↓
Choose date/time
  ↓
Browse companions
  ↓
Open profile
  ↓
Select booking
  ↓
Login / OTP
  ↓
Booking confirmation
  ↓
Payment (gateway abstraction)
  ↓
Booking confirmed
  ↓
Chat unlocks at booking start time
  ↓
Experience
  ↓
Booking completed
  ↓
Review / rating
```

## Companion Journey

```text
Become a Companion
  ↓
Create account
  ↓
Complete profile
  ↓
Verification form
  ↓
Submit
  ↓
Admin review
  ↓
Approved
  ↓
Profile published
  ↓
Set availability
  ↓
Receive booking
  ↓
Accept / manage
  ↓
Booking active
  ↓
Chat available
  ↓
Experience
  ↓
Completion
  ↓
Payout / earnings
```

## Important UX Rules

- Primary actions must be visually obvious.
- Keep forms short and progressive.
- Use progressive disclosure.
- Avoid walls of text.
- Always show verification state clearly.
- Show booking state clearly.
- Do not expose chat before activation.
- Show why a user cannot access a locked feature.
- Use clear empty/error/loading states.

## Marketplace Search

Minimum search inputs:
- city
- experience
- date
- time

Future:
- price
- language
- rating
- availability
- distance
- interests
- gender preference if legally/product appropriate
- accessibility needs
- companion type

All filters must be configurable.

## Companion Profile

Suggested structure:

```text
Photo / media
Name
Verified badge
City
Rating
Short introduction
Experience categories
Languages
Availability
Pricing
Reviews
Safety information
Book CTA
```

Do not expose private verification documents.

## Booking Details

```text
Companion
Experience
Location / meeting point
Date
Start time
End time
Price
Payment state
Booking state
Cancellation policy
Chat state
```

## Review System

After completion:
- rating
- optional text review
- report option

Review moderation should be supported.

## Reports

Users can report:
- profile
- booking
- message
- image
- payment issue
- safety issue

Reports enter an admin moderation queue.
