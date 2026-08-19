# CURRICULA — Frontend Architecture

# React Native (Expo) App

---

## Contents

1. Overview
2. Engineering Principles (SOLID & DRY) & Reusability
3. Tech Stack
4. Top-Level Folder Structure
5. Navigation
6. State Management
7. API Layer
8. Auth & Session Handling
9. RBAC & Access Control (Frontend)
10. Push Notifications
11. Payments UX
12. Images (Cloudinary)
13. Loading / Empty / Error States
14. Testing

---

# 1. Overview

This app is built with **Expo** (managed workflow, using an **EAS custom dev client** so that
native modules like direct-FCM push registration are available without ejecting). It is
TypeScript throughout, dark-themed by default, and structured so its module boundaries mirror
the backend's 1:1: one `api/` file and one `hooks/` file per backend domain
(`auth`, `catalogue`, `order`, `notification`, `admin`; see `backend-architecture.md` §6–7).

The app covers all 26 screens from `project.md` across two journeys:

- **Student journey** (16 screens) — Splash through Settings
- **Admin journey** (10 screens) — Admin Login through Notifications (broadcast)

---

# 2. Engineering Principles (SOLID & DRY) & Reusability

Same discipline as the backend (`backend-architecture.md` §2), applied to components/hooks:

- **Single Responsibility** — screens only compose UI and call hooks; they never fetch data
  directly. Data-fetching/mutation logic lives in `hooks/`, request/response shaping lives in
  `api/`, presentation lives in `components/`. A component doing more than one of
  "fetch," "shape," or "render" is a sign it needs to be split.
- **Open/Closed** — shared components take a `variant` prop instead of being forked per
  journey: `<Button variant="student" | "admin">`, `<AppText variant="title" | "body" | ...>`
  (`design-system.md` §3/§7). Adding the Admin look-and-feel never means copy-pasting
  `Button` into an `AdminButton`.
- **Liskov Substitution** — any component implementing a shared contract (e.g. a form field
  wired to `react-hook-form`) must be swappable for another implementing the same contract
  without the parent form knowing the difference.
- **Interface Segregation** — domain hooks (`useBooks`, `useCart`, `useOrders`) return only
  what screens actually consume (`data`, `isLoading`, `isError`, the specific mutation
  functions) — screens don't reach into raw React Query internals they don't need.
- **Dependency Inversion** — screens depend on `hooks/` and `api/` abstractions, never import
  Axios or construct URLs directly; navigation actions go through the typed navigation prop,
  never a global ref or manual linking call.
- **DRY, concretely:**
  - One `Button`, `Card`, `Input`, `BookCard`, `StatusPill`, `EmptyState`, `ErrorState`,
    `Skeleton` each (§13) — every screen reuses these rather than hand-rolling layout, so a
    visual fix in one place fixes every screen that uses it.
  - `Skeleton` is a small set of reusable shapes (list row, grid tile, detail block), composed
    per screen rather than each screen drawing its own placeholder boxes.
  - `theme.ts` (§4) is the *only* source of colors/spacing/typography — no inline hex values
    or magic pixel numbers in screen code.
  - List/pagination behavior (Store grid, Orders, Notifications feed, Admin resource lists) is
    written once as a shared pattern in `hooks/` (a `usePaginatedQuery`-style wrapper around
    TanStack Query) rather than reimplemented per screen.
  - One Axios instance, one pair of interceptors (§7) — no per-screen fetch/error-handling
    logic.
- **Reusability over duplication** — before adding a new component or hook, check whether an
  existing one in `components/`/`hooks/` already covers it and can be extended with a prop,
  rather than forking a near-identical copy.

---

# 3. Tech Stack

| Concern | Choice |
|---|---|
| Runtime | Expo (managed workflow) + EAS Build (custom dev client) |
| Language | TypeScript |
| Navigation | React Navigation (`native-stack` + `bottom-tabs`) |
| Server state | TanStack Query (React Query) |
| Local/UI state | Zustand |
| HTTP client | Axios (single instance, interceptor-based auth) |
| Secure storage | `expo-secure-store` (refresh token) |
| Push notifications | `expo-notifications` (direct FCM registration via EAS dev client) |
| Forms & validation | `react-hook-form` + `zod` |
| Images | `expo-image` (caching) + Cloudinary URL transforms |
| Payments UI | `react-native-webview` (Paystack/Flutterwave hosted checkout) |
| Icons | `@expo/vector-icons` |

---

# 4. Top-Level Folder Structure

```
mobile/
├── app.config.ts
├── src/
│   ├── App.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # gates on auth/role/account state — see §5, §9
│   │   ├── AuthStack.tsx             # Role Selection, Login, SignUp, Pending, Approved/Rejected, Preferences
│   │   ├── StudentTabNavigator.tsx   # Home, Store, Favourite, Settings
│   │   ├── StudentStack.tsx          # Book Details, Cart, Checkout, Order Confirmation, Notifications
│   │   ├── AdminTabNavigator.tsx     # Dashboard, Books, Orders, More
│   │   └── AdminStack.tsx            # Schools, Departments, Levels, Approvals, Book Editor, Order Details, Broadcast
│   ├── screens/
│   │   ├── student/                  # Home/, Store/, BookDetails/, Favourite/, Cart/, Checkout/, OrderConfirmation/, Notifications/, Settings/...
│   │   └── admin/                    # Dashboard/, Schools/, Departments/, Levels/, Approvals/, Books/, Orders/, Inventory/, Notifications/
│   ├── components/                    # shared UI — Button, Card, Input, BookCard, StatusPill, EmptyState, RoleGate...
│   ├── theme.ts                        # single file — all design tokens (see design-system.md)
│   ├── api/                            # axios instance + one file per backend module
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── catalogue.api.ts
│   │   ├── order.api.ts
│   │   ├── notification.api.ts
│   │   └── admin.api.ts
│   ├── hooks/                          # TanStack Query hooks per domain
│   │   ├── useAuth.ts
│   │   ├── useBooks.ts
│   │   ├── useCart.ts
│   │   ├── useOrders.ts
│   │   ├── useNotifications.ts
│   │   └── useAdmin*.ts
│   ├── store/                          # Zustand — authStore.ts, themeStore.ts
│   ├── lib/                            # secure token storage, push registration, cloudinary.ts (URL helpers)
│   ├── types/                          # shared TS types, mirroring backend DTOs where useful
│   └── utils/
├── assets/
├── package.json
└── tsconfig.json
```

Each `screens/<journey>/<ScreenName>/` folder holds the screen component plus any
screen-local subcomponents/hooks that aren't reused elsewhere — anything reused across screens
graduates to `components/`.

---

# 5. Navigation

`RootNavigator` is the single place that decides which stack is on screen, driven by the
three flows in `project.md` §3:

1. **Cold start** → Splash is shown while `authStore` hydrates: read the refresh token from
   `expo-secure-store`, attempt a silent token refresh, then call `GET /auth/me`.
2. **No valid session** → `AuthStack` (Role Selection → Login → Sign Up), i.e. the Main Flow
   up through registration.
3. **Session exists, account `PENDING` or `REJECTED`** → the corresponding Pending/Rejected
   screen (Approval Flow). Pending polls approval status; Rejected routes back to Login.
4. **Session exists, account `APPROVED`** → route by `user.role`:
   - `student` → `StudentTabNavigator` (Home/Store/Favourite/Settings) with `StudentStack`
     screens (Book Details, Cart, Checkout, Order Confirmation, Notifications) pushed on top.
   - `admin` → `AdminTabNavigator` (Dashboard/Books/Orders/More) with `AdminStack` screens
     (Schools, Departments, Levels, Approvals, Book Editor, Order Details, Broadcast) pushed
     on top — this is the Admin Flow.

Cross-flow dependencies from `project.md` §3.1 (Admin-managed Schools/Departments/Levels
feeding Registration & Preferences dropdowns, Books feeding Home/Store/Book Details, etc.) are
satisfied by both journeys reading from the same `catalogue`/`admin` API modules — there's no
separate "sync" step, screens just query current backend state.

This role-based branching is also the frontend's first RBAC layer — see §9 for the full
picture, including why this alone is never sufficient.

---

# 6. State Management

**TanStack Query owns all server data** — books, categories, favourites, the cart, orders,
notifications, and every admin CRUD resource. This includes the **cart**: even though it's
mutated frequently, the backend (Redis-backed, per `backend-architecture.md` §8) is the source
of truth, so the cart is just another query (`['cart']`) with optimistic mutations for
add/remove/quantity-change — there is no separate local cart store, which avoids the cart ever
drifting out of sync between a local store and the server.

**Zustand is limited to local/UI state that isn't server data:**
- `authStore` — in-memory access token, current user, role, account state, and the actions
  that drive `RootNavigator`'s branching (§5)
- `themeStore` — currently a placeholder around the single dark theme (see
  `design-system.md` §1 for why), ready to hold a theme preference if a toggle is added later

Query keys are namespaced per domain to mirror the `api/`/`hooks/` split, e.g.
`['catalogue', 'books', filters]`, `['order', 'cart']`, `['notification', 'feed']`,
`['admin', 'schools']` — this keeps invalidation targeted (e.g. placing an order invalidates
`['order', 'cart']` and `['order', 'list']` without touching unrelated queries).

---

# 7. API Layer

A single Axios instance (`api/client.ts`) is configured with:
- `baseURL` from `app.config.ts` env (dev vs prod backend URL)
- a **request interceptor** attaching `Authorization: Bearer <accessToken>` from `authStore`
- a **response interceptor** that on `401`, runs the refresh flow via `auth.api.ts`
  (`POST /auth/refresh` using the secure-stored refresh token), updates `authStore`, and
  retries the original request once — if refresh also fails, it logs the user out and
  `RootNavigator` falls back to `AuthStack`. A `403` is handled distinctly from a `401` — see
  §9.

Each `api/*.api.ts` file is a thin wrapper exposing typed functions for its backend module's
endpoints only (e.g. `catalogue.api.ts` → `getBooks()`, `getBookById()`, `getCategories()`) —
this 1:1 mapping to `backend-architecture.md`'s module boundaries means adding a backend
endpoint has one obvious place to add its frontend call, and screens never construct URLs or
call Axios directly.

---

# 8. Auth & Session Handling

- Refresh token → `expo-secure-store` (encrypted, survives app restarts).
- Access token → kept in memory only, in `authStore` (re-derived via silent refresh on cold
  start — never persisted in plaintext).
- Login/Sign Up screens call `auth.api.ts`, populate `authStore` on success, and
  `RootNavigator` reacts to the store change to move off `AuthStack`.
- Logout clears both the secure-stored refresh token and `authStore`, and calls
  `POST /auth/logout` so the backend revokes the refresh token in Redis
  (`backend-architecture.md` §9).

---

# 9. RBAC & Access Control (Frontend)

**The frontend's role checks are a UX convenience, never the security boundary.** Every
mutating/privileged action rendered here is only safe because the backend independently
enforces it (`backend-architecture.md` §10) — a hidden button, a disabled screen, or a
navigator that never mounts `AdminStack` for a student session all make for a better UX, but
none of them are what stops a student from calling an admin endpoint directly. If a new screen
or button is added here, the corresponding backend guard must exist *first*.

With that boundary clear, the frontend still implements RBAC properly at its own layer:

- **Single source of truth:** `authStore.role` and `authStore.accountState` are the only place
  role/account state are read from — no screen re-derives role from a token payload or caches
  its own copy.
- **Route-level (structural):** `RootNavigator` (§5) means a student session never mounts
  `AdminTabNavigator`/`AdminStack` at all — wrong-role screens aren't just hidden behind a
  check, they don't exist in the tree to begin with. Same for `PENDING`/`REJECTED` accounts
  and the main app stacks.
- **Component-level:** role-gated UI *within* a shared screen (e.g. an admin-only edit
  affordance on a `BookCard` reused in both journeys) is wrapped in a small
  `<RoleGate allow={['admin']}>...</RoleGate>` component (`components/`) instead of each call
  site re-implementing `if (role === 'admin')` inline — one place to audit every role-gated UI
  element in the app.
- **Deep links & notification taps:** must re-validate role/account state before navigating,
  same as any other route — a background push tap can't be allowed to route a student session
  into an admin screen just because it skips `RootNavigator`'s normal entry path.
- **403 handling:** the API layer (§7) treats `403 Forbidden` as "authenticated but not
  permitted" and surfaces a clear not-permitted state — it must never be treated like a `401`
  and trigger a token refresh/logout loop, since the token is fine; the action just isn't
  allowed.

---

# 10. Push Notifications

Because the backend sends pushes directly via `firebase-admin` (not Expo's push relay,
per `backend-architecture.md` §3), the app needs a **real FCM device token**, which requires
an EAS custom dev client rather than the default Expo Go sandbox.

- On login (and on token refresh events from FCM), `expo-notifications` obtains the device
  token and `lib/push.ts` registers it against the backend user via `auth.api.ts` /
  `users.api.ts`.
- Foreground notifications render an in-app banner; background/killed-state taps deep-link
  into the relevant screen — order-status pushes open Order Details, broadcast/announcement
  pushes open the Notifications feed (subject to the re-validation in §9).
- The Notifications screen (15) itself is fed by `notification.api.ts` (`GET /notifications`,
  `POST /notifications/mark-all-read`), independent of whether a push was received — pushes
  are a delivery mechanism, the feed is the durable record.

---

# 11. Payments UX

1. Checkout screen (13) collects delivery method + address, calls `POST /checkout` with the
   chosen provider (`paystack` | `flutterwave`).
2. The backend responds with a `redirectUrl` (per `backend-architecture.md` §11); the app opens
   this in a `WebView` rather than embedding either SDK's native components, keeping both
   providers behind one integration path.
3. The `WebView`'s `onNavigationStateChange` watches for the provider's callback URL. On match,
   the WebView closes and the app re-fetches the order (`GET /orders/:id`) to get its
   authoritative status (the backend has already updated it via the provider's webhook).
4. Order Confirmation (14) renders once the order is `COMPLETED`; if still `PROCESSING` (webhook
   lag), the screen shows a brief pending state and polls once or twice before settling.

---

# 12. Images (Cloudinary)

Book covers, avatars, and receipt images are stored in Cloudinary by the backend
(`backend-architecture.md` §8), which returns plain Cloudinary URLs in API responses. The
frontend never uploads directly to Cloudinary for these read paths — it just renders the URL.

- `lib/cloudinary.ts` exposes a small helper to append Cloudinary's URL-based transform
  params (width/height/quality/crop) so the same stored image can be requested at a small size
  for the Store grid and a larger size for Book Details, without extra backend endpoints.
- All remote images render through `expo-image` for disk/memory caching and smoother list
  scrolling (Store grid, Cart, Order history).

---

# 13. Loading / Empty / Error States

Every data-driven screen consumes TanStack Query's `status` flags directly rather than
hand-rolling spinners:
- `isLoading` → shared `Skeleton` matching that screen's layout (e.g. book-grid skeleton on
  Store) — see the reusable `Skeleton` shapes in §2
- `isError` → shared `ErrorState` with a retry action bound to `refetch()`
- success + empty array/result → shared `EmptyState` with screen-appropriate copy (e.g. "No
  favourites yet" on screen 11, "No orders" on Orders)

---

# 14. Testing

Jest + React Native Testing Library, with `*.test.tsx` colocated next to the
screen/component under test. API modules and TanStack Query hooks are tested against a mocked
Axios instance (`jest.mock('../api/client')`) rather than hitting the real backend.

RBAC assertions belong here too: `RootNavigator` and `RoleGate` (§9) each get tests confirming
a `student` session never renders admin-only routes/components, mirroring the backend's RBAC
regression tests (`backend-architecture.md` §15).
