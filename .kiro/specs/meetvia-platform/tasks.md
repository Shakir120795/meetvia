# Implementation Plan: Meetvia Platform

## Overview

This plan implements the Meetvia CMS-powered platform as a monorepo with a Next.js frontend and Express.js backend. Tasks are ordered to build foundational infrastructure first (backend models, auth, API), then frontend pages, admin panel, and finally integration testing. Property-based tests validate correctness properties defined in the design.

## Tasks

- [x] 1. Backend project setup and core infrastructure
  - [x] 1.1 Initialize backend project with Express, TypeScript, and dependencies
    - Create `backend/` directory with `package.json`, `tsconfig.json`
    - Install dependencies: express, mongoose, jsonwebtoken, bcryptjs, multer, express-rate-limit, joi, cors, dotenv, uuid
    - Install dev dependencies: jest, ts-jest, fast-check, supertest, @types/*
    - Create `.env.example` with all required environment variables (MONGO_URI, JWT_SECRET, JWT_EXPIRY, PORT)
    - Create `src/server.ts` entry point with Express app setup, CORS, JSON body parser, and route mounting
    - Create `src/config/env.ts` for environment variable loader with validation
    - Create `src/config/db.ts` for MongoDB connection via Mongoose
    - _Requirements: 1.1, 1.4, 19.4, 19.5_

  - [x] 1.2 Implement global error handler and utility modules
    - Create `src/middleware/errorHandler.ts` — centralized error handler returning structured JSON errors with appropriate HTTP status codes (400, 401, 404, 409, 413, 415, 429, 500)
    - Create `src/utils/jwt.ts` — sign and verify token helpers with configurable expiry
    - Create `src/utils/password.ts` — bcrypt hash (cost factor 10) and compare helpers
    - Create `src/utils/storage.ts` — StorageAdapter interface with LocalStorageAdapter implementation
    - _Requirements: 1.5, 1.7, 2.7, 19.2_

  - [x] 1.3 Implement JWT auth middleware and rate limiter
    - Create `src/middleware/auth.ts` — extracts Bearer token, verifies JWT, returns 401 on failure with specific error messages (expired, malformed, invalid signature)
    - Create `src/middleware/rateLimiter.ts` — express-rate-limit configured for 5 requests per 15-minute window on auth endpoints, returns 429 with retry delay
    - _Requirements: 1.4, 1.5, 2.5, 19.1, 19.6, 19.7_

  - [x] 1.4 Implement file upload middleware with validation
    - Create `src/middleware/upload.ts` — Multer configuration with file filter checking MIME type and extension match
    - Enforce 10MB limit for images (jpeg, png, webp, svg), 100MB for videos (mp4, webm)
    - Generate unique filenames using UUID + original extension
    - Store in `uploads/images/` or `uploads/videos/` based on type
    - Return specific error messages for size exceeded vs unsupported type
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.8, 19.3_


- [x] 2. Database models and validation schemas
  - [x] 2.1 Create all Mongoose models (Part 1 — Core)
    - Create `src/models/AdminUser.ts` — email (unique), password, name, timestamps
    - Create `src/models/SiteSettings.ts` — singleton, siteName, logo, favicon, meta fields, WhatsApp config, safetyCheckboxText
    - Create `src/models/ThemeSettings.ts` — singleton, preset enum, color fields (required), fontFamily, borderRadius (0-32), glassmorphismIntensity (0-100)
    - Create `src/models/Media.ts` — originalFilename, storedFilename (unique), fileType enum, mimeType, fileSize, storagePath, url
    - All models include createdAt/updatedAt with Mongoose timestamps option
    - _Requirements: 20.1, 20.2, 20.4_

  - [x] 2.2 Create all Mongoose models (Part 2 — Content)
    - Create `src/models/HeroSlide.ts` — heading (max 200), subtitle (max 500), media fields, overlayOpacity (0-100), includesList array, CTA fields, displayOrder, isVisible
    - Create `src/models/Service.ts` — title (max 100), description (max 500), duration, locationType enum, media fields, whatsIncluded array, button fields, isFeatured, isVisible, displayOrder
    - Create `src/models/FAQ.ts` — question (max 200), answer (max 2000), displayOrder
    - Create `src/models/Testimonial.ts` — reviewerName (max 100), location (max 100), reviewText (max 500), rating (1-5), image, isVerified, isVisible, displayOrder
    - Create `src/models/City.ts` — cityName (max 100), state (max 100), country (max 100), status enum, displayOrder; compound unique index on {cityName, state}
    - Create `src/models/HowItWorksStep.ts` — stepNumber, title (max 100), description (max 300), displayOrder
    - _Requirements: 20.1, 20.2, 20.4, 20.5_

  - [x] 2.3 Create all Mongoose models (Part 3 — Submissions & Pages)
    - Create `src/models/ContactInquiry.ts` — fullName (max 100), email, mobile, serviceType, preferredDate, message (max 2000), safetyConfirmed, status enum (new/reviewed/contacted/closed/rejected), adminNotes
    - Create `src/models/CompanionApplication.ts` — fullName (max 100), email, mobile (10-digit), city, experience (max 1000), whyJoin (max 1000), status enum (pending/reviewing/approved/rejected), adminNotes
    - Create `src/models/LegalPage.ts` — slug (unique, enum of 4 values), title, content (max 100000)
    - Create `src/models/SocialLink.ts` — platform, url, iconIdentifier, isVisible, displayOrder
    - _Requirements: 20.1, 20.2, 20.4, 20.5_

  - [x] 2.4 Create validation schemas (Joi/Zod) for all resources
    - Create `src/validators/` directory with schemas for each resource
    - Validate string lengths, required fields, enum values, hex color format (#RRGGBB), email format, URL format, 10-digit Indian mobile format
    - Create reusable validation middleware wrapper `src/middleware/validate.ts`
    - _Requirements: 3.9, 8.4, 9.4, 12.6, 14.7, 18.4, 20.2, 20.3_


- [x] 3. Backend API routes — Authentication and Dashboard
  - [x] 3.1 Implement admin auth routes and controller
    - Create `src/routes/admin/auth.ts` — POST /login endpoint
    - Create `src/controllers/authController.ts` — validate credentials, bcrypt compare, JWT sign, return token with expiresAt
    - Apply rate limiter middleware to login route
    - Return generic "Invalid email or password" on auth failure (no field-specific hints)
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 19.1, 19.6_

  - [x] 3.2 Implement admin dashboard stats endpoint
    - Create `src/routes/admin/dashboard.ts` — GET /stats
    - Create `src/controllers/dashboardController.ts` — aggregate counts for services, inquiries (with new count), applications, FAQs, testimonials, active cities, media items
    - Protected by JWT middleware
    - _Requirements: 17.1, 17.3_

- [x] 4. Backend API routes — Public content endpoints
  - [x] 4.1 Implement public content read endpoints (Part 1)
    - Create `src/routes/public/siteSettings.ts` — GET returns site settings
    - Create `src/routes/public/theme.ts` — GET returns active theme settings
    - Create `src/routes/public/hero.ts` — GET returns visible hero slides sorted by displayOrder
    - Create `src/routes/public/howItWorks.ts` — GET returns How It Works steps sorted by displayOrder
    - Create corresponding controllers in `src/controllers/`
    - All responses in JSON format
    - _Requirements: 1.1, 1.7, 3.7, 4.1, 7.2_

  - [x] 4.2 Implement public content read endpoints (Part 2)
    - Create `src/routes/public/services.ts` — GET /services (visible, sorted), GET /services/featured (featured, max 6)
    - Create `src/routes/public/cities.ts` — GET returns active cities sorted by displayOrder
    - Create `src/routes/public/faq.ts` — GET /faq (all sorted), GET /faq/preview (first 6)
    - Create `src/routes/public/testimonials.ts` — GET /testimonials (verified+visible sorted), GET /testimonials/preview (max 3)
    - Create `src/routes/public/pages.ts` — GET /pages/:slug for legal pages
    - Create `src/routes/public/footer.ts` — GET returns footer description + visible social links sorted by order
    - Create corresponding controllers
    - _Requirements: 1.1, 5.4, 5.5, 7.5, 7.6, 7.8, 10.3, 11.3, 12.3, 12.4, 13.2, 14.1_

  - [x] 4.3 Implement public form submission endpoints
    - Create `src/routes/public/contact.ts` — POST validates and stores contact inquiry with status "new"
    - Create `src/routes/public/companion.ts` — POST validates and stores companion application with status "pending"
    - Apply validation middleware with field-level error responses
    - Set timestamps automatically
    - _Requirements: 8.1, 8.4, 8.7, 9.2, 9.4, 9.5_


- [x] 5. Backend API routes — Admin CRUD endpoints
  - [x] 5.1 Implement admin CRUD for Theme, Hero, and Site Settings
    - Create `src/routes/admin/theme.ts` — GET/PUT for theme settings with hex color and range validation
    - Create `src/routes/admin/hero.ts` — full CRUD for hero slides + PUT /reorder for bulk reorder + toggle visibility
    - Create `src/routes/admin/siteSettings.ts` — GET/PUT for site settings with validation
    - All protected by JWT middleware, apply validation middleware
    - _Requirements: 3.1, 3.2, 3.5, 3.9, 4.2, 4.3, 4.8, 18.1, 18.4_

  - [x] 5.2 Implement admin CRUD for Services, FAQ, Testimonials, Cities
    - Create `src/routes/admin/services.ts` — full CRUD with validation, ordering support
    - Create `src/routes/admin/faq.ts` — full CRUD with validation, reorder, reject empty question/answer
    - Create `src/routes/admin/testimonials.ts` — full CRUD with verified toggle, show/hide toggle
    - Create `src/routes/admin/cities.ts` — full CRUD with duplicate city+state check (409 conflict)
    - Create corresponding controllers
    - _Requirements: 5.1, 5.2, 10.1, 10.5, 10.6, 11.1, 11.2, 12.1, 12.2, 12.6_

  - [x] 5.3 Implement admin endpoints for Inquiries, Companions, Legal Pages, Footer
    - Create `src/routes/admin/inquiries.ts` — GET (list with filter by status, search), PUT /:id (update status, admin notes)
    - Create `src/routes/admin/companions.ts` — GET (list with filter by status), PUT /:id (update status, admin notes)
    - Create `src/routes/admin/pages.ts` — GET/PUT /:slug for legal page content (max 100K chars)
    - Create `src/routes/admin/footer.ts` — GET/PUT footer description
    - Create `src/routes/admin/socialLinks.ts` — GET/POST/DELETE for social links with URL validation
    - Create `src/routes/admin/howItWorks.ts` — GET/PUT for How It Works steps (max 10 steps)
    - _Requirements: 7.3, 8.8, 9.8, 13.1, 13.6, 14.3, 14.4, 14.7_

  - [x] 5.4 Implement admin media endpoints
    - Create `src/routes/admin/media.ts` — POST /upload (multipart), GET (paginated list with search/filter by type, 20 per page), DELETE /:id (removes file + metadata)
    - Wire Multer upload middleware with type/size validation
    - Return specific error reasons on upload rejection
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.8_

- [x] 6. Database seed script
  - [x] 6.1 Create seed script with all default data
    - Create `src/config/seed.ts` — checks each collection for existing data before seeding
    - Seed default admin: admin@meetvia.com / ChangeMe123! (bcrypt hashed)
    - Seed default theme: Futuristic Blue preset values
    - Seed 2 hero slides (International Visitor City Guide, Domestic & International Travel Support)
    - Seed 6 services (City Exploration, Virtual City Tour, Shopping & Event Companion, Guided City Experience, Domestic Travel Experience, International Visitor Travel Support)
    - Seed default city: Agra, Uttar Pradesh, India (active, order 1)
    - Seed 6 FAQ entries relevant to Meetvia services
    - Seed 4 legal pages (safety-policy, terms-of-service, privacy-policy, refund-policy) with placeholder content
    - Seed 5 social links (Instagram, Facebook, YouTube, LinkedIn, WhatsApp) with placeholder URLs
    - Seed 3 How It Works steps (Choose Activity, Confirm Public Meeting, Enjoy Structured Session)
    - Seed default site settings (name: Meetvia, meta title, meta description)
    - Skip collections that already contain data (idempotent)
    - _Requirements: 1.6, 2.8, 3.8, 4.6, 5.6, 7.2, 7.5, 10.4, 12.5, 13.3, 14.6, 18.3_


- [x] 7. Checkpoint — Backend API complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Frontend project setup and core infrastructure
  - [x] 8.1 Initialize Next.js frontend with TypeScript and dependencies
    - Create `frontend/` directory with Next.js App Router project (TypeScript)
    - Install dependencies: tailwindcss, framer-motion, gsap, react-hook-form, @hookform/resolvers, zod, react-icons, lucide-react
    - Configure `tailwind.config.ts` with CSS variable-based theme colors, font family, border-radius
    - Create `src/types/index.ts` with all TypeScript interfaces matching backend models
    - Create `next.config.ts` with API proxy/rewrite to Express backend
    - _Requirements: 16.1, 16.2_

  - [x] 8.2 Implement API client, auth helpers, and context providers
    - Create `src/lib/api.ts` — fetch wrapper with base URL, JSON headers, auth token injection for admin requests
    - Create `src/lib/auth.ts` — localStorage JWT helpers (store, read, clear, isExpired)
    - Create `src/lib/theme.ts` — function to apply theme values as CSS custom properties on document root
    - Create `src/context/AuthContext.tsx` — AuthProvider with login/logout state, token management, redirect on expiry
    - Create `src/context/ThemeContext.tsx` — ThemeProvider that fetches theme from API and applies CSS variables
    - Create `src/hooks/useAuth.ts`, `src/hooks/useTheme.ts`, `src/hooks/useReducedMotion.ts`
    - _Requirements: 1.3, 2.5, 2.6, 3.6, 3.7, 16.7_

  - [x] 8.3 Implement shared UI components
    - Create `src/components/ui/GlassCard.tsx` — 3D glassmorphism card with hover animations (200-400ms), respects reduced-motion
    - Create `src/components/ui/Button.tsx` — themed button with variants
    - Create `src/components/ui/Input.tsx` — form input with validation error display
    - Create `src/components/ui/Accordion.tsx` — expandable/collapsible for FAQ items
    - Create `src/components/ui/Modal.tsx` — reusable modal dialog
    - Create `src/components/ui/Pagination.tsx` — page navigation component
    - _Requirements: 5.3, 16.2, 16.3, 16.4_

  - [x] 8.4 Implement layout components (Navbar, Footer, Root Layout)
    - Create `src/components/layout/Navbar.tsx` — links: Home, Services, Become a Companion, Contact; active link highlighting; responsive mobile menu
    - Create `src/components/layout/Footer.tsx` — logo, description (max 200 chars), legal links (4 policies), social icons (32x32px min) sorted by displayOrder
    - Create `src/app/layout.tsx` — root layout with ThemeProvider, Navbar, Footer, meta tags from site settings (SSR)
    - Create `src/app/not-found.tsx` — 404 page with message and link to home
    - _Requirements: 6.1, 6.6, 14.1, 14.2, 14.5, 16.5_


- [x] 9. Frontend public pages — Home page sections
  - [x] 9.1 Implement Hero Section with scroll-triggered animations
    - Create `src/components/home/HeroSection.tsx` — multi-slide hero with left/right arrows (hidden if single slide)
    - Video slides display in 3D-styled card frame with autoplay muted
    - Implement GSAP ScrollTrigger: section pins on scroll, text fades/translates in, then unpins
    - Overlay with configurable opacity per slide
    - Heading, subtitle, includes list, CTA button
    - Respect prefers-reduced-motion (disable animations)
    - _Requirements: 4.1, 4.4, 4.5, 4.7, 7.1, 16.7_

  - [x] 9.2 Implement How It Works, Safety, and Become Companion home sections
    - Create `src/components/home/HowItWorks.tsx` — numbered steps with title and description (fetched from API)
    - Create `src/components/home/SafetySection.tsx` — heading, text, notice box, checklist, button to /safety-policy
    - Create `src/components/home/BecomeCompanion.tsx` — heading, benefits description, CTA button to /become-companion
    - _Requirements: 6.4, 6.5, 7.2, 7.4, 7.9_

  - [x] 9.3 Implement Services Preview, Cities, FAQ Preview, Testimonials Preview, Contact sections
    - Create `src/components/home/ServicesPreview.tsx` — first 6/featured services as GlassCards, "View All Services" button
    - Create `src/components/home/CitiesSection.tsx` — active cities with name and state
    - Create `src/components/home/FAQPreview.tsx` — max 6 FAQs in accordion, "View All FAQs" button to /faq
    - Create `src/components/home/TestimonialsPreview.tsx` — max 3 verified testimonials, "View All" button; hidden if none exist
    - Create `src/components/home/ContactSection.tsx` — contact form + WhatsApp box
    - _Requirements: 5.5, 7.1, 7.5, 7.6, 7.7, 7.8, 8.6_

  - [x] 9.4 Assemble Home page with correct section order
    - Create `src/app/page.tsx` — SSR page fetching all homepage data via getServerSideProps/server components
    - Section order: Hero, How It Works, Safety, Services Preview, Become Companion, Cities, FAQ Preview, Testimonials Preview, Contact
    - Apply responsive layout (mobile-first with Tailwind breakpoints)
    - Set meta title, description, Open Graph tags from site settings
    - _Requirements: 1.3, 7.1, 16.1, 16.5_


- [x] 10. Frontend public pages — Services, Companion, Contact, FAQ, Testimonials
  - [x] 10.1 Implement Services page
    - Create `src/app/services/page.tsx` — SSR fetch all visible services
    - Display as 3D GlassCards with hover animations revealing title, description, duration, location, booking button
    - Video services show thumbnail with play overlay icon
    - 2-column grid on desktop (≥768px), 1-column on mobile (<768px)
    - _Requirements: 5.3, 5.4, 5.7, 16.1_

  - [x] 10.2 Implement Contact page with form and WhatsApp integration
    - Create `src/components/forms/ContactForm.tsx` — Full Name, Email, Mobile (optional), Service Type (dropdown from active services), Preferred Date (date picker), Message
    - Safety confirmation checkbox (text from site settings), prevents submission if unchecked
    - Client-side validation with react-hook-form + Zod (required fields, email format, max lengths)
    - On success: show success message + "Continue on WhatsApp" button (opens WhatsApp with configured number + prefilled message)
    - Create `src/app/contact/page.tsx` with ContactForm + WhatsApp quick-assistance box
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 10.3 Implement Become a Companion page with application form
    - Create `src/components/forms/CompanionForm.tsx` — Full Name, Email, Mobile (10-digit Indian), City (dropdown from active cities), Experience, Why Join
    - Safety notice above submit button
    - Client-side validation with react-hook-form + Zod
    - On success: show confirmation message; on server error: show error message, preserve form data
    - Create `src/app/become-companion/page.tsx` — "Why Join Meetvia" section, requirements list, application form
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 10.4 Implement FAQ and Testimonials pages
    - Create `src/app/faq/page.tsx` — all FAQs in accordion format sorted by displayOrder; empty state message if none exist
    - Create `src/app/testimonials/page.tsx` — verified+visible testimonials as minimal cards (name, text, verification badge); empty state "No visitor stories are available yet." if none
    - _Requirements: 10.2, 10.7, 11.3, 11.4, 11.5_

  - [x] 10.5 Implement Legal pages (4 policy pages)
    - Create `src/app/safety-policy/page.tsx`, `src/app/terms-of-service/page.tsx`, `src/app/privacy-policy/page.tsx`, `src/app/refund-policy/page.tsx`
    - Each fetches content from GET /api/v1/public/pages/:slug, renders title as heading + rich-text body as HTML
    - Display "temporarily unavailable" message if API fails
    - _Requirements: 13.2, 13.4, 13.5_


- [x] 11. Checkpoint — Frontend public pages complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Admin Panel — Login and Dashboard
  - [x] 12.1 Implement admin login page
    - Create `src/app/admin/login/page.tsx` — email + password form
    - Client-side validation: email format required, password at least 1 char; show validation errors without sending request if empty
    - On success: store JWT in localStorage, redirect to /admin/dashboard
    - On 401: show "Invalid email or password" error
    - On 429: show rate limit message with retry delay
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.3_

  - [x] 12.2 Implement admin layout with sidebar and auth guard
    - Create `src/app/admin/dashboard/layout.tsx` — sidebar navigation to all 12 admin modules
    - Create `src/components/layout/AdminSidebar.tsx` — navigation links with icons
    - Implement auth guard: check JWT validity on mount, redirect to /admin/login if expired/missing
    - _Requirements: 2.5, 2.6, 6.3, 6.7, 17.2, 17.3_

  - [x] 12.3 Implement admin dashboard overview page
    - Create `src/app/admin/dashboard/page.tsx` — fetch GET /admin/dashboard/stats
    - Display stats cards: total services, inquiries (with new count), applications, FAQs, testimonials, active cities, media items
    - Create `src/components/admin/StatsCard.tsx` — reusable stat display card
    - Show error message if stats API fails, still render module navigation
    - _Requirements: 17.1, 17.4_

- [x] 13. Admin Panel — Content management modules (Part 1)
  - [x] 13.1 Implement Theme Manager admin page
    - Create `src/app/admin/dashboard/theme/page.tsx`
    - Display 3 preset buttons (Futuristic Blue, Luxury Dark, Clean White) — clicking populates all fields
    - Form fields: primary, secondary, accent, background, text colors (hex input), font family, border radius (0-32), glassmorphism intensity (0-100)
    - Create `src/components/admin/ThemePreview.tsx` — inline preview updating in real-time without page reload
    - Validate hex format and numeric ranges before save; show validation errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.9_

  - [x] 13.2 Implement Hero Manager admin page
    - Create `src/app/admin/dashboard/hero/page.tsx`
    - List all slides with drag-and-drop reorder or manual order input
    - Add/edit slide form: background image/video (media picker), overlay opacity, heading, subtitle, includes list, CTA text, CTA link
    - Toggle visibility (show/hide) per slide
    - Delete slide functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.8_

  - [x] 13.3 Implement Services Manager admin page
    - Create `src/app/admin/dashboard/services/page.tsx`
    - Create `src/components/admin/DataTable.tsx` — reusable data table with search/filter/pagination
    - Full CRUD: list services, add/edit form with all fields (title, description, duration, locationType, media, thumbnail, whatsIncluded, button fields, featured toggle, show/hide, display order)
    - Delete confirmation modal
    - _Requirements: 5.1, 5.2_


- [x] 14. Admin Panel — Content management modules (Part 2)
  - [x] 14.1 Implement Media Library admin page
    - Create `src/app/admin/dashboard/media/page.tsx`
    - Create `src/components/admin/MediaGrid.tsx` — paginated grid (20 items/page) with search by filename and filter by type
    - Create `src/components/ui/FileUpload.tsx` — drag-and-drop upload with progress indicator
    - Upload validation: show specific error for size exceeded or unsupported type
    - Delete media with confirmation (removes file + metadata)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [x] 14.2 Implement FAQ Manager and Testimonials Manager admin pages
    - Create `src/app/admin/dashboard/faq/page.tsx` — CRUD list with reorder, reject empty question/answer with validation error
    - Create `src/app/admin/dashboard/testimonials/page.tsx` — CRUD list with verified toggle, show/hide toggle, all fields
    - _Requirements: 10.1, 10.5, 10.6, 11.1, 11.2_

  - [x] 14.3 Implement Cities Manager and How It Works Manager admin pages
    - Create `src/app/admin/dashboard/cities/page.tsx` — CRUD with duplicate city+state error display
    - Create How It Works management within site settings or dedicated page — add/edit/remove/reorder steps (max 10)
    - _Requirements: 7.3, 12.1, 12.2, 12.6_

  - [x] 14.4 Implement Inquiries Manager and Companion Applications Manager admin pages
    - Create `src/app/admin/dashboard/inquiries/page.tsx` — list with search/filter by status, update status (new/reviewed/contacted/closed/rejected), admin notes field
    - Create `src/app/admin/dashboard/companions/page.tsx` — list with filter by status, update status (pending/reviewing/approved/rejected), admin notes field
    - _Requirements: 8.8, 9.8_

  - [x] 14.5 Implement Legal Pages Manager, Footer Manager, and Site Settings admin pages
    - Create `src/app/admin/dashboard/pages/page.tsx` — list 4 legal pages, edit with rich-text editor (headings, bold, italic, lists, links), max 100K chars
    - Create `src/components/ui/RichTextEditor.tsx` — rich text editor component
    - Create `src/app/admin/dashboard/footer/page.tsx` — edit footer description + CRUD social links (platform, URL, icon, show/hide, order) with URL validation
    - Create `src/app/admin/dashboard/settings/page.tsx` — edit all site settings fields with validation (email format, required fields)
    - _Requirements: 13.1, 13.6, 14.3, 14.4, 14.7, 18.1, 18.4_


- [x] 15. Checkpoint — Admin Panel complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Property-based tests — Authentication and Security
  - [ ]* 16.1 Write property test for admin route protection
    - **Property 1: Admin Route Protection**
    - **Validates: Requirements 1.4, 2.4, 19.1**
    - Generate random admin endpoint paths and requests without valid JWT tokens
    - Assert all return 401 Unauthorized and no operation is executed

  - [ ]* 16.2 Write property test for invalid token rejection
    - **Property 2: Invalid Token Rejection**
    - **Validates: Requirements 1.5, 19.7**
    - Generate expired, malformed, and incorrectly-signed JWTs
    - Assert all return 401 with JSON error body when presented to admin endpoints

  - [ ]* 16.3 Write property test for rate limiting enforcement
    - **Property 17: Rate Limiting Enforcement**
    - **Validates: Requirements 19.6**
    - Simulate >5 login requests from same IP within 15-minute window
    - Assert 6th+ requests return 429 with retry delay regardless of credential validity

- [ ] 17. Property-based tests — Data Integrity and Validation
  - [ ]* 17.1 Write property test for seed script idempotence
    - **Property 3: Seed Script Idempotence**
    - **Validates: Requirements 1.6**
    - Pre-populate collections with data, run seed script, verify documents unchanged

  - [ ]* 17.2 Write property test for API JSON response format
    - **Property 4: API JSON Response Format**
    - **Validates: Requirements 1.7**
    - Hit all public endpoints, verify Content-Type is application/json and body parses as valid JSON

  - [ ]* 17.3 Write property test for theme field validation
    - **Property 5: Theme Field Validation**
    - **Validates: Requirements 3.2, 3.9**
    - Generate invalid hex codes (wrong length, missing #, non-hex chars) and out-of-range borderRadius/glassmorphismIntensity
    - Assert all rejected with validation error

  - [ ]* 17.4 Write property test for schema maxlength enforcement
    - **Property 6: Schema Maxlength Enforcement**
    - **Validates: Requirements 4.2, 5.2, 10.1, 13.6, 18.1**
    - Generate strings exceeding defined max lengths for each model field
    - Assert server rejects with field-specific validation error

  - [ ]* 17.5 Write property test for undefined routes returning 404
    - **Property 7: Undefined Routes Return 404**
    - **Validates: Requirements 6.6**
    - Generate random non-existent URL paths
    - Assert 404 response

  - [ ]* 17.6 Write property test for form input validation
    - **Property 8: Form Input Validation**
    - **Validates: Requirements 8.1, 8.4, 9.2, 9.4, 18.4**
    - Generate invalid emails, empty required fields, invalid mobile numbers
    - Assert form submissions are rejected with field-specific errors


- [ ] 18. Property-based tests — Data and File Operations
  - [ ]* 18.1 Write property test for form submission data integrity
    - **Property 9: Form Submission Data Integrity**
    - **Validates: Requirements 8.7, 9.5**
    - Generate valid contact/companion form data, submit, read back from DB, assert all fields match and status defaults are set

  - [ ]* 18.2 Write property test for display order ascending sort
    - **Property 10: Display Order Ascending Sort**
    - **Validates: Requirements 10.5, 12.3, 12.4, 20.5**
    - Insert documents with random displayOrder values into ordered collections
    - Assert public API returns them sorted ascending

  - [ ]* 18.3 Write property test for testimonial visibility filtering
    - **Property 11: Testimonial Visibility Filtering**
    - **Validates: Requirements 11.3**
    - Generate testimonials with random isVerified/isVisible combinations
    - Assert public endpoint returns only those where both are true

  - [ ]* 18.4 Write property test for duplicate city rejection
    - **Property 12: Duplicate City Rejection**
    - **Validates: Requirements 12.6**
    - Insert a city, attempt to insert same cityName+state again
    - Assert second insert is rejected with 409 error

  - [ ]* 18.5 Write property test for URL format validation
    - **Property 13: URL Format Validation**
    - **Validates: Requirements 14.4, 14.7**
    - Generate random invalid URL strings (no protocol, no domain, etc.)
    - Assert social link creation is rejected with validation error

  - [ ]* 18.6 Write property test for file upload validation
    - **Property 14: File Upload Type and MIME Validation**
    - **Validates: Requirements 15.1, 15.3, 19.3**
    - Generate files with mismatched MIME type and extension, disallowed types, oversized files
    - Assert all rejected

  - [ ]* 18.7 Write property test for file storage unique naming
    - **Property 15: File Storage Unique Naming**
    - **Validates: Requirements 15.2, 15.8**
    - Upload same original filename multiple times
    - Assert each stored with distinct generated filename

  - [ ]* 18.8 Write property test for upload rejection error specificity
    - **Property 16: Upload Rejection Error Specificity**
    - **Validates: Requirements 15.4**
    - Generate oversized files and wrong-type files
    - Assert error messages specify exact reason (size exceeded vs unsupported type)

  - [ ]* 18.9 Write property test for schema validation with field-level errors
    - **Property 18: Schema Validation with Field-Level Errors**
    - **Validates: Requirements 20.2, 20.3**
    - Generate documents with missing required fields, wrong types, out-of-range values
    - Assert rejection with field-specific error identification

  - [ ]* 18.10 Write property test for timestamp auto-management
    - **Property 19: Timestamp Auto-Management**
    - **Validates: Requirements 20.4**
    - Insert documents, verify createdAt is set; update documents, verify updatedAt ≥ previous value


- [x] 19. SEO, Accessibility, and Performance optimization
  - [x] 19.1 Implement SEO meta tags, Open Graph, and semantic HTML across all pages
    - Add unique meta title, meta description, and Open Graph tags (og:title, og:description, og:image) to every page via Next.js Metadata API
    - Ensure semantic HTML structure: header, nav, main, section, footer on every page
    - Add JSON-LD structured data for organization on home page
    - Create `public/robots.txt` and generate `sitemap.xml` from routes
    - _Requirements: 16.5_

  - [x] 19.2 Implement accessibility and performance optimizations
    - Use `next/image` for all CMS images (automatic optimization, lazy loading)
    - Add `prefers-reduced-motion` media query check — disable all hover animations and transitions when enabled
    - Ensure consistent 24px+ spacing between sections, max 3 sentences per paragraph block
    - Add font preloading for theme font
    - Verify mobile-first breakpoints (640px sm, 768px md, 1024px lg, 1280px xl) across all pages
    - Target LCP ≤ 2.5s on 4G connection
    - _Requirements: 16.1, 16.2, 16.3, 16.5, 16.6, 16.7_

- [x] 20. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major phases
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- The backend runs on port 5000, frontend on port 3000 — configure proxy in next.config.ts
- All sensitive configuration (DB URI, JWT secret) stored in environment variables
- The seed script is idempotent — safe to run multiple times
- fast-check library is used for property-based testing with minimum 100 iterations per property
- Tag format for PBT: `// Feature: meetvia-platform, Property {N}: {title}`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4"] },
    { "id": 4, "tasks": ["3.1", "3.2", "4.1", "4.2", "4.3"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 6, "tasks": ["6.1"] },
    { "id": 7, "tasks": ["8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3"] },
    { "id": 9, "tasks": ["8.4"] },
    { "id": 10, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 11, "tasks": ["9.4", "10.1", "10.2", "10.3", "10.4", "10.5"] },
    { "id": 12, "tasks": ["12.1"] },
    { "id": 13, "tasks": ["12.2"] },
    { "id": 14, "tasks": ["12.3", "13.1", "13.2", "13.3"] },
    { "id": 15, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5"] },
    { "id": 16, "tasks": ["16.1", "16.2", "16.3", "17.1", "17.2"] },
    { "id": 17, "tasks": ["17.3", "17.4", "17.5", "17.6"] },
    { "id": 18, "tasks": ["18.1", "18.2", "18.3", "18.4", "18.5"] },
    { "id": 19, "tasks": ["18.6", "18.7", "18.8", "18.9", "18.10"] },
    { "id": 20, "tasks": ["19.1", "19.2"] }
  ]
}
```
