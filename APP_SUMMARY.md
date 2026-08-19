# CURRICULA

A mobile bookshop app for university students (originally built around FUTA — the Federal
University of Technology, Akure) — browse, favourite, and buy textbooks by department and
level, with a full admin side for managing the catalogue, org structure, and orders.

Two apps in one repo:
- **Backend** — NestJS modular monolith, Postgres (Supabase), Redis, Cloudinary, Firebase Cloud
  Messaging, Resend email.
- **Mobile** — Expo (React Native) app, one codebase serving both the student and admin
  experience, role-detected automatically at login.

---

## What it's about

Students sign up, get matched to their department/level, and can then search the catalogue,
favourite books, rate them, add to cart, and check out (Paystack or Flutterwave), with push +
email notifications for order status and new arrivals. Admins get a parallel set of screens in
the same app — dashboard KPIs, book/inventory management, order management, and org-structure
CRUD (Schools → Departments → Levels) — gated by role, not a separate app.

The catalogue is currently seeded with **1,140 books** — 20 per department across all 57 FUTA
departments (9 schools), each tagged to one of the 5 academic levels (100–500 Level).

---

## Tech stack

**Backend** (`/backend`): NestJS 11, Prisma 6 → Supabase Postgres, Redis (sessions/cache/cart),
Cloudinary (images), Firebase Admin (push), Resend + React Email (transactional email),
Paystack & Flutterwave (payments, webhook-signature-verified), JWT auth (access + refresh),
Swagger/OpenAPI at `/docs`, Jest (unit + e2e).

**Mobile** (`/mobile`): Expo SDK 57, React Native 0.86, React Navigation (native-stack +
bottom-tabs), TanStack Query (server state), Zustand (auth/theme client state), React Hook Form
+ Zod (all forms, inline validation), Axios, `expo-image`, `expo-image-picker`,
`expo-linear-gradient`, `react-native-svg`.

---

## Screens

### Pre-auth
| Screen | Notes |
|---|---|
| Splash | Animated logo + "CURRICULA" wordmark reveal, holds ~3.2s minimum |
| Onboarding | 3-slide swipeable carousel (unDraw illustrations), shown once on first launch |
| Login | Single screen — email **or** matric number (`EEE/34/1234` format) + password; backend auto-detects student vs admin from the JWT, no manual role picker |
| Sign Up | Email/matric + password + confirm + terms checkbox only — nothing else up front |
| Complete Profile | Shown once, immediately after signup, before the dashboard: full name, phone, avatar, department, level, interests |
| Forgot / Reset Password | Email-triggered reset link, deep-links back into the app |

### Student
| Screen | Notes |
|---|---|
| Home | Landing tab after login |
| Store | Search + category-chip filters + paginated book grid |
| Book Details | Cover, description, ratings, add-to-cart |
| Cart / Checkout | Delivery method, address, Paystack/Flutterwave payment |
| Order Confirmation | Post-checkout receipt |
| Favourites | Saved books |
| Notifications | Order updates, broadcasts, new-arrival alerts |
| Settings | Profile, addresses, avatar, notification prefs, change password, **light/dark theme toggle** |

### Admin
| Screen | Notes |
|---|---|
| Dashboard | KPI tiles + recent orders |
| Books | Catalogue CRUD incl. cover upload |
| Orders | All/Processing/Completed/Cancelled tabs |
| Schools / Departments / Levels | Org-structure CRUD |
| Approvals | Legacy — accounts are auto-approved on signup now; this screen still lets an admin reject/ban an account after the fact |
| Inventory | Stock-level KPIs (low/out-of-stock) |
| Notifications | Broadcast composer |
| More | Admin settings hub |

---

## Design system

### Colors — light mode (default)

A Coolors palette (indigo hero + a blue tint ramp), not a system-default light theme:

| Token | Hex |
|---|---|
| Background | `#F6FAFE` |
| Surface | `#FFFFFF` |
| Border | `#CFE6FA` |
| Primary (CTA/buttons) | `#5A55D4` |
| Secondary (links/focus) | `#3AA8E8` |
| Gold (shared-screen accent) | `#FBBF24` |
| Admin Accent | `#B45309` |
| Text Primary | `#111827` |
| Text Secondary | `#475569` |

### Colors — dark mode

Navy + ice-blue + muted gold, chosen for a "blue and gold" collegiate feel (navy ~220° and gold
~40° sit close to complementary on the color wheel):

| Token | Hex |
|---|---|
| Background | `#0A1220` |
| Surface | `#101B2E` |
| Border | `#223252` |
| Primary (CTA/buttons) | `#CCF2FA` (ice blue) |
| Secondary | `#3B82F6` |
| Gold (shared-screen accent) | `#D9B36C` |
| Admin Accent | `#C9A96E` (muted gold) |
| Text Primary | `#F2F6FA` |
| Text Secondary | `#93A4BD` |

Mode defaults to light, toggled in Settings, persisted on-device. Every screen reads colors
through one `useTheme()` hook — no hardcoded hex values anywhere in the UI layer.

### Typography

**DM Sans** throughout (`@expo-google-fonts/dm-sans`), four weights loaded and mapped to five
semantic variants:

| Variant | Size | Weight | Used for |
|---|---|---|---|
| `title` | 28px | Bold | Screen headings |
| `sectionHeader` | 18px | SemiBold | Section labels, button text |
| `body` | 14px | Regular | Body copy |
| `label` | 12px | Regular | Captions, form labels, timestamps |
| `price` | 18px | Bold | Prices (colored with the theme's Primary) |

### Spacing & shape

4/8/12/16/24/32px spacing scale; 10px input/button corners, 14px cards, fully-pill badges/chips.

---

## Key features

- **Auth**: email-or-matric login, JWT access + refresh, role auto-detected server-side, no
  manual role selection, no approval wait (accounts are auto-`APPROVED` at signup — the
  approval infrastructure still exists for admin-initiated rejections).
- **Catalogue**: search, category filters, ratings, favourites, stock-aware "in stock" badges.
- **Commerce**: cart → checkout → Paystack/Flutterwave → webhook-verified order confirmation →
  order-status notifications.
- **Notifications**: in-app + push (FCM) + email (React Email templates), deep-linking from a
  tapped notification straight to the relevant order/screen.
- **Admin**: full org-structure CRUD, book/inventory management, order oversight, broadcast
  messaging.
- **Theming**: full light/dark mode, DM Sans typography, brand palette chosen by color theory
  rather than defaults.
- **Search UX**: searchable bottom-sheet pickers for department/level selection (57 departments,
  5 levels) instead of long scrolling chip lists.
