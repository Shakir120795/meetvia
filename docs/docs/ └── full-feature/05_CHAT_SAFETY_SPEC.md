# GoWith — Chat & Contact Safety Specification

## Goal

Protect users and the platform from off-platform contact exchange where platform rules prohibit it, while minimizing false positives.

## Chat Activation

Conversation must remain locked until:

```text
booking.status == CONFIRMED
AND current_time >= booking.start_time
AND booking.status != CANCELLED
AND accounts are not suspended
```

The server is authoritative.

## Text Detection

Normalize text before analysis:
- Unicode normalization
- whitespace normalization
- obfuscation normalization
- lowercase where appropriate

Detect:
- phone numbers
- email addresses
- URLs
- WhatsApp
- Telegram
- Instagram
- Facebook
- X/Twitter
- usernames
- common obfuscated patterns

Example categories:

```text
PHONE
EMAIL
URL
SOCIAL_HANDLE
SOCIAL_LINK
EXTERNAL_CONTACT
```

## Enforcement Levels

Configurable:

```text
ALLOW
WARN
MASK
BLOCK
FLAG
```

The same detector should not automatically block everything.

Use confidence scores.

## Image Pipeline

```text
Upload
  ↓
Virus / file validation
  ↓
Object storage
  ↓
Image moderation
  ↓
OCR
  ↓
Contact/social detector
  ↓
Risk score
  ↓
Allow / Warn / Mask / Block / Flag
```

Do not trust client-side OCR.

## QR Codes

Future safety layer may inspect QR codes for external contact/social destinations.

## Admin

Moderation event should store:
- event ID
- conversation ID
- message ID
- sender ID
- detector type
- confidence
- action
- timestamp
- reviewer if manually handled

Do not store unnecessary sensitive content forever.

## Privacy

The platform should clearly disclose:
- moderation
- safety scanning
- administrative access under defined circumstances
- retention
- user reporting

Use role-based access and audit every privileged message view where feasible.
