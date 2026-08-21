# Phase 1 — Core Foundation

Status: IN PROGRESS — full-stack rebuild pass

## Full-stack rule

Phase 1 is only complete when each requirement is implemented and integrated across the applicable frontend, backend/API, database, and admin panel, then verified with typecheck/build/tests. Existing CMS/admin functionality must remain intact.

## Completed in this full-stack pass

### Customer authentication
- Customer OTP login UI at `/login`
- Email/mobile channel selection
- Strict client-side email/mobile validation
- OTP request flow connected to `/api/v1/public/auth/otp/request`
- OTP verification flow connected to `/api/v1/public/auth/otp/verify`
- Customer session storage
- Customer session API client
- Customer auth context
- Customer profile page
- Customer logout flow
- GoWith branding on public navbar
- Public sign-in/profile entry point

### Admin
- Customer user management API
- Admin customer list
- Customer account status management
- Active / suspended / deactivated states

## Existing foundation retained

The branch already contains the backend customer identity foundation: User, UserProfile, Role, UserRoleAssignment, SocialAccount, Session and OtpRequest Prisma models; OTP request/verification routes; customer session middleware; and customer profile API.

## Still pending before Phase 1 can be marked COMPLETE

- Full verification of all Phase 1 backend flows against the live database
- Full customer profile editing UI/API integration where specified
- Social account integration UI/API where specified
- Final branding/3D hero audit against the GoWith UI direction
- Admin integration/navigation polish for customer management
- Frontend + backend typecheck/build/test verification
- End-to-end manual verification of OTP, session, profile and admin user flows
