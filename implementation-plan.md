# CURRICULA — Implementation Completion Plan

_Written 2026-07-17. Updated same day after a direction change — see §0._

---

## 0. How to read this plan

This started as an audit-driven punch-list (original version below in §1–§2 is mostly still accurate). One finding was that several screens showed mocked/hardcoded data not backed by any API — a "Bookstore Savings" card, a "Required Syllabus" tracker, a "Used Textbook Exchange" section with a dead button, decorative promo banners, a fake Cart promo code, and a fabricated "retail price" markup on Book Details.

**Decision:** rather than removing that UI, build real backend support for it and wire the existing screens to it — no visual/layout changes, only real data and working handlers. That work is now largely done (§3). The rest of the original punch-list (§4) is still open.

---

## 1. State at a glance (original audit)

Both apps were already ~90–95% built against their own spec before any of this work started: all 6 backend modules real and wired, all integrations real (not mocked), full mobile screen coverage with real data via TanStack Query, real auth/theming/push/payments. See git history for the full original audit; it's not repeated here.

---

## 2. What was built in this pass

### Backend

- **`Book`** gained `compareAtPrice`, `courseCode`, `courseTitle`, `isPreOrder`, `releaseDate` (`prisma/schema.prisma`). `compareAtPrice` is validated server-side to always be `> price` (`books.service.ts`'s `assertValidCompareAtPrice`) — so "on sale" is just `compareAtPrice IS NOT NULL`, no fake numbers possible.
- **`OrderItem.compareAtPriceSnapshot`** — snapshotted at checkout so historical "savings" stay accurate even if a book's sale price later changes.
- **`Order`** gained `subtotalAmount`, `discountAmount`, `promoCodeId` — checkout now separates subtotal/discount/total instead of collapsing straight to a single charged amount.
- **New `PromotionsModule`** (`modules/promotions/`) — `PromoCode` model, admin CRUD at `/admin/promo-codes`, and `PromoCodesService.validate()`/`.redeem()` consumed by `OrderModule`. Cart's promo code (`POST/DELETE /cart/promo`) and checkout now both go through real server-side validation — no client-side "FUTA10" string check anymore.
- **New `ExchangeModule`** (`modules/exchange/`) — `Listing` model + `/exchange/listings` CRUD. Built as a **contact-only listing board** (seller lists a book, buyer sees seller's name/phone and arranges the exchange themselves) — no cart/checkout/payment integration, per the scope decision made before building it (a full marketplace with split payments was explicitly ruled out as too large for this pass).
- **`OrderModule`** gained `GET /orders/savings-summary` and `GET /orders/syllabus-progress` (new `InsightsService`), backing the Home "Bookstore Savings" and "Required Syllabus" cards with real completed-order data and real course-tagged books for the student's department/level.
- **Bug fix (unrelated to the above, found during the original audit):** `checkout.service.ts`'s `handlePaymentEvent()` now calls `stockService.releaseStock()` when a payment is cancelled/fails — previously reserved stock was never given back.
- **Seed script** (`prisma/seed.ts`) backfills `compareAtPrice`/`courseCode`/`courseTitle`/`isPreOrder` deterministically across the existing 1,140-book catalogue (idempotent — safe to re-run), and seeds a real `FUTA10` promo code matching the Cart screen's existing placeholder copy.

**⚠️ Not yet applied to the database.** This machine's network can't reach the configured Supabase host (`db.axlnrgitscvegazqggdb.supabase.co`, ports 5432/6543 both time out — looks like a local network/firewall restriction, not a credentials problem). So:
- The migration SQL was generated offline (via `prisma migrate diff`, schema-to-schema, no DB connection needed) and written to `prisma/migrations/20260717142409_add_savings_syllabus_promo_exchange/migration.sql`, but **never run**.
- `npx prisma generate` regenerated the TypeScript types successfully (confirmed — `tsc --noEmit` passes clean on the new fields/models), but the native query-engine binary failed to update (`EPERM` — a running node process, likely a dev server, has the old `.dll.node` file locked).

**Before this works end-to-end, someone with DB connectivity needs to:**
1. Stop whatever's running the backend dev server (releases the file lock).
2. `cd backend && npx prisma generate` (should complete fully this time).
3. `npx prisma migrate deploy` (applies the migration to Supabase).
4. `npx prisma db seed` (backfills the new fields onto the existing catalogue + seeds `FUTA10`).

Everything was typechecked (`tsc --noEmit`, both apps, clean) and the backend unit test suite passes (19/19, including new coverage for the promo-code and stock-release paths in `checkout.service.spec.ts`), but none of it has been exercised against a live database or the mobile app in a simulator — that verification still needs to happen once step 1–4 above are done.

### Frontend

- **Book Details** — dropped the two fake "Syllabus Preview"/"Contents Page" slideshow images (unrelated stock art shown on every book regardless of content); the slideshow now shows only the real cover. The strikethrough retail price / "SAVE ₦X" badge now render from `book.compareAtPrice` and only appear when a book is genuinely on sale.
- **Home** — "My Bookstore Savings" and "My Required Syllabus" now render `useSavingsSummary()`/`useSyllabusProgress()` data and hide themselves when there's nothing real to show (no completed orders / no course-tagged books for the student's dept+level) rather than ever showing a placeholder number. "Used Textbook Exchange"'s "Start Listing" button now navigates to a real Create Listing screen; the card also navigates to the listing browse screen. The 3 promo banners are now tappable (previously decorative-only) and the "Shop Sale" banner's copy is computed from real on-sale-book data instead of a fixed "40% OFF".
- **Store** — the 4 promo banners are now tappable: Exchange → browse listings, Pre-Order → filters the grid to `isPreOrder` books, Sell → create a listing, Library Sync → Edit Profile (closest real destination; no digital-lending feature exists to build against).
- **Cart** — promo code entry now calls `POST /cart/promo`/`DELETE /cart/promo` for real server-side validation; shows the applied code with a Remove action instead of a client-only 10%-off toggle.
- **New screens**: `ExchangeListingsScreen` (browse/search), `CreateListingScreen` (title/author/course/condition/price/description + up to 3 photos via `expo-image-picker`), `ListingDetailsScreen` (seller card, tel: contact link, owner-only mark-as-sold/delete) — registered in `StudentStack.tsx`.
- **Admin Books form** — gained inputs for `compareAtPrice`, `courseCode`, `courseTitle`, and an `isPreOrder` toggle, so the new fields are actually settable from the app rather than only via seed data.

---

## 3. Still open from the original audit (not touched in this pass)

These were flagged in the original audit and are independent of the work in §2 — still worth doing, just not done yet:

1. **`AuditLogInterceptor` still unwired.** `@AuditAction()` + `AuditLogInterceptor` exist and are now applied on the new `/admin/promo-codes` endpoints (this pass), but the original admin surfaces it should also cover — approvals, book CRUD, org-structure CRUD, broadcast — still aren't audited.
2. **`happy-path.e2e-spec.ts` still asserts the old `PENDING`-registration flow**, which no longer matches `auth.service.ts`'s auto-approve behavior. Needs updating (see original audit for detail).
3. **Unit test coverage is still thin outside what this pass touched** — `users`, `notification`, and most of `catalogue`/`admin` have no `*.spec.ts`.
4. **`subscribeToNotificationTaps()` call site in `App.tsx`** and **`RoleGate` usage** were both flagged as unverified in the original audit — still unverified.
5. **RBAC/navigation tests** (`frontend-architecture.md` §14 calls these mandatory) — still missing.

---

## 4b. Actual root cause of "backend not connected" (2026-07-17, later still)

After the §4a fix, live device logs showed the app *was* reaching the backend (auth/login/refresh/`/categories` all succeeded) but every `Book`/`Order`/`Cart`/`Favourite` endpoint returned 500. This confirms the real cause was the still-pending migration flagged in §2: the running server's Prisma Client already knew about the new columns (`compareAtPrice`, `courseCode`, `discountAmount`, etc.) but the actual Supabase tables didn't have them yet, so every query touching those models failed at the database.

Resolved: `npx prisma migrate deploy` connected and applied cleanly this time (the earlier "DB unreachable" read in §2 was a false negative from Git Bash's `/dev/tcp` test specifically, not a real block — `curl`/Node/Prisma's actual networking all worked fine). Confirmed via direct requests against the live server: `/books`, `/cart`, `/orders`, `/favourites`, `/orders/savings-summary`, `/orders/syllabus-progress` all now return 200. The running dev server picked up the new columns immediately with no restart needed (the query-engine binary lock from §2 turned out not to matter — it's schema-agnostic within the same Prisma version, only the TS/JS client layer needed the regenerate, which had already succeeded). `npx prisma db seed` is backfilling `compareAtPrice`/`courseCode`/`courseTitle`/`isPreOrder` across the existing 1,140-book catalogue and seeding `FUTA10` — confirmed real course data already flowing through `/orders/syllabus-progress` mid-run.

**Practical takeaway for next time this happens:** hit `GET /health/ready` first — it separates "can't reach the server at all" from "reached it, but a dependency/schema problem is making requests fail," which is exactly the distinction that mattered here.

## 4a. Mobile-to-backend connectivity fix (2026-07-17, later same day)

Reported symptom: "the backend is not connected to the app." Investigation found the backend itself was fine — running, DB-connected, reachable on the LAN IP already configured in `app.json`'s `extra.apiBaseUrl` (`http://192.168.1.43:3000/api/v1`, confirmed current for this machine). The actual cause: **Android 9+ and iOS both block plaintext `http://` requests to non-localhost hosts by default**, and `app.json` had no exception configured — so a real device or emulator running the custom dev client would silently fail every request to that LAN IP, while everything from a browser or `curl` on the dev machine itself worked fine (masking the problem during backend-only testing).

Fixed via `expo-build-properties` (installed): `android.usesCleartextTraffic: true` in the plugin config, plus `ios.infoPlist.NSAppTransportSecurity.NSAllowsArbitraryLoads: true`. **This is a native config change — it requires rebuilding the custom dev client, not just reloading Metro/JS.** Run `npx expo run:android` / `npx expo run:ios` locally, or `eas build --profile development` for each platform you test on, then reinstall that build on the device/emulator.

Also added, while investigating this class of failure:
- **`backend/src/app.controller.ts`**: `GET /health/ready` now actually pings Postgres and Redis (3s timeout each) and returns 503 if either is down — `GET /health` alone only proves the process is alive, not that it can serve real requests. Use `/health/ready` first the next time something looks "not connected."
- **`backend`**: a global 30s request-timeout interceptor (60s for webhook/upload routes), and the global exception filter now logs the stack trace for any 5xx/unexpected error server-side — previously an unhandled exception was silently collapsed to a generic "Internal server error" with no trace anywhere.
- **`mobile/src/api/client.ts`**: fixed a real bug found in the process — a network blip *during token refresh* was being treated identically to "refresh token is invalid," logging the user out. Now only a genuine 401/expired-token response from the server clears the session; a network-level failure during refresh just fails that one attempt. Also added: automatic retry (2 attempts, short backoff) for GET requests that fail with a network error or 502/503/504, and `lib/apiError.ts`'s `getErrorMessage()` for extracting a real, useful message from any API error instead of a generic string.

## 4. Known follow-ups from this pass specifically

- Run the 4 deploy steps in §2 (migrate + regenerate + seed) once DB connectivity is available, then smoke-test the new screens/cards in the running app — none of this has been run against a live backend yet.
- Consider whether `Listing` images should be moderated/reportable before this ships to real users — the contact-only design has no abuse-handling beyond owner/admin delete.
- The "FUTA Library Sync" Store banner still advertises a digital-lending feature that doesn't exist and isn't being built — its button now goes to Edit Profile as the closest real destination, but the copy itself is arguably still misleading. Flagging rather than changing it, since the instruction for this pass was not to alter any existing design/copy.
