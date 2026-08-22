# GoWith — GitHub → VPS Deployment Blueprint

## Goal

The project must be developed locally/with coding agents, pushed to GitHub, and deployed to the VPS by pulling from GitHub.

```text
Developer / Kiro / Claude Code / Codex
                ↓
             Git
                ↓
             GitHub
                ↓
             VPS
                ↓
        Build + Migration
                ↓
        GoWith Production
```

## Repository Structure

Recommended:

```text
gowith/
├── apps/
│   ├── web/                 # Next.js website
│   ├── mobile/              # React Native / Expo
│   ├── admin/               # Admin dashboard
│   └── api/                 # Backend API
│
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── types/               # Shared TypeScript types
│   ├── config/              # Shared configuration
│   └── validation/          # Shared validation schemas
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── README.md
│
├── docs/
├── scripts/
├── .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── docker-compose.yml
```

The exact monorepo tooling may be selected later. The important rule is that web, API, admin and mobile remain clearly separated.

## Git Branching

Recommended:

```text
main        → production
develop     → integration
feature/*   → individual features
fix/*       → bug fixes
hotfix/*    → urgent production fixes
```

Do not develop directly on `main`.

## Git Rules

Every feature should be committed as a meaningful unit.

Example:

```text
feat(auth): add mobile OTP login
feat(companion): add verification workflow
feat(booking): add booking state machine
feat(chat): enforce booking-time chat access
fix(chat): prevent pre-booking message access
docs: update deployment instructions
```

Never commit:
- `.env`
- API secrets
- database passwords
- private keys
- production credentials
- uploaded user documents

## VPS Principle

The VPS is a deployment target, not the primary development environment.

Recommended:

```text
GitHub
  ↓
VPS
  ├── Reverse Proxy (Nginx)
  ├── GoWith Web
  ├── GoWith API
  ├── Admin
  ├── PostgreSQL
  ├── Redis
  └── Worker
```

For the first production release, Docker Compose is recommended if it keeps deployment predictable.

## Initial VPS Setup

Install:
- Git
- Docker
- Docker Compose
- Nginx
- Certbot/HTTPS tooling
- basic firewall
- fail2ban if appropriate

Create a non-root deployment user.

Do not run the application as root.

## Clone

Example:

```bash
git clone git@github.com:YOUR_ORG/gowith.git
cd gowith
```

## Environment

Create production secrets on the VPS:

```text
.env.production
```

Do not commit this file.

Use `.env.example` as the template.

## Production Deploy Flow

```bash
git fetch origin
git checkout main
git pull --ff-only origin main

docker compose build
docker compose run --rm api npm run migrate
docker compose up -d

docker compose ps
docker compose logs --tail=100
```

The exact commands may change according to the final stack.

## Safe Deployment Rule

Never blindly deploy.

Before pulling production:

1. verify GitHub commit
2. check CI is green
3. check backup status
4. pull with `--ff-only`
5. run migration
6. start services
7. health check
8. inspect logs
9. verify critical user journey

## Rollback

Keep the previous known-good commit.

Example:

```bash
git log --oneline -10
git checkout <known-good-commit>
docker compose build
docker compose run --rm api npm run migrate
docker compose up -d
```

Database migrations must be designed with rollback/recovery strategy.

## Nginx

Production routing should eventually look like:

```text
https://gowith.example
        ↓
      Nginx
   ┌────┼─────┐
   ↓    ↓     ↓
 Web   API   Admin
```

WebSocket traffic for chat must also be proxied correctly.

## HTTPS

Required:
- HTTPS for website
- secure cookies
- API HTTPS
- WebSocket secure connection
- automatic certificate renewal

## Health Checks

Create:

```text
GET /health
GET /ready
```

`/health`:
- process alive

`/ready`:
- database reachable
- Redis reachable if required
- required dependencies ready

## Backups

At minimum:
- daily PostgreSQL backup
- retention policy
- object storage backup/versioning
- restore test

A backup is not considered valid until a restore has been tested.

## Monitoring

Monitor:
- CPU
- RAM
- disk
- database
- Redis
- API errors
- response time
- queue failures
- WebSocket failures
- SSL expiry
- backup failures

## Production Deployment Checklist

- [ ] GitHub CI green
- [ ] database backup verified
- [ ] environment variables verified
- [ ] migration reviewed
- [ ] deployment completed
- [ ] `/health` passes
- [ ] homepage works
- [ ] login works
- [ ] companion browse works
- [ ] booking flow works
- [ ] chat lock works
- [ ] admin login works
- [ ] logs checked
- [ ] rollback point recorded


## Local Development Rule

The project must be continuously runnable on the developer's local PC during development.

Local development is the primary verification environment before GitHub/VPS deployment.

Recommended flow:

```text
Code
 ↓
Run locally
 ↓
Open in browser / emulator
 ↓
Test feature
 ↓
Fix issues
 ↓
Run tests + lint + build
 ↓
Commit
 ↓
Push GitHub
 ↓
Staging / VPS
 ↓
Production
```

Do not wait until the VPS deployment to discover UI or feature problems.

### Local Services

Depending on the final stack, local development should provide:

```text
Web App        → localhost
API            → localhost
Admin          → localhost
PostgreSQL     → local Docker/container
Redis          → local Docker/container
Worker         → local process/container
Object Storage → local S3-compatible service or configured dev storage
```

### Local Environment

Use:

```text
.env.local
```

or the equivalent environment supported by the selected framework.

Never copy production secrets into local development.

### Local Verification After Every Feature

After implementing a feature:

1. start required local services
2. open the web app
3. test the feature manually
4. test mobile responsive layout
5. test relevant API endpoints
6. check browser console
7. check backend logs
8. run automated tests
9. run lint
10. run production build

Only then commit the feature.

### Local vs VPS

```text
LOCAL
→ development + visual verification + automated tests

GITHUB
→ source control + CI + code review

VPS/STAGING
→ deployment verification

PRODUCTION
→ live users
```

The VPS must not be used as the primary development environment.
