# GoWith — UI/UX Specification

## Visual Direction

Keywords:

```text
Dark
Futuristic
Premium
Minimal
Cinematic
Soft 3D
Glass
Glow
Clean
Mobile-first
```

Avoid:
- excessive gradients
- excessive text
- crowded dashboards
- generic bootstrap-looking layouts
- too many cards
- unnecessary animations
- autoplay audio

## Typography

Use a modern sans-serif.

Headings:
- large
- tight letter spacing
- strong hierarchy

Body:
- short
- readable
- muted color

## Colors

Primary:
- deep black/navy
- violet
- purple
- pink accent

Status:
- green = verified/success
- amber = warning
- red = danger

Keep contrast accessible.

## Motion

Use:
- slow ambient particles
- subtle hover
- card float
- page reveal
- smooth transitions

Avoid:
- excessive movement
- animation blocking navigation
- motion that harms accessibility

Respect `prefers-reduced-motion`.

## Responsive Breakpoints

At minimum:
- mobile
- tablet
- desktop
- wide desktop

All major pages must be tested at:
- 360px
- 390px
- 430px
- 768px
- 1024px
- 1440px

## Main Pages

```text
Home
Browse Companions
Companion Profile
Experience Discovery
Booking
Checkout
Booking Details
Chat
User Account
Become a Companion
Verification
Companion Dashboard
Admin Dashboard
About
How It Works
Contact
Safety
Legal
```

## Empty States

Every list needs:
- loading
- empty
- error
- retry

## Accessibility

Required:
- keyboard navigation
- focus states
- semantic HTML
- labels
- alt text
- sufficient contrast
- reduced-motion support
