# Requirements Document

## Introduction

Meetvia is a CMS-powered, futuristic 3D website and admin panel for a professional public companionship and visitor assistance platform operating in India. The platform provides structured, safe, public-only city assistance services for domestic and international visitors. All website content is managed through an admin dashboard and served via an API-first architecture, enabling future mobile app integration using the same backend APIs.

## Glossary

- **Website**: The public-facing React/Next.js frontend application accessible to visitors
- **Admin_Panel**: The protected administrative interface for managing all website content and platform data
- **CMS_Engine**: The backend system (Node.js + Express or FastAPI) that serves content from the database via REST APIs
- **Theme_Manager**: The admin module responsible for managing visual theme settings including colors, fonts, and effects
- **Hero_Manager**: The admin module for managing hero section slides, media, text, and animations
- **Services_Manager**: The admin module for CRUD operations on service offerings
- **Media_Library**: The admin module for uploading and managing images and videos
- **Cities_Manager**: The admin module for managing available cities
- **Inquiry_Manager**: The admin module for viewing and tracking contact form submissions
- **Companion_Manager**: The admin module for managing companion applications
- **Pages_Manager**: The admin module for editing legal and static page content
- **Footer_Manager**: The admin module for managing footer content and social media links
- **Site_Settings**: Global configuration stored in the database including site name, logo, and metadata
- **Seed_Data**: The initial default content loaded into the database on first setup
- **JWT_Auth**: JSON Web Token based authentication for admin access
- **Visitor**: A public user browsing the website
- **Admin_User**: An authenticated user with access to the Admin_Panel
- **Companion_Applicant**: A person submitting an application through the Become a Companion page

## Requirements

### Requirement 1: API-First Content Architecture

**User Story:** As a platform owner, I want all website content served from a database via REST APIs, so that the same data can be used by both the website and a future mobile app without duplication.

#### Acceptance Criteria

1. THE CMS_Engine SHALL serve all public website content through versioned REST API endpoints using a URL path prefix versioning scheme (e.g., /api/v1/)
2. THE CMS_Engine SHALL store all editable content in MongoDB collections
3. THE Website SHALL fetch all display content from the CMS_Engine API at runtime via server-side requests during page rendering, so that responses served to visitors contain up-to-date CMS content without requiring a rebuild
4. THE CMS_Engine SHALL expose public API routes under a distinct path prefix (e.g., /api/v1/public/) requiring no authentication, and admin API routes under a separate path prefix (e.g., /api/v1/admin/) requiring a valid JWT token
5. IF the CMS_Engine receives a request to a protected admin endpoint without a valid JWT token or with an expired, malformed, or incorrectly signed token, THEN THE CMS_Engine SHALL return a 401 Unauthorized response with a JSON body containing an error message indicating the authentication failure reason
6. THE CMS_Engine SHALL provide a seed script that populates all default content into the database on first setup, and IF the seed script detects that content already exists in a collection, THEN THE CMS_Engine SHALL skip seeding that collection without overwriting existing data
7. THE CMS_Engine SHALL return all API responses in JSON format and respond to public read endpoints within 2 seconds under normal load

### Requirement 2: Admin Authentication

**User Story:** As an admin, I want secure login to the admin panel, so that only authorized users can manage website content.

#### Acceptance Criteria

1. WHEN an Admin_User navigates to /admin/login, THE Admin_Panel SHALL display a login form requesting email and password, with email validated as a valid email format and password requiring at least 1 character
2. WHEN valid credentials are submitted, THE CMS_Engine SHALL return a signed JWT token with a default expiration of 24 hours, configurable via environment variable between 1 and 168 hours
3. IF invalid credentials are submitted, THEN THE CMS_Engine SHALL return a 401 response with an error message indicating that the email or password is incorrect, without specifying which field is wrong
4. IF the login form is submitted with an empty email or empty password field, THEN THE Admin_Panel SHALL display a validation error indicating which required fields are missing and SHALL NOT send a request to the CMS_Engine
5. WHILE an Admin_User holds a valid JWT token, THE Admin_Panel SHALL allow access to all admin dashboard modules
6. IF a JWT token has expired or is invalid when an Admin_User attempts to access an admin route, THEN THE Admin_Panel SHALL redirect the user to /admin/login
7. THE CMS_Engine SHALL store admin passwords using bcrypt hashing with a minimum cost factor of 10
8. THE Seed_Data SHALL include one default admin account with email admin@meetvia.com and password ChangeMe123!

### Requirement 3: Theme Management

**User Story:** As an admin, I want to customize the website's visual theme from the dashboard, so that I can update the look and feel without code changes.

#### Acceptance Criteria

1. THE Theme_Manager SHALL provide at least three theme presets: Futuristic Blue, Luxury Dark, and Clean White
2. THE Theme_Manager SHALL allow customization of primary color, secondary color, accent color, background color, text color, font family, border radius (integer value from 0 to 32 pixels), and glassmorphism effect intensity (integer value from 0 to 100 where 0 is no effect and 100 is maximum blur and transparency)
3. WHEN an Admin_User selects a theme preset, THE Theme_Manager SHALL populate all customization fields with the preset values
4. WHEN an Admin_User modifies any theme customization field, THE Theme_Manager SHALL update an inline preview reflecting the change without requiring a page reload
5. WHEN theme settings are saved, THE CMS_Engine SHALL store the settings in the ThemeSettings collection
6. IF the CMS_Engine theme settings API is unavailable or returns an error during Website initialization, THEN THE Website SHALL apply the default Futuristic Blue theme values defined in the client application
7. THE Website SHALL load theme settings from the CMS_Engine API on initialization and apply them to all pages
8. THE Seed_Data SHALL set the default theme to Futuristic Blue with primary color white, secondary color deep navy, and accent color electric blue
9. IF an Admin_User submits a color value that is not a valid hex color code or submits a border radius or glassmorphism intensity value outside the allowed range, THEN THE Theme_Manager SHALL display a validation error and prevent saving

### Requirement 4: Hero Section Management

**User Story:** As an admin, I want to manage hero section slides with media, text, and animations, so that I can create an engaging first impression for visitors.

#### Acceptance Criteria

1. THE Hero_Manager SHALL support multiple hero slides with left/right navigation arrows on the Website
2. THE Hero_Manager SHALL allow each slide to contain: background image or video, overlay opacity (0 to 100), heading text (maximum 200 characters), subtitle text (maximum 500 characters), includes list, call-to-action button text, and call-to-action button link
3. THE Hero_Manager SHALL allow reordering, adding, and removing slides with drag-and-drop or manual order input
4. WHEN a hero slide contains a video, THE Website SHALL display the video within a 3D-styled card frame with autoplay muted
5. THE Website SHALL animate hero text using scroll-triggered animations (GSAP ScrollTrigger or Framer Motion) where text is hidden initially, the section pins on scroll, reveals text with fade/translate animation, then unpins and normal scrolling resumes
6. THE Seed_Data SHALL include two default hero slides: one titled "International Visitor City Guide" with a subtitle about foreign travelers, and one titled "Domestic & International Travel Support" with a subtitle about travel assistance
7. IF only one hero slide exists, THE Website SHALL hide the left/right navigation arrows
8. THE Hero_Manager SHALL allow toggling slide visibility (show/hide) without deleting

### Requirement 5: Services Management

**User Story:** As an admin, I want full CRUD control over service offerings, so that I can add, edit, remove, and reorder services displayed on the website.

#### Acceptance Criteria

1. THE Services_Manager SHALL provide create, read, update, and delete operations for service entries
2. THE Services_Manager SHALL allow each service to contain: title (maximum 100 characters), description (maximum 500 characters), duration, location type (Public/Virtual/Flexible), image or video, thumbnail, what's-included list, button text, button link, featured toggle, show/hide toggle, and display order
3. THE Website SHALL display services as 3D glassmorphism cards with hover animations (200-400ms duration) that reveal title, description, duration, location, and a booking button
4. THE Website SHALL display services in a 2-column grid on desktop (≥768px) and 1-column on mobile (<768px) on the /services page
5. THE Website SHALL display a preview of featured or first 6 services on the home page using the same card style with a "View All Services" button
6. THE Seed_Data SHALL include six default services: City Exploration, Virtual City Tour, Shopping & Event Companion, Guided City Experience, Domestic Travel Experience, and International Visitor Travel Support
7. IF a service has a video assigned, THE Website SHALL display a thumbnail with a play overlay icon in the normal card state

### Requirement 6: Navigation and Routing

**User Story:** As a visitor, I want clear navigation to access all public pages, so that I can find information and services easily.

#### Acceptance Criteria

1. THE Website SHALL display a navbar on every page containing only these links: Home, Services, Become a Companion, Contact, with the current page link visually distinguished from the others
2. THE Website SHALL implement these public routes: / (home), /services, /become-companion, /contact, /faq, /testimonials, /safety-policy, /terms-of-service, /privacy-policy, /refund-policy
3. IF an unauthenticated user navigates to a protected route (/admin/dashboard), THEN THE Website SHALL redirect the user to /admin/login
4. THE Website SHALL NOT display a separate "How It Works" page or link in the navbar
5. THE Website SHALL display the "How Meetvia Works" content only as a section on the home page
6. IF a user navigates to an undefined route, THEN THE Website SHALL display a 404 page containing a message indicating the page was not found and a link to return to the home page
7. THE Website SHALL implement these protected routes: /admin/login, /admin/dashboard

### Requirement 7: Home Page Structure

**User Story:** As a visitor, I want a well-structured home page with key information sections, so that I can understand Meetvia's offerings at a glance.

#### Acceptance Criteria

1. THE Website SHALL display the home page sections in this order: Hero Section, How Meetvia Works, Safety/Verification, Services Preview, Become a Verified Companion, Available Cities, FAQ Preview, Testimonials Preview, Contact Section
2. THE Website SHALL display the "How Meetvia Works" section with a default of three steps: Choose Activity, Confirm Public Meeting, Enjoy Structured Session, where each step displays a step number, title, and short description
3. THE Admin_Panel SHALL allow editing, adding, removing, and reordering steps in the "How Meetvia Works" section up to a maximum of 10 steps
4. THE Website SHALL display a Safety/Verification section containing a heading, descriptive text, a notice box, a checklist of at least one safety measure, and a button linking to /safety-policy
5. THE Website SHALL display the Available Cities section showing currently active cities with their city name and state, with Agra, Uttar Pradesh as the default active city
6. THE Website SHALL display an FAQ Preview section with a maximum of six FAQs in accordion format and a "View All FAQs" button linking to /faq
7. WHEN no verified testimonials exist in the database, THE Website SHALL hide the Testimonials Preview section entirely
8. WHEN verified testimonials exist, THE Website SHALL display a maximum of three testimonial cards with a "View All Testimonials" button linking to /testimonials
9. THE Website SHALL display the "Become a Verified Companion" section containing a heading, a brief description of companion benefits, and a call-to-action button linking to /become-companion

### Requirement 8: Contact Form and Inquiry Management

**User Story:** As a visitor, I want to submit inquiries through a contact form, so that I can request information or book services.

#### Acceptance Criteria

1. THE Website SHALL display a contact form with these fields: Full Name (required, maximum 100 characters), Email (required, valid email format), Mobile Number (optional, valid phone format), Type of Service (required, dropdown populated from active services), Preferred Date (optional, date picker), and Message (required, maximum 2000 characters)
2. THE Website SHALL require the visitor to check a safety confirmation checkbox before allowing form submission, where the checkbox text is editable from Site_Settings
3. IF the safety checkbox is not checked, THEN THE Website SHALL prevent form submission and display a validation message indicating the safety confirmation is required
4. IF any required field is empty or fails format validation, THEN THE Website SHALL prevent form submission and display inline validation messages indicating which fields need correction
5. WHEN a contact form is submitted successfully, THE Website SHALL display a success message on the same page with a "Continue on WhatsApp" button that opens WhatsApp with the admin-configured phone number and prefilled message
6. THE Website SHALL display a WhatsApp quick-assistance box alongside the contact form with a "Message on WhatsApp" button
7. THE CMS_Engine SHALL store all contact submissions in the ContactInquiry collection with fields: fullName, email, mobile, serviceType, preferredDate, message, safetyConfirmed, status (defaulting to "new"), adminNotes, and timestamps
8. THE Inquiry_Manager SHALL display all inquiries with search/filter by status and allow status updates (new, reviewed, contacted, closed, rejected) and admin notes

### Requirement 9: Companion Application Management

**User Story:** As a potential companion, I want to submit an application through the website, so that I can join the Meetvia platform as a verified companion.

#### Acceptance Criteria

1. THE Website SHALL display the /become-companion page with a "Why Join Meetvia" section, a requirements list, and an application form
2. THE Website SHALL include these required application form fields: Full Name (maximum 100 characters), Email (valid email format), Mobile Number (valid 10-digit Indian mobile number), City (dropdown populated from active cities in the Cities_Manager), Experience description (maximum 1000 characters), and Why join reason (maximum 1000 characters)
3. THE Website SHALL display a safety notice above the submit button on the application form
4. IF any required field is empty or fails its format validation, THEN THE Website SHALL prevent form submission and display a validation message indicating which fields need correction
5. WHEN a companion application is submitted successfully, THE CMS_Engine SHALL store it in the CompanionApplication collection with a status field defaulting to "pending"
6. WHEN a companion application is submitted successfully, THE Website SHALL display a success confirmation message on the same page
7. IF the companion application submission fails due to a server error, THEN THE Website SHALL display an error message indicating the submission could not be completed and preserve the entered form data
8. THE Companion_Manager SHALL display all applications with filtering by status and allow status updates (pending, reviewing, approved, rejected) and admin notes

### Requirement 10: FAQ Management

**User Story:** As an admin, I want to manage FAQs from the dashboard, so that I can keep visitor questions and answers current.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide full CRUD operations for FAQ entries through the FAQ_Manager module, where each FAQ entry contains: question text (maximum 200 characters), answer text (maximum 2000 characters), and display order
2. THE Website SHALL display all FAQs on the /faq page in an accordion UI where each item shows the question as a clickable header and expands to reveal the answer
3. THE Website SHALL display the first six FAQs by display order in the home page FAQ Preview section
4. THE Seed_Data SHALL include six default FAQ entries relevant to Meetvia services
5. WHEN an Admin_User reorders FAQs, THE Website SHALL display FAQs in the admin-specified display order on both the /faq page and the home page FAQ Preview section
6. IF an Admin_User submits a FAQ entry with an empty question or empty answer, THEN THE FAQ_Manager SHALL reject the submission and display a validation error message indicating the missing field
7. IF no FAQ entries exist in the database, THEN THE Website SHALL display an informational empty state message on the /faq page indicating no FAQs are available

### Requirement 11: Testimonials Management

**User Story:** As an admin, I want to manage testimonials with a verified toggle, so that I can control which reviews are displayed publicly.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide full CRUD operations for testimonial entries through the Testimonials_Manager module, where each entry contains: reviewer name (maximum 100 characters), location/country (optional, maximum 100 characters), review text (maximum 500 characters), rating (optional, integer 1-5), image (optional), verified toggle, show/hide toggle, and display order
2. THE Admin_Panel SHALL provide a "verified" toggle for each testimonial entry
3. THE Website SHALL display only testimonials marked as both verified and visible (show) on the /testimonials page, sorted by display order
4. WHEN no verified and visible testimonials exist, THE Website SHALL display a graceful empty state on the /testimonials page with the message "No visitor stories are available yet."
5. THE Website SHALL display testimonials as minimal cards showing reviewer name, review text, and a verification badge icon

### Requirement 12: Cities Management

**User Story:** As an admin, I want to manage available cities, so that the platform can expand to new locations in the future.

#### Acceptance Criteria

1. THE Cities_Manager SHALL provide full CRUD operations for city entries
2. THE Cities_Manager SHALL allow each city to contain: city name (maximum 100 characters), state (maximum 100 characters), country (maximum 100 characters), status (active/inactive), and display order (positive integer)
3. THE Website SHALL display only cities with active status in the Available Cities section, sorted in ascending display order
4. THE CMS_Engine SHALL expose a public cities API endpoint that returns only active cities sorted by display order for future mobile app consumption
5. THE Seed_Data SHALL include Agra, Uttar Pradesh, India as the default active city with display order 1
6. IF an Admin_User attempts to create a city with a city name and state combination that already exists, THEN THE Cities_Manager SHALL reject the entry and display an error message indicating the city already exists

### Requirement 13: Legal Pages Management

**User Story:** As an admin, I want to edit legal page content from the dashboard, so that I can update policies without developer intervention.

#### Acceptance Criteria

1. THE Pages_Manager SHALL provide a rich-text editor for each legal page (Safety Policy, Terms of Service, Privacy Policy, and Refund Policy) supporting at minimum: headings, bold, italic, bullet lists, numbered lists, and hyperlinks
2. THE Website SHALL render legal page content as formatted HTML from the database on routes /safety-policy, /terms-of-service, /privacy-policy, and /refund-policy, displaying the page title as a heading and the rich-text body below it
3. THE Seed_Data SHALL include placeholder content for all four legal pages with a heading and at least one paragraph of body text per page
4. WHEN an Admin_User updates a legal page, THE Website SHALL display the updated content on the next page load without requiring a server restart or redeployment
5. IF the CMS_Engine cannot retrieve legal page content for a requested route, THEN THE Website SHALL display an error message indicating the page is temporarily unavailable
6. THE Pages_Manager SHALL enforce a maximum content length of 100,000 characters per legal page

### Requirement 14: Footer Management

**User Story:** As an admin, I want to manage footer content and social media links, so that I can keep branding and contact channels current.

#### Acceptance Criteria

1. THE Website SHALL display the footer on every page containing: Meetvia logo, a one-line description (maximum 200 characters), legal links (Safety Policy, Terms of Service, Privacy Policy, Refund Policy), and social media icons
2. THE Website SHALL NOT display a "Quick Links" section in the footer
3. THE Footer_Manager SHALL allow editing of the footer description text
4. THE Footer_Manager SHALL allow CRUD operations on social media links with fields: platform name, URL (validated as a valid URL format), icon identifier, show/hide toggle, and display order
5. THE Website SHALL display social media icons at a minimum size of 32x32 pixels for: Instagram, Facebook, YouTube, LinkedIn, and WhatsApp, sorted by display order
6. THE Seed_Data SHALL include default social media link entries for Instagram, Facebook, YouTube, LinkedIn, and WhatsApp with placeholder URLs
7. IF an Admin_User submits a social link with an invalid URL format, THEN THE Footer_Manager SHALL display a validation error and prevent saving

### Requirement 15: Media Library

**User Story:** As an admin, I want to upload and manage media files, so that I can use images and videos across the website content.

#### Acceptance Criteria

1. THE Media_Library SHALL support uploading of image files (JPEG, PNG, WebP, SVG) and video files (MP4, WebM)
2. THE Media_Library SHALL store uploaded files locally on the server using unique generated filenames and SHALL store file metadata (original filename, file type, file size, upload date, and storage path) in the Media collection
3. THE Media_Library SHALL validate file types by checking both MIME type and file extension, and SHALL enforce a maximum file size of 10MB for images and 100MB for videos
4. IF an uploaded file exceeds the size limit or has an unsupported type, THEN THE Media_Library SHALL reject the upload and display an error message indicating the specific reason for rejection (file size exceeded or unsupported file type)
5. THE Media_Library SHALL display uploaded media in a paginated grid view with a default of 20 items per page, with search by filename and filtering by file type (images or videos)
6. THE Media_Library SHALL provide delete functionality that removes both the stored file and its metadata from the Media collection
7. IF no media has been uploaded for a content element, THEN THE Website SHALL display a default placeholder image included in the Seed_Data
8. WHEN an Admin_User uploads a file with a name that already exists, THE Media_Library SHALL store the file with a unique generated filename to prevent naming collisions

### Requirement 16: Visual Design and Responsiveness

**User Story:** As a visitor, I want a visually appealing, fast, and mobile-friendly website, so that I can browse comfortably on any device.

#### Acceptance Criteria

1. THE Website SHALL implement a mobile-first responsive design using Tailwind CSS with breakpoints at 640px (sm), 768px (md), 1024px (lg), and 1280px (xl)
2. THE Website SHALL use 3D glassmorphism card effects with hover animations powered by Framer Motion or GSAP, where each animation completes within 200ms to 400ms
3. THE Website SHALL use consistent spacing of at least 24px between content sections and limit paragraph text to a maximum of three sentences per block to maintain a clean layout
4. THE Website SHALL use icons from a standard icon library in navigation items, service cards, and action buttons to reduce text clutter
5. THE Website SHALL render all pages with a unique meta title, meta description, and Open Graph tags, use semantic HTML elements (header, nav, main, section, footer), and achieve a Largest Contentful Paint of 2.5 seconds or less on a 4G mobile connection
6. IF no custom theme is active in the ThemeSettings collection, THEN THE Website SHALL apply the default color scheme of white, deep navy, and electric blue
7. WHILE a user has enabled reduced motion in their operating system preferences, THE Website SHALL disable all hover animations and transition effects

### Requirement 17: Admin Dashboard Overview

**User Story:** As an admin, I want a dashboard overview with key statistics, so that I can monitor platform activity at a glance.

#### Acceptance Criteria

1. WHEN an Admin_User accesses /admin/dashboard, THE Admin_Panel SHALL display summary statistics cards showing: total services, total inquiries (with count of new inquiries), total companion applications, total FAQs, total testimonials, total active cities, and total media items
2. THE Admin_Panel SHALL provide navigation to all admin modules: Page Manager, Theme Manager, Hero Manager, Services Manager, Media Library, FAQ Manager, Testimonials Manager, Cities Manager, Contact Inquiries Manager, Companion Applications Manager, Footer/Social Manager, and Site Settings
3. THE Admin_Panel SHALL be accessible only to authenticated Admin_Users with valid JWT tokens
4. IF the dashboard statistics API fails, THEN THE Admin_Panel SHALL display an error message and still render the navigation to all modules

### Requirement 18: Site Settings Management

**User Story:** As an admin, I want to manage global site settings, so that I can update the site name, logo, and metadata without code changes.

#### Acceptance Criteria

1. THE Site_Settings module SHALL allow editing of: site name (maximum 100 characters), site logo, site favicon, meta title (maximum 60 characters), meta description (maximum 160 characters), contact email, contact phone, WhatsApp number, and WhatsApp prefilled message
2. THE Website SHALL load site settings from the CMS_Engine API and apply the site name to the page header and browser tab, the site logo to the navbar and footer, the favicon to the browser tab icon, and the meta title and meta description to page HTML metadata
3. THE Seed_Data SHALL include default site settings with "Meetvia" as the site name, a meta title of "Meetvia" and a meta description summarizing the platform's city assistance services
4. IF an Admin_User submits site settings with an invalid email format or with required fields (site name, meta title) left empty, THEN THE Site_Settings module SHALL reject the update and display a validation error message indicating the invalid fields

### Requirement 19: Security and Configuration

**User Story:** As a platform owner, I want secure defaults and proper configuration management, so that the platform is safe to deploy.

#### Acceptance Criteria

1. THE CMS_Engine SHALL protect all admin API routes with JWT middleware validation
2. THE CMS_Engine SHALL hash all passwords using bcrypt before storing in the database
3. THE CMS_Engine SHALL validate all file uploads by checking that the detected MIME type matches the declared file extension, and SHALL reject files where the MIME type does not match
4. THE CMS_Engine SHALL store all sensitive configuration (database URI, JWT secret, API keys) in environment variables
5. THE CMS_Engine SHALL provide a .env.example file documenting all required environment variables without actual secret values
6. THE CMS_Engine SHALL implement rate limiting on authentication endpoints with a maximum of 5 login attempts per IP address per 15-minute window, and IF the limit is exceeded, THEN THE CMS_Engine SHALL return a 429 response indicating the retry delay
7. IF a JWT token is expired, malformed, or signed with an incorrect secret, THEN THE CMS_Engine SHALL return a 401 Unauthorized response and SHALL NOT process the requested admin operation

### Requirement 20: Database Models

**User Story:** As a developer, I want well-defined database models, so that data is structured consistently across the platform.

#### Acceptance Criteria

1. THE CMS_Engine SHALL implement these MongoDB collections: AdminUser, SiteSettings, ThemeSettings, Page, HeroSlide, Service, Media, FAQ, Testimonial, City, ContactInquiry, CompanionApplication, LegalPage, and SocialLink
2. THE CMS_Engine SHALL enforce schema validation on all collections with required fields and type constraints, rejecting any insert or update operation that violates the schema
3. IF a document insert or update fails schema validation, THEN THE CMS_Engine SHALL reject the operation and return an error response indicating which field failed validation
4. THE CMS_Engine SHALL automatically set the createdAt timestamp field when a document is first inserted and automatically update the updatedAt timestamp field on every subsequent modification, on all collections
5. THE CMS_Engine SHALL store displayOrder as an integer field with a default value of 0 on collections that require admin-controlled ordering (HeroSlide, Service, FAQ, Testimonial, City, SocialLink), and SHALL return documents sorted by displayOrder in ascending order on public API responses for those collections
