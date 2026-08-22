# GoWith — Environment & Deployment

## Environments

```text
local
staging
production
```

## Example Environment Variables

```text
NODE_ENV=
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
SESSION_SECRET=
OTP_PROVIDER_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
APPLE_CLIENT_ID=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
PAYMENT_PROVIDER_KEY=
PAYMENT_PROVIDER_SECRET=
EMAIL_PROVIDER_KEY=
PUSH_PROVIDER_KEY=
```

Never commit `.env`.

Commit:

```text
.env.example
```

## Deployment Principle

```text
Developer
  ↓
Git
  ↓
CI
  ↓
Tests
  ↓
Build
  ↓
Staging
  ↓
QA
  ↓
Production
```

## Production Checklist

- HTTPS
- secure cookies
- database backups
- monitoring
- alerting
- log retention
- rate limiting
- firewall
- least-privilege credentials
- object storage permissions
- migration process
- rollback process
- incident response
- privacy/legal pages
- app-store configuration
- domain/email configuration

## Scaling

Start simple.

Recommended first production architecture:

```text
Load Balancer / Reverse Proxy
        ↓
App Server(s)
        ↓
PostgreSQL
        ↓
Redis
        ↓
Object Storage
```

Scale horizontally only when required.

Do not prematurely introduce microservices.

Use a modular monolith first unless measurable requirements justify service separation.
