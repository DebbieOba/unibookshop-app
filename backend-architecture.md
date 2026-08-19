# CURRICULA — Backend Architecture

# NestJS Modular Monolith

---

## Contents

1. Overview
2. Engineering Principles (SOLID & DRY)
3. Tech Stack
4. Top-Level Folder Structure
5. Module Internal Structure (Pattern)
6. Module-by-Module Specification
7. Module Dependency Graph
8. Data Ownership Mapping
9. Auth Design
10. Security & RBAC
11. Payments Design
12. Notifications & Email Channels
13. Cross-Cutting Concerns
14. Config & Environment
15. Testing Strategy
16. Local Dev & Deployment Notes

---

# 1. Overview

`project.md` describes the product architecture as five independent microservices (Auth,
Catalogue, Order, Notification, Admin) sitting behind an API Gateway. This backend implements
that same domain decomposition as a **Modular Monolith**: a single deployable NestJS
application, internally split into strictly-bounded domain modules — one per logical service.

Why a Modular Monolith instead of real microservices:

- One deployment, one process, one set of logs — far simpler to build and operate at this
  stage.
- Each domain module owns its data and exposes a narrow public API, so the *shape* of the
  system already matches the microservices diagram in `project.md`.
- If a module later needs to scale or ship independently, its folder can be lifted out and its
  in-process service calls replaced with HTTP/queue calls — without rewriting business logic.

Supabase is used **only as a hosted Postgres instance** — a plain Postgres connection string
consumed via Prisma. No Supabase Auth, no Supabase Storage, no Supabase client SDK anywhere in
the backend.

**Postgres is the only database.** There is no MongoDB anywhere in this architecture — every
module, including Catalogue (books/categories/ratings), persists to the same Supabase Postgres
instance via Prisma. `project.md`'s data layer table has been updated to match. Where
Catalogue needs flexible/variable book attributes, that's modeled with a `jsonb` column on the
`Book` table rather than reaching for a second database — one datastore, one ORM, one
connection pool to operate and reason about.

---

# 2. Engineering Principles (SOLID & DRY)

These aren't aspirational — they're enforced by the module structure itself, and every new
controller/service/provider should be checked against them before it's merged.

- **Single Responsibility** — one module per domain, one service per concern within it. A
  `BooksService` handles book CRUD only; stock changes live in `StockService`, not bolted onto
  `BooksService`. A controller's only job is HTTP request/response shaping (DTO in, DTO out) —
  business logic belongs in the service layer, never in the controller.
- **Open/Closed** — new behavior extends via new implementations, not edits to existing
  branching logic. The `PaymentProvider` interface (§11) is the canonical example: adding a
  third payment gateway means writing a new provider class, not touching `OrderModule`'s
  checkout logic.
- **Liskov Substitution** — anything implementing `PaymentProvider` (or `NotifyChannel`,
  `ObjectStorageProvider`) must be fully swappable for another implementation without the
  caller knowing or caring which one it got.
- **Interface Segregation** — each module's `*.public-api.ts` (§5) exposes only the handful of
  methods other modules actually need, not the whole internal service. Consumers never depend
  on methods they don't use.
- **Dependency Inversion** — modules depend on injected interfaces/DI tokens, not concrete
  classes or SDKs. `OrderModule` depends on the `PaymentProvider` interface, not on the
  Paystack SDK; `integrations/` wraps every third-party SDK behind an interface for exactly
  this reason.
- **DRY, concretely:**
  - `common/` holds every cross-cutting concern exactly once — guards, interceptors, filters,
    pipes, base DTOs — so no module reimplements pagination, error shaping, or auth checks.
  - A generic `PaginatedResponse<T>` + `PaginationDto` in `common/` is reused by every
    list endpoint (books, orders, notifications, admin resources) instead of each module
    inventing its own paging shape.
  - Admin's Schools/Departments/Levels resources are near-identical CRUD — they share a
    generic `CrudService<T>` / `CrudController<T>` base in `common/` (thin generics over
    Prisma delegate + DTOs) rather than three copies of the same create/list/update/delete
    logic. Each resource module only supplies its entity type and DTOs.
  - `PrismaService`/`RedisService` each exist exactly once in `database/` — no module opens its
    own DB connection.
- **Reusability over duplication** — before adding a new service method, check whether an
  existing exported provider already does it (e.g. `NotifyService.notifyUser` should be the
  *only* path that creates a notification — Order and Admin both call it rather than writing
  their own `Notification` inserts).

---

# 3. Tech Stack

| Concern | Choice |
|---|---|
| Framework | NestJS (Nest CLI project, no Nx/Turborepo) |
| Language | TypeScript |
| Postgres ORM | Prisma (connects to Supabase Postgres — the only database) |
| Redis client | ioredis via `@nestjs/cache-manager` / a thin `RedisModule` |
| Auth | Passport (`local` + `jwt` strategies), `@nestjs/jwt` |
| Password hashing | argon2 |
| Validation | `class-validator` + `class-transformer` (DTOs) |
| Config | `@nestjs/config` + Joi/Zod schema validation |
| API docs | `@nestjs/swagger` |
| Rate limiting | `@nestjs/throttler` |
| Payments | Paystack SDK + Flutterwave SDK, behind a common `PaymentProvider` interface |
| Push notifications | `firebase-admin` (FCM) |
| Transactional email | Resend + React Email templates |
| Logging | `nestjs-pino` (structured logs) |

---

# 4. Top-Level Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/                # env schema + ConfigModule setup
│   ├── common/                 # guards, interceptors, filters, pipes, decorators, base DTOs, CrudService<T>, PaginatedResponse<T>
│   ├── database/
│   │   ├── postgres/           # PrismaModule / PrismaService (Supabase connection — the only DB)
│   │   └── redis/               # RedisModule (sessions, refresh tokens, cache, cart)
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/                # profile, address, notification prefs (Postgres)
│   │   ├── catalogue/
│   │   ├── order/
│   │   ├── notification/
│   │   └── admin/
│   └── integrations/
│       ├── payments/             # PaymentProvider interface + Paystack & Flutterwave adapters
│       ├── fcm/
│       ├── email/                # EmailService wrapping Resend + React Email templates
│       ├── object-storage/       # cover/receipt/avatar uploads via Cloudinary (NOT Supabase Storage)
│       └── sis/                  # University SIS client, mockable interface
├── test/                          # e2e tests
├── docker-compose.dev.yml         # local Redis only (Postgres is remote via Supabase)
├── .env.example
├── nest-cli.json
└── package.json
```

Notes:

- `database/postgres` and `database/redis` are the only places that know how to connect to
  their respective stores. Domain modules inject repositories/services from these, never
  construct their own clients.
- `integrations/` holds everything that talks to an external system (payment gateways, FCM,
  object storage, the university SIS). Domain modules depend on these interfaces, not on the
  underlying SDKs directly — makes them mockable in tests.

---

# 5. Module Internal Structure (Pattern)

Every module under `modules/` follows the same shape. Shown here for `catalogue/`:

```
modules/catalogue/
├── catalogue.module.ts
├── controllers/
│   ├── books.controller.ts
│   └── categories.controller.ts
├── services/
│   ├── books.service.ts
│   ├── categories.service.ts
│   └── ratings.service.ts
├── dto/
├── interfaces/
└── catalogue.public-api.ts   # ONLY things other modules may import from this module
```

Since Prisma requires a single `schema.prisma` (there's no per-module schema file the way
Mongoose would have one), each module's Postgres models are still grouped and comment-labeled
by module inside `prisma/schema.prisma` (e.g. a `// --- Catalogue ---` block for `Book`,
`Category`, `Rating`) so ownership stays legible even though the file is shared.

**Boundary rule:** internal services and repositories are not exported from the module.
`catalogue.module.ts`'s `exports` array — and by convention `catalogue.public-api.ts` — expose
only a small, deliberate set of providers (e.g. a `StockService` with `checkAvailability()` /
`reserveStock()`, but not the raw Prisma delegate). Every other module must go through that
public API. This is enforced by code review for now; if it needs hardening later,
`eslint-plugin-boundaries` can turn it into a lint error.

One controller = one resource, one service = one responsibility (§2). If a service file starts
accumulating unrelated methods (e.g. `BooksService` growing checkout-adjacent logic), that's
the signal to extract a new service rather than let the file's responsibility drift.

---

# 6. Module-by-Module Specification

## AuthModule

- **Responsibilities:** registration, login (email or matric number), JWT issuance, refresh
  token rotation, account state machine (`PENDING` → `APPROVED` / `REJECTED`), password reset.
- **Data store:** Postgres (`User` table) via Prisma; refresh tokens + password-reset tokens in
  Redis.
- **Key endpoints:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`,
  `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`,
  `POST /auth/reset-password`.
- **Exports:** `CurrentUserService` / JWT guards & decorators used across every other module.
- **Depends on:** `integrations/email` directly for password-reset delivery — see §12 for why
  this bypasses `NotifyService` rather than going through `NotificationModule`.
- **Feeds screens:** 3, 4, 5, 6A, 6B, A1.

## UsersModule

- **Responsibilities:** profile data, delivery address, notification preferences, avatar
  reference. Kept separate from Auth so Auth stays purely about identity/credentials.
- **Data store:** Postgres (`Profile`, `Address` tables).
- **Key endpoints:** `GET/PATCH /users/me`, `GET/PUT /users/me/address`.
- **Feeds screens:** 7 (Preferences), 16 (Settings).

## CatalogueModule

- **Responsibilities:** Books CRUD, categories, search/filter, ratings, stock levels.
- **Data store:** Postgres (`Book`, `Category`, `Rating` tables) via Prisma. Variable/optional
  book attributes live in a `jsonb` column on `Book` rather than needing a separate document
  store. Search/filter uses Postgres full-text search (`tsvector` + `pg_trgm` for fuzzy
  title/author matching) instead of Mongo's query flexibility — sufficient at this catalogue
  size and keeps everything on one database.
- **Key endpoints:** `GET /books`, `GET /books/:id`, `GET /categories`, admin-guarded
  `POST/PATCH/DELETE /books`.
- **Exports:** `StockService` (`checkAvailability`, `reserveStock`, `releaseStock`),
  `BookLookupService` (for Order to fetch price/title snapshots).
- **Feeds screens:** 8, 9, 10, A7, A9.
- Category CRUD (simple, no search/stock logic) is a good candidate for the same generic
  `CrudService<T>` base (§2) used by Admin's Schools/Departments/Levels — Books stays a
  hand-written service because of search + stock behavior beyond plain CRUD.

## OrderModule

- **Responsibilities:** cart, checkout, payment orchestration, order lifecycle
  (`PROCESSING` → `COMPLETED` / `CANCELLED`).
- **Data store:** cart in Redis (keyed by user id, TTL); confirmed orders persisted to
  Postgres (`Order`, `OrderItem`) via Prisma.
- **Key endpoints:** `GET/POST /cart`, `POST /checkout`, `GET /orders`, `GET /orders/:id`,
  provider webhook endpoints (`POST /payments/paystack/webhook`,
  `POST /payments/flutterwave/webhook`).
- **Depends on:** `CatalogueModule` (stock + pricing), `NotificationModule` (status alerts).
- **Feeds screens:** 12, 13, 14, A2, A8.

## NotificationModule

- **Responsibilities:** in-app notification feed, and fanning delivery out across channels
  (in-app, push via FCM, email via Resend) — see §12 for the channel abstraction.
- **Data store:** Postgres (`Notification`, `NotificationRecipient`) for durable feed +
  unread state; Redis only used incidentally as general cache, not as the source of truth.
- **Key endpoints:** `GET /notifications`, `POST /notifications/mark-all-read`,
  admin-only `POST /notifications/broadcast`.
- **Exports:** `NotifyService` (`notifyUser`, `broadcast`) consumed by Order and Admin.
- **Feeds screens:** 15, A10.

## AdminModule

- **Responsibilities:** Schools/Departments/Levels CRUD (feeds registration & preference
  dropdowns), user approvals, dashboard KPIs.
- **Data store:** Postgres (`School`, `Department`, `Level` tables); KPI aggregation reads
  across Postgres (users/orders) and Catalogue's public API (book counts).
- **Key endpoints:** `GET/POST /admin/schools`, `.../departments`, `.../levels`,
  `GET /admin/approvals`, `POST /admin/approvals/:id/approve|reject`, `GET /admin/dashboard`.
- **Depends on:** `AuthModule` (approvals flip account state), `CatalogueModule`,
  `OrderModule`, `NotificationModule` (broadcast).
- **Feeds screens:** A2–A6.

---

# 7. Module Dependency Graph

To keep the internal dependency graph acyclic and mirror the microservice diagram in
`project.md`, dependencies only flow in one direction:

```
Auth  ──────────────┐   (foundational — depends on nothing else)
  ▲                  │
  │                  ▼
Catalogue        Notification
  ▲                  ▲
  │                  │
  └────── Order ──────┘
             ▲
             │
           Admin
```

- **Auth** — foundational. Everyone may depend on it; it depends on nothing else.
- **Catalogue** — a leaf module. Depends only on `Auth` (to guard admin write endpoints).
- **Notification** — depends only on `Auth` (for device tokens / recipient identity).
- **Order** — depends on `Catalogue` (stock/pricing) and `Notification` (status alerts), plus
  `Auth`.
- **Admin** — depends on `Catalogue`, `Order`, `Notification`, `Auth` — it's the management
  layer over everything else.

Per the confirmed decision, modules talk to each other via **direct service injection**: the
consuming module imports the owning module and injects only its exported public-API provider.
Example — `OrderModule` importing `CatalogueModule` and calling
`stockService.reserveStock(bookId, qty)` during checkout, rather than reaching into
Catalogue's Prisma models directly.

This graph covers `modules/` only. Every module may additionally depend on any `integrations/`
interface (payments, fcm, email, object-storage, sis) — those are leaf dependencies external to
the app's own domain logic, not part of the acyclic graph above. That's how `AuthModule` can use
`integrations/email` for password resets (§12) without violating "Auth depends on nothing else
[among domain modules]."

---

# 8. Data Ownership Mapping

| Store | Owned by | Tables |
|---|---|---|
| **Postgres (Supabase, via Prisma)** | Auth, Users, Catalogue, Order, Notification, Admin | `User`, `Profile`, `Address`, `School`, `Department`, `Level`, `Book`, `Category`, `Rating`, `Order`, `OrderItem`, `Notification`, `NotificationRecipient` |
| **Redis** | Auth, Order | sessions, JWT refresh tokens, general response cache, **cart** (`cart:{userId}`) |
| **Object Storage (Cloudinary)** | Catalogue, Order, Users | book covers, order receipts, user avatars |

Postgres is the single system of record for every module — there is no MongoDB in this
architecture. Each module still only touches *its own* tables (enforced via the public-api
boundary in §5, not via separate databases), so the module boundaries are unaffected by
everything sharing one Postgres instance.

Notes:

- The cart lives entirely in Redis while shopping. On checkout, `OrderModule` reads the Redis
  cart, validates stock/pricing via `CatalogueModule`, then persists the confirmed cart as a
  Postgres `Order` + `OrderItem[]` and clears the Redis key.
- **Object storage is Cloudinary** — Supabase Storage is explicitly excluded since Supabase is
  Postgres-only here. Cloudinary was chosen for its generous free tier and built-in image
  transforms (on-the-fly cover thumbnails, avatar cropping) without extra backend image
  processing. `integrations/object-storage` wraps the Cloudinary SDK behind a small
  `UploadService` (`uploadImage`, `deleteImage`) so callers never touch the SDK directly.

---

# 9. Auth Design

- Passport `local` strategy for email/matric + password login; Passport `jwt` strategy for
  protected routes.
- Access token (short-lived) + refresh token (long-lived) pair issued on login.
- Refresh tokens are stored and rotated in Redis (keyed by user id / token id), so a token can
  be revoked instantly on logout or password change.
- Passwords hashed with **argon2**.
- Account state (`PENDING`, `APPROVED`, `REJECTED`) is a Postgres enum on `User`; login is
  blocked for `PENDING`/`REJECTED` accounts with a distinguishing error code the mobile app
  can branch on (routes to the Pending/Rejected screens per `project.md`'s Approval Flow).

Role and account-state *enforcement* (not just issuance) is covered in full in §10 — this
section is deliberately just the authentication mechanics (proving who you are); §10 is
authorization (deciding what you're allowed to do).

---

# 10. Security & RBAC

RBAC is designed in from the module layer up, not patched on with a handful of `@Roles()`
decorators. Every endpoint is guarded **by default**; being public or admin-only is an
explicit, reviewable choice, never an accident of omission.

## 10.1 Role model

- `User.role` is a Postgres enum: `student` | `admin`. Set once at creation
  (student self-registers as `student`; admin accounts are provisioned directly, never via a
  public signup endpoint).
- No endpoint allows a user to change their own role. Role changes, if ever needed, are a
  direct DB/ops action outside the API surface.

## 10.2 Enforcement layers

1. **Authentication** — global `JwtAuthGuard` registered via `APP_GUARD`, so every route
   requires a valid access token unless explicitly opted out with `@Public()` (login, register,
   refresh, payment webhooks). Opting out is visible at the route definition — there's no
   global allowlist to lose track of.
2. **Account-state gate** — a guard alongside `JwtAuthGuard` rejects any authenticated request
   from a `PENDING`/`REJECTED` user against non-auth endpoints, not just at login. A rejected
   or still-pending account cannot call catalogue/order/notification endpoints just because it
   holds a token.
3. **Role check** — `RolesGuard` + `@Roles('admin')` (or `'student'`) on every controller/route
   that isn't role-neutral. Admin-only mutation endpoints (`POST /books`, `POST /admin/*`,
   `POST /notifications/broadcast`) are denied to `student` tokens at the guard level, before
   any handler code runs.
4. **Resource-level (ownership) authorization** — role checks alone aren't sufficient to stop
   IDOR (Insecure Direct Object Reference). Endpoints like `GET /orders/:id`,
   `GET/PUT /users/me/address` must additionally verify the resource belongs to the requesting
   user (or the requester is `admin`), enforced in the **service layer**, not the controller —
   e.g. `OrdersService.findOne(id, requestingUser)` throws `ForbiddenException` if
   `order.userId !== requestingUser.id && requestingUser.role !== 'admin'`. This check lives
   next to the query it protects so it can't be bypassed by calling the service from a
   different controller later.

## 10.3 Input & data safety

- Global `ValidationPipe` runs with `whitelist: true, forbidNonWhitelisted: true` — unexpected
  fields are rejected outright, closing off mass-assignment (e.g. a student payload can't
  smuggle a `role: "admin"` field into a profile update).
- Prisma parameterizes every Postgres query by construction — no raw string interpolation
  anywhere in the codebase, closing off SQL injection at the ORM layer rather than relying on
  after-the-fact sanitization.
- Payment webhooks verify the provider's signature **before** any payload field is trusted or
  used to mutate an order (§11) — an unsigned or mis-signed webhook is rejected, full stop.

## 10.4 Transport & secrets

- Helmet sets standard secure headers; CORS is locked to the known Expo app origin(s)/schemes,
  not `*`.
- HTTPS terminated at the platform/load-balancer level in every environment above local dev.
- All secrets (`JWT_*`, `PAYSTACK_SECRET_KEY`, `FLUTTERWAVE_SECRET_KEY`, `CLOUDINARY_*`,
  `FCM_*`, `RESEND_API_KEY`, `SIS_API_KEY`) come from validated env config (§14) — never
  hardcoded, never logged.
- `@nestjs/throttler` applies globally, with a tighter limit specifically on `auth/*` and
  webhook endpoints — the two categories most attractive to abuse (credential stuffing,
  forged payment callbacks).

## 10.5 Auditability

Admin actions that change state other users depend on — approvals/rejections, book/price
edits, broadcasts — write a lightweight `AuditLog` row (`actorId`, `action`, `targetId`,
`timestamp`) via a shared interceptor in `common/`, so "who approved/edited/broadcast this and
when" is always answerable without reconstructing it from application logs.

---

# 11. Payments Design

A single `PaymentProvider` interface abstracts Paystack and Flutterwave so `OrderModule` never
talks to either SDK directly:

```ts
interface PaymentProvider {
  initialize(order: Order): Promise<{ redirectUrl: string; reference: string }>;
  verify(reference: string): Promise<PaymentStatus>;
  handleWebhook(payload: unknown, signature: string): Promise<PaymentEvent>;
}
```

- `PaystackProvider` and `FlutterwaveProvider` each implement this interface in
  `integrations/payments/`.
- At checkout, the student's chosen method (`paystack` | `flutterwave`) selects the provider
  via a simple factory/map — no branching logic leaks into `OrderModule`'s business code.
- Each provider has its own signed webhook endpoint. On a verified webhook event, `OrderModule`
  transitions the order (`PROCESSING` → `COMPLETED`/`CANCELLED`) and calls
  `NotifyService.notifyUser(...)` to push an update.

---

# 12. Notifications & Email Channels

`NotificationModule` fans delivery out through a small `NotifyChannel` interface (foreshadowed
in §2's Liskov Substitution bullet), so adding a delivery channel never means touching Order's
or Admin's call sites:

```ts
interface NotifyChannel {
  send(user: User, notification: NotificationPayload): Promise<void>;
}
```

- **`InAppChannel`** — always runs; writes the `Notification`/`NotificationRecipient` rows that
  back the Notifications feed (screen 15). This is the only channel that's a source of truth —
  the others are best-effort delivery on top of it.
- **`PushChannel`** — wraps `integrations/fcm` (`firebase-admin`), as already described for
  order-status and broadcast pushes.
- **`EmailChannel`** — wraps `integrations/email` (Resend), used for order status/receipt
  emails (screen 14's "Receipt") and account approval/rejection decisions. Email is a
  deliberate backup channel for approvals/rejections specifically, since a just-approved or
  just-rejected user may not have a push token registered yet.

`NotifyService.notifyUser(user, notification)` runs `InAppChannel` unconditionally, then fans
out to `PushChannel`/`EmailChannel` based on notification type and the user's notification
preferences (`UsersModule`, screen 16 Settings). Callers never know which channels actually
fired.

## Password reset — a deliberate exception

Password reset (the "Forgot Password" component on screen 3) is a security-critical, one-off
email, not a user-facing notification — it shouldn't create a row in the notification feed, and
it can't wait on a user's notification preferences. So `AuthModule` calls `integrations/email`
**directly**, bypassing `NotifyService`:

- `POST /auth/forgot-password` — issues a short-lived reset token (stored in Redis, same
  pattern as refresh tokens), emails a reset link via `integrations/email`.
- `POST /auth/reset-password` — validates the token, updates the password hash, and revokes
  every existing refresh token for that user (forces re-login on all devices).

## integrations/email

Wraps the Resend SDK behind a minimal `EmailService.send(to, templateId, data)`, with templates
built in React Email — the same "SDK never touches business logic directly" rule already
applied to `integrations/payments` and `integrations/object-storage`.

---

# 13. Cross-Cutting Concerns

- Global `ValidationPipe` (whitelist + transform) on all DTOs.
- Global exception filter producing a consistent error response shape
  (`{ statusCode, message, error, path, timestamp }`).
- Structured request logging via `nestjs-pino`.
- Helmet + CORS configured for the Expo app's origin(s).
- Global `/api/v1` prefix with Nest's built-in URI versioning for future-proofing.
- Swagger/OpenAPI docs served at `/docs`.
- `@nestjs/throttler` applied globally, with a stricter limit on `auth/*` endpoints to slow
  brute-force attempts.

(Security-specific cross-cutting behavior — RBAC guards, input safety, secrets — is covered in
full in §10; this section is the remaining operational concerns.)

---

# 14. Config & Environment

`@nestjs/config` loads and validates environment variables against a Joi/Zod schema at boot,
so the app fails fast on missing config rather than at first use.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler connection string (pgbouncer, port 6543) — runtime queries |
| `DIRECT_URL` | Supabase direct connection string (port 5432) — `prisma migrate` only |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Token lifetimes |
| `PAYSTACK_SECRET_KEY` | Paystack API key |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave API key |
| `FLUTTERWAVE_WEBHOOK_SECRET_HASH` | Flutterwave dashboard-configured webhook secret hash — verifies `verif-hash`, distinct from the API secret key |
| `FCM_PROJECT_ID` / `FCM_CLIENT_EMAIL` / `FCM_PRIVATE_KEY` | Firebase Admin credentials |
| `RESEND_API_KEY` | Resend API key (transactional email) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `SIS_BASE_URL` / `SIS_API_KEY` | University Student Information System integration |

---

# 15. Testing Strategy

- **Unit tests** colocated with source (`*.spec.ts` next to each service/controller),
  mocking the public-API providers of other modules rather than reaching across module
  boundaries.
- **E2E tests** in `test/`, run against dockerized Redis and a dedicated Supabase dev/branch
  Postgres database. `prisma migrate deploy` runs before the e2e suite to ensure schema is
  current.
- Integrations (`payments`, `fcm`, `email`, `sis`) are defined as interfaces so tests can
  substitute fakes without hitting real third-party services.
- **RBAC regression tests are mandatory, not optional**: for every guarded endpoint, the e2e
  suite includes a case asserting a wrong-role token gets `403` and an unauthenticated request
  gets `401` — role/ownership checks are exactly the kind of logic that silently breaks under
  refactors without a test pinning them down.

---

# 16. Local Dev & Deployment Notes

- `docker-compose.dev.yml` spins up local **Redis** only — Postgres stays remote on Supabase
  for all environments, including local dev, to avoid schema drift between a local Postgres
  and the hosted one. There is no MongoDB to run locally.
- The app ships as a single deployable NestJS process (e.g. Railway, Render, Fly.io). No
  separate API Gateway process is needed at this stage — Nest's own routing + global
  guards/middleware serve that role.
- **Future microservice extraction path:** because each module already owns its data and
  exposes only a deliberate public API, splitting one out later (e.g. Catalogue, if it needs
  independent scaling) is mechanically: move the module's folder into its own Nest project,
  stand up its own database connection, and replace in-process calls to its public API with
  HTTP or queue calls implementing the same interface. No business logic rewrite required.
