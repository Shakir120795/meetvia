# Meetvia Platform

## Overview

Meetvia is a CMS-powered web platform for professional public companionship and visitor assistance services in India. The system provides a futuristic, 3D-animated public-facing website and a full-featured admin dashboard for managing all content, media, inquiries, and companion applications.

All website content is admin-managed through a dashboard and served via versioned REST endpoints, enabling future mobile app integration without any frontend rebuild.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 3, Framer Motion, GSAP
- **Backend:** Express.js, TypeScript, MongoDB, Mongoose
- **Auth:** JWT-based admin authentication (stateless, no server sessions)
- **Media:** Local file storage with adapter interface (ready for S3/Cloudinary migration)
- **Validation:** Joi (backend), Zod + React Hook Form (frontend)
- **Testing:** Jest, Supertest, fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Meetvia
   ```

2. **Backend setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend setup**

   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env` with your MongoDB connection string and JWT secret:

   ```env
   MONGO_URI=mongodb://localhost:27017/meetvia
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRY=24h
   PORT=5000
   NODE_ENV=development
   ```

5. **Seed the database**

   ```bash
   cd backend
   npm run seed
   ```

   This populates default admin user, theme settings, site settings, and sample content. The seed script is idempotent — running it again will not duplicate or overwrite existing data.

6. **Start the backend** (port 5000)

   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend** (port 3000)

   ```bash
   cd frontend
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the public site and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the admin dashboard.

### Admin Login

- **Email:** admin@meetvia.com
- **Password:** ChangeMe123!

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY** after first login. This is a default seed credential for development only.

## Environment Variables

All backend environment variables are documented in `backend/.env.example`:

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/meetvia` |
| `JWT_SECRET` | Secret key for signing JWT tokens | — (must be set) |
| `JWT_EXPIRY` | Token expiration duration | `24h` |
| `PORT` | Express server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

## Media Upload

- **Supported image formats:** JPEG, PNG, WebP, SVG
- **Supported video formats:** MP4, WebM
- **Image size limit:** 10 MB
- **Video size limit:** 100 MB
- Files are stored in `backend/uploads/` with subdirectories (`images/`, `videos/`)
- Each file gets a UUID-based unique filename to prevent collisions
- MIME type validation ensures file extension matches actual content
- The storage layer uses an adapter interface — swap `LocalStorageAdapter` for `S3StorageAdapter` or `CloudinaryAdapter` when ready for cloud deployment

## API Documentation

### Public Endpoints (no auth required)

All public endpoints are under `/api/v1/public/`:

| Endpoint | Description |
|----------|-------------|
| `GET /site-settings` | Site name, logo, meta tags, WhatsApp config |
| `GET /theme` | Active theme colors and settings |
| `GET /hero-slides` | Visible hero slides sorted by order |
| `GET /services` | All visible services |
| `GET /services/featured` | Featured services (max 6) for homepage |
| `GET /cities` | Active cities |
| `GET /faq` | All FAQs |
| `GET /faq/preview` | First 6 FAQs for homepage |
| `GET /testimonials` | Verified and visible testimonials |
| `GET /testimonials/preview` | Max 3 testimonials for homepage |
| `GET /pages/:slug` | Legal pages (safety-policy, terms-of-service, etc.) |
| `GET /footer` | Footer description + social links |
| `GET /how-it-works` | How It Works steps |
| `POST /contact` | Submit contact inquiry |
| `POST /companion-application` | Submit companion application |

### Admin Endpoints (JWT required)

All admin endpoints are under `/api/v1/admin/` and require `Authorization: Bearer <token>` header.

Full CRUD is available for: hero slides, services, FAQs, testimonials, cities, social links, media, and legal pages. The admin can also manage inquiries, companion applications, theme settings, site settings, and footer content.

## Deployment Guide

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Production Considerations

- Set `NODE_ENV=production` in backend `.env`
- Use a strong, unique `JWT_SECRET` (minimum 32 characters)
- Configure MongoDB with authentication and replica set for high availability
- Serve uploaded files through a CDN or reverse proxy (nginx) in production
- Set up HTTPS via reverse proxy (nginx/Caddy) in front of both services
- Consider migrating file storage to S3/Cloudinary for scalability
- Configure rate limiting values appropriate for your traffic (currently 5 login attempts per 15 minutes per IP)

### Docker (optional)

Both services can be containerized. Ensure:
- MongoDB is accessible from the backend container
- The `uploads/` volume is persisted
- Frontend can reach backend at the configured API URL

## Performance Optimizations

- **Font preloading:** Inter font loaded via `next/font/google` with `display: 'swap'` for zero flash of unstyled text
- **Image optimization:** `next/image` used for CMS images with automatic WebP conversion, lazy loading, and responsive srcsets
- **Reduced motion:** `prefers-reduced-motion` media query respected — all hover animations and transitions are disabled when the user prefers reduced motion
- **Mobile-first responsive:** Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px) with mobile-first design
- **Target LCP:** ≤ 2.5s on 4G connection with priority loading for above-the-fold hero images

## Accessibility

- Semantic HTML structure throughout
- ARIA labels on interactive elements
- Keyboard-navigable admin dashboard
- Focus management for modals and form flows
- `prefers-reduced-motion` support disabling animations
- Minimum 24px spacing between content sections
- Readable text with max 3 sentences per paragraph block in CMS content

## Future: Mobile App API

The REST API is designed for multi-client consumption. To add a mobile app:

1. All public endpoints already return JSON suitable for native rendering
2. Authentication flow (JWT) works identically for mobile clients
3. File upload endpoint accepts standard multipart/form-data
4. Consider adding push notification endpoints under `/api/v1/admin/notifications`
5. Add API versioning (already at v1) to maintain backward compatibility
6. Consider adding refresh token rotation for long-lived mobile sessions

## Project Structure

```
Meetvia/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express entry point
│   │   ├── config/            # DB, env, seed
│   │   ├── middleware/        # Auth, upload, rate limit, validation
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Public + admin route groups
│   │   ├── controllers/       # Business logic
│   │   └── utils/             # JWT, password, storage helpers
│   ├── uploads/               # Local file storage
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # UI, layout, home, forms, admin
│   │   ├── context/           # Auth + Theme providers
│   │   ├── hooks/             # useAuth, useReducedMotion, useTheme
│   │   ├── lib/               # API client, auth helpers, theme utils
│   │   └── types/             # TypeScript interfaces
│   ├── public/                # Static assets
│   ├── tailwind.config.ts
│   └── package.json
└── README.md
```

## License

Private — All rights reserved.
