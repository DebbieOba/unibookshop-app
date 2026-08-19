# CURRICULA — DESIGN_SYSTEM_AND_SCREEN_FLOWS.md

## 1. Product Design Direction

Curricula is a mobile textbook marketplace and academic catalogue for university students, with a mobile administration area.

The design should communicate:

* Academic credibility.
* Ease of discovery.
* Trust in payment and fulfilment.
* Youthfulness without childishness.
* A calm, focused shopping experience.
* Clear separation between student and admin operations.
* Familiar mobile-commerce interaction patterns.

The design must not feel like:

* A generic school-management dashboard.
* A desktop website compressed into a phone.
* A template where every section is a rounded card.
* An app filled with random gradients.
* A visually noisy student portal.
* An AI-generated screen collection with inconsistent spacing and components.

---

# 2. Product Experience Principles

## 2.1 Student Experience

The student app should optimise for:

1. Finding the correct book.
2. Confirming that it matches the student’s department and level.
3. Understanding price and availability.
4. Completing checkout with minimal uncertainty.
5. Tracking the order clearly.
6. Discovering relevant books without being overwhelmed.

---

## 2.2 Admin Experience

The admin app should optimise for:

1. Understanding current operational status.
2. Finding orders and books quickly.
3. Updating statuses safely.
4. Identifying low-stock items.
5. Creating and editing catalogue records.
6. Managing academic structure.
7. Sending relevant notifications.
8. Reviewing audit-sensitive actions.

---

# 3. Design-System Foundations

## 3.1 Brand Personality

Curricula should feel:

* Intelligent.
* Dependable.
* Contemporary.
* Organised.
* Helpful.
* Collegiate.
* Accessible.

It should not feel:

* Corporate and cold.
* Playful like a children’s learning app.
* Excessively luxurious.
* Neon or gaming-oriented.
* Overdecorated.

---

# 4. Colour System

The existing indigo and blue direction can remain, but the system needs complete semantic tokens.

## 4.1 Light Theme

```ts
const lightColors = {
  background: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F4F9',
  surfaceRaised: '#FFFFFF',

  primary: '#5856D6',
  primaryHover: '#4A48C4',
  primaryPressed: '#3E3CAA',
  primarySubtle: '#ECEBFF',

  secondary: '#2389C9',
  secondarySubtle: '#E8F5FC',

  accent: '#D99706',
  accentSubtle: '#FFF7DF',

  textPrimary: '#151A24',
  textSecondary: '#566174',
  textTertiary: '#7A8496',
  textInverse: '#FFFFFF',
  textDisabled: '#A7AFBC',

  border: '#DDE3EC',
  borderStrong: '#C6CEDA',
  divider: '#E8ECF2',

  success: '#16865A',
  successSubtle: '#E7F7F0',

  warning: '#B86E00',
  warningSubtle: '#FFF3D6',

  danger: '#C23B45',
  dangerSubtle: '#FDECEE',

  info: '#246BCE',
  infoSubtle: '#EAF2FE',

  overlay: 'rgba(15, 23, 42, 0.48)',
  shadow: 'rgba(17, 24, 39, 0.10)',
};
```

---

## 4.2 Dark Theme

```ts
const darkColors = {
  background: '#09111F',
  surface: '#111C2E',
  surfaceSubtle: '#162338',
  surfaceRaised: '#192841',

  primary: '#A8A6FF',
  primaryHover: '#B8B6FF',
  primaryPressed: '#8E8BEF',
  primarySubtle: '#292750',

  secondary: '#68BCEC',
  secondarySubtle: '#17364B',

  accent: '#D9B36C',
  accentSubtle: '#3A3020',

  textPrimary: '#F4F7FB',
  textSecondary: '#B4C0D1',
  textTertiary: '#8998AD',
  textInverse: '#101827',
  textDisabled: '#627188',

  border: '#293A53',
  borderStrong: '#3A4D68',
  divider: '#223249',

  success: '#61C99A',
  successSubtle: '#15392B',

  warning: '#F0BA56',
  warningSubtle: '#3D3017',

  danger: '#F0838B',
  dangerSubtle: '#421E24',

  info: '#7DB1FF',
  infoSubtle: '#183258',

  overlay: 'rgba(0, 0, 0, 0.64)',
  shadow: 'rgba(0, 0, 0, 0.30)',
};
```

---

## 4.3 Colour Usage Rules

* Primary is for the principal action and selected navigation.
* Secondary is for links, informational actions and focus.
* Accent gold is used sparingly for ratings, academic highlights and special indicators.
* Red is reserved for destructive actions, critical errors and out-of-stock states.
* Green is reserved for success and completed states.
* Do not use the admin accent across every admin component.
* Do not use gradients as the default button treatment.
* Never place low-contrast pastel text on pastel backgrounds.
* Status badges must combine colour and text.

---

# 5. Typography

Use DM Sans throughout.

## 5.1 Type Scale

| Token         | Size | Line Height | Weight | Usage                               |
| ------------- | ---: | ----------: | -----: | ----------------------------------- |
| Display       |   32 |          38 |    700 | Rare campaign or onboarding heading |
| Heading 1     |   28 |          34 |    700 | Major screen title                  |
| Heading 2     |   24 |          30 |    700 | Key content title                   |
| Heading 3     |   20 |          26 |    600 | Card or detail title                |
| Section Title |   18 |          24 |    600 | Section headings                    |
| Body Large    |   16 |          24 |    400 | Important body content              |
| Body          |   14 |          21 |    400 | Default content                     |
| Body Medium   |   14 |          21 |    500 | Emphasised body text                |
| Label         |   12 |          17 |    500 | Input labels and metadata           |
| Caption       |   11 |          15 |    400 | Supporting metadata                 |
| Price Large   |   22 |          28 |    700 | Primary product price               |
| Price         |   17 |          22 |    700 | Card price                          |

---

## 5.2 Typography Rules

* Use sentence case, not title case everywhere.
* Use no more than three distinct font weights on one screen.
* Avoid huge, bold dashboard titles.
* Avoid all-caps paragraphs.
* Use all caps only for brief labels where justified.
* Maintain readable line height.
* Allow text wrapping.
* Do not force important text into one line.
* Price prominence must not overwhelm the book title.
* Supporting text should remain readable, not faint.

---

# 6. Spacing System

Use an 8-point-oriented system with necessary smaller increments.

```ts
const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};
```

Rules:

* Default screen horizontal padding: 16–20.
* Section spacing: 24–32.
* Card internal padding: 12–16.
* Form-field spacing: 16.
* Related items: 8–12.
* Do not use random values such as 13, 19, 27 and 31 without a clear layout need.
* Respect device safe areas.

---

# 7. Shape and Elevation

## 7.1 Radius

```ts
const radius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 24,
  pill: 999,
};
```

Usage:

* Inputs: 10–12.
* Buttons: 10–12.
* Product cards: 14–16.
* Bottom sheets: 24 top corners.
* Badges and chips: pill.
* Images should follow the container’s intentional radius.

Do not make every container extremely rounded.

---

## 7.2 Elevation

Use borders and surface contrast before heavy shadows.

Elevation levels:

1. Flat: screen sections and lists.
2. Low: cards and sticky headers.
3. Medium: floating cart button, menus and sheets.
4. High: modal and critical overlay.

Dark mode should rely more on surface separation and borders than shadows.

---

# 8. Iconography

Use one primary icon family throughout.

Rules:

* Use outline icons for inactive states.
* Use filled or stronger icons for selected states.
* Standard icon sizes: 18, 20, 24.
* Use 28–32 only for prominent actions or empty states.
* Do not mix inconsistent icon styles.
* Icons must not replace unclear action labels.
* Destructive icons must include text in confirmation contexts.
* Avoid decorative icons in every card.

---

# 9. Motion System

Motion should explain change, not delay use.

Recommended durations:

```text
Fast: 120–160ms
Standard: 180–240ms
Emphasised: 260–320ms
```

Use motion for:

* Screen transitions.
* Bottom-sheet presentation.
* Favourite state.
* Cart quantity change.
* Skeleton-to-content transition.
* Success confirmation.
* Expanding filters.

Avoid:

* Long splash animations.
* Repeated bouncing elements.
* Large parallax effects.
* Animated gradients.
* Delaying interaction for branding.

The current 3.2-second minimum splash hold should be removed. The splash should remain only as long as app bootstrapping genuinely requires, with a short tasteful brand transition.

---

# 10. Core Components

## 10.1 Buttons

Variants:

* Primary.
* Secondary.
* Outline.
* Ghost.
* Destructive.
* Text.
* Icon-only.

Sizes:

* Small: 36–40 high.
* Medium: 44–48 high.
* Large: 52 high.

States:

* Default.
* Pressed.
* Focused.
* Loading.
* Disabled.

Rules:

* One clear primary action per section.
* Loading buttons retain their width.
* Disabled buttons must still be readable.
* Avoid two equally prominent primary buttons beside each other.
* Use explicit labels such as `Place order`, not `Continue`, where the outcome matters.

---

## 10.2 Inputs

Inputs must support:

* Label.
* Value.
* Placeholder.
* Helper text.
* Error.
* Disabled state.
* Leading icon where helpful.
* Trailing action.
* Character count where relevant.

Use outlined or softly filled fields consistently.

Do not use bottom-border-only inputs on some screens and boxed inputs on others.

---

## 10.3 Book Card

The standard book card should contain:

* Cover image.
* Availability badge where important.
* Book title.
* Author.
* Department or level relevance, when useful.
* Rating and rating count.
* Price.
* Favourite action.

The card should not contain:

* Full description.
* Several category badges.
* A large Add to Cart button in a dense two-column grid.
* Redundant “View details” text.

Tapping the card opens Book Details.

An optional quick-add icon may be used only when stock and variants are simple.

---

## 10.4 Order Card

The standard student order card should contain:

* Order reference.
* Order date.
* Item count.
* Cover thumbnails.
* Total.
* Status badge.
* Expected next step.
* `View order` action.

The admin order card should additionally include:

* Customer name.
* Fulfilment method.
* Payment status.
* Current operational status.
* Contextual primary action.

---

## 10.5 Status Badges

Statuses need central mapping.

Examples:

| Status             | User label        |
| ------------------ | ----------------- |
| `PENDING_PAYMENT`  | Awaiting payment  |
| `PAID`             | Payment confirmed |
| `PROCESSING`       | Preparing order   |
| `READY_FOR_PICKUP` | Ready for pickup  |
| `OUT_FOR_DELIVERY` | Out for delivery  |
| `COMPLETED`        | Completed         |
| `CANCELLED`        | Cancelled         |
| `REFUND_PENDING`   | Refund processing |
| `REFUNDED`         | Refunded          |
| `PAYMENT_FAILED`   | Payment failed    |

Do not show raw backend enums.

---

# 11. Student Information Architecture

Recommended tabs:

```text
Home | Store | Orders | Favourites | Account
```

Global header actions:

* Notifications.
* Cart.

The app should not create a separate bottom tab for Notifications or Cart.

---

# 12. Pre-Authentication Screens

## 12.1 Splash Screen

### Purpose

Load fonts, secure session data, theme and essential application configuration.

### Sections

1. Brand mark.
2. Wordmark.
3. Minimal loading indication only when bootstrapping takes longer than expected.

### Rules

* No fixed 3.2-second delay.
* Do not display promotional copy.
* Respect reduced-motion settings.
* Route based on actual app-entry state.
* Do not flash Login before restoring the session.

### Flow

```text
Launch
→ Load local theme
→ Restore secure session
→ Check onboarding-seen flag
→ Resolve profile and role
→ Render correct navigator
```

---

## 12.2 Onboarding

### Purpose

Explain the product to first-time users only.

### Slide 1: Find the right textbooks

* Relevant illustration.
* Heading: `Textbooks for your course`
* Copy: Explain department- and level-based discovery.

### Slide 2: Buy with confidence

* Explain clear pricing, stock and trusted payment.

### Slide 3: Track every order

* Explain notifications and order tracking.

### Persistent controls

* Skip.
* Progress indicator.
* Next.
* `Get started` on final slide.

### Rules

* Maximum three slides.
* No long paragraphs.
* Do not show again after logout.
* Allow skipping.
* Do not request permissions here.
* Do not use illustrations that look generic or unrelated to African university students.

### Flow

```text
First launch
→ Onboarding
→ Get started
→ Login / Create account
```

---

## 12.3 Login

### Screen Sections

1. Compact brand header.
2. Heading: `Welcome back`.
3. Supporting text.
4. Email or matric-number field.
5. Password field.
6. Forgot-password link.
7. Primary Login button.
8. Create-account link.
9. Terms and privacy links.

### Behaviour

* Automatically detect whether input is an email or matric number.
* Use a standard text keyboard initially where both formats are allowed.
* Preserve identifier after a failed login.
* Do not preserve password.
* Show field-level errors.
* Show a calm generic authentication error.
* Support password-manager autofill.

### Do Not Include

* Student/admin role picker.
* Social login unless intentionally supported.
* Large decorative hero occupying half the screen.
* Unnecessary carousel content.

### Flow

```text
Login
→ Existing trusted device
→ Resolve role/profile
→ Student Home or Admin Dashboard

Login
→ New device detected
→ Verify new device
→ Resolve role/profile
→ Correct application
```

---

## 12.4 New Device Verification

### Sections

1. Security icon.
2. Heading: `Verify this device`.
3. Masked destination email.
4. Five-cell or accessible single-field OTP input.
5. Expiration countdown.
6. Verify button.
7. Resend action.
8. Change-account action.

### Rules

* Support paste.
* Support operating-system OTP autofill.
* Do not resend automatically.
* State when a new code invalidates the former one.
* Lock briefly or show support guidance after too many failed attempts.
* Countdown should not be the only indicator of expiration.

### Flow

```text
Credentials accepted
→ New-device challenge created
→ Email code sent
→ Code verified
→ Session created
→ App opened
```

---

## 12.5 Sign Up

### Sections

1. Heading: `Create your account`.
2. Email address.
3. Matric number, when required for student identity.
4. Password.
5. Confirm password.
6. Terms checkbox.
7. Create-account button.
8. Login link.

### Product Correction

The current summary says “Email/matric”. Signup should not ambiguously accept either field as though they are interchangeable.

For a student-focused university application, collect:

* Email address.
* Matric number.

If non-student accounts are introduced later, they require a deliberate invitation or account policy rather than ambiguous identity fields.

### Flow

```text
Sign up
→ Account created
→ Email verification, if enabled
→ Complete profile
→ Student Home
```

---

## 12.6 Complete Profile

Use a focused multi-step flow rather than one long form.

### Step 1: Personal details

* Full name.
* Phone number.
* Avatar, optional.

### Step 2: Academic details

* Institution, future-ready.
* School, derived or searchable.
* Department.
* Academic level.

### Step 3: Interests

* Relevant subject interests.
* Optional discovery preferences.
* Notification consent explanation.

### Footer

* Step indicator.
* Back.
* Continue.
* Complete profile.

### Rules

* School should derive automatically after selecting a department where possible.
* Use searchable bottom sheets.
* Save partial progress where practical.
* Do not require avatar.
* Explain why academic data improves recommendations.

---

## 12.7 Forgot Password

### Sections

* Back action.
* Heading.
* Explanation.
* Email field.
* Send-reset-link button.
* Return-to-login link.

### Success State

Show a dedicated confirmation state:

* Check-your-email message.
* Masked email.
* Resend action with rate-limit feedback.
* Open email app where supported.

Do not reveal whether a submitted email exists.

---

## 12.8 Reset Password

### Sections

* New password.
* Confirm new password.
* Password requirements.
* Reset button.
* Expired-link recovery.

### Success Flow

```text
Password reset
→ Success confirmation
→ Login
```

Do not automatically create a session unless this is a deliberate security decision.

---

# 13. Student Screens

## 13.1 Home

### Purpose

Help students quickly return to useful actions and discover relevant books.

### Sections

1. **Top header**

   * Greeting.
   * Profile avatar.
   * Notification bell.
   * Cart badge.

2. **Search entry**

   * Prominent search field.
   * Opens Store with focus.

3. **Academic context card**

   * Department.
   * Current level.
   * `Update` link.

4. **Continue shopping**

   * Only when recent cart or browsing data exists.

5. **Recommended for your level**

   * Horizontal book list.
   * Based on actual department and level data.

6. **New arrivals**

   * Recently added relevant books.

7. **Popular in your department**

   * Only when supported by order, view or favourite data.

8. **Browse by subject or category**

   * Compact visual categories.

9. **Recent order**

   * Show active order and current status.
   * Hide when no active order exists.

### Design Rules

* Do not display admin-like KPI tiles.
* Do not fill the home screen with promotional banners.
* Every recommendation label must reflect real logic.
* Use horizontal lists sparingly.
* Include `See all` only when there is a meaningful full destination.

---

## 13.2 Store

### Sections

1. Sticky app bar.
2. Search field.
3. Filter and sort controls.
4. Active-filter chips.
5. Result count.
6. Two-column book grid.
7. Pagination or infinite-scroll indicator.
8. Empty or error state.

### Filter Bottom Sheet

* Department.
* Level.
* School.
* Category.
* Availability.
* Price range.
* Rating.
* Clear all.
* Show results.

### Behaviour

* Preserve search when opening details.
* Preserve scroll position when returning.
* Debounce text input.
* Display skeleton cards while initially loading.
* Keep prior results visible during filter refetch where appropriate.
* Support pull-to-refresh.

---

## 13.3 Book Details

### Sections

1. App header:

   * Back.
   * Share.
   * Favourite.

2. Product hero:

   * Book cover.
   * Optional image expansion.

3. Core information:

   * Title.
   * Author.
   * Edition.
   * Rating.
   * Rating count.
   * Price.
   * Availability.

4. Academic relevance:

   * Department.
   * Level.
   * Course codes.
   * Category.

5. Purchase controls:

   * Quantity selector.
   * Add to cart.
   * Buy now where justified.

6. Description.

7. Book information:

   * Publisher.
   * ISBN.
   * Publication year.
   * Format.

8. Ratings and reviews preview.

9. Related books.

10. Sticky purchase footer.

### Rules

* Price and availability must be visible before scrolling far.
* Add-to-cart must be stock-aware.
* Disable purchasing when out of stock.
* Do not repeat the same CTA in several sections.
* Collapse very long descriptions.
* Use real metadata only.

---

## 13.4 Cart

### Sections

1. Header with item count.
2. Cart item list.
3. Stock or price-change notices.
4. Fulfilment estimate.
5. Order summary.
6. Checkout button.
7. Related recommendation, optional and low priority.

### Cart Item

* Cover.
* Title.
* Author or edition.
* Unit price.
* Quantity stepper.
* Remove action.
* Availability warning.

### Behaviour

* Confirm removal only when accidental loss is significant; otherwise provide Undo.
* Quantity cannot exceed available stock.
* Show recalculation state inline.
* Explain changed price before checkout.
* Do not silently remove unavailable products.

---

## 13.5 Checkout

Checkout may be one structured screen for a small order, or a clear step flow if delivery requirements expand.

### Section 1: Contact

* Name.
* Phone.
* Email display.

### Section 2: Fulfilment Method

* Delivery.
* Pickup, if supported.

Each option must explain:

* Estimated time.
* Fee.
* Required next action.

### Section 3: Address

* Selected saved address.
* Change.
* Add address.

### Section 4: Items

* Compact item list.
* Quantity.
* Subtotal.

### Section 5: Payment

* Paystack.
* Flutterwave.
* Brief trusted-payment explanation.

### Section 6: Summary

* Subtotal.
* Delivery.
* Discount, only if real.
* Tax, if applicable.
* Total.

### Final Action

`Pay ₦XX,XXX`

### Rules

* Final amount must come from backend.
* Avoid hidden costs.
* Require final confirmation for address and total.
* Lock repeat submission.
* Allow recovery from interrupted payment.
* Do not show success before server verification.

---

## 13.6 Payment Processing

### States

1. Initialising payment.
2. Payment interface opened.
3. Verifying payment.
4. Payment confirmed.
5. Payment failed.
6. Payment cancelled.
7. Verification delayed.

### Verification-Delayed Copy

`We have received your payment response and are confirming it. This may take a moment. Do not pay again.`

Provide:

* Refresh status.
* View orders.
* Contact support where needed.

---

## 13.7 Order Confirmation

### Sections

1. Success icon and heading.
2. Order reference.
3. Total paid.
4. Fulfilment method.
5. Delivery or pickup estimate.
6. Item summary.
7. What happens next.
8. Track-order button.
9. Continue-shopping button.
10. Receipt action where supported.

Do not use only a toast for successful order placement.

---

## 13.8 Orders List

### Tabs or filters

* Active.
* Completed.
* Cancelled.

Avoid exposing too many technical statuses as top-level tabs.

### Sections

* Search by order reference, optional.
* Filter button.
* Order cards.
* Empty state.
* Pagination.

---

## 13.9 Order Details

### Sections

1. Order status header.
2. Visual status timeline.
3. Next-step explanation.
4. Order reference and date.
5. Item list.
6. Delivery or pickup details.
7. Payment summary.
8. Customer contact details.
9. Help and support.
10. Cancellation or recovery action where permitted.

### Status Timeline

Example:

```text
Order placed
Payment confirmed
Preparing order
Ready
Delivered
```

Show cancelled or refund branches clearly.

---

## 13.10 Favourites

### Sections

* Header.
* Optional sort.
* Saved-book grid.
* Empty state.
* Remove-from-favourites interaction.

Allow direct navigation to details.

Do not automatically remove out-of-stock books; show their current status.

---

## 13.11 Notifications

### Sections

1. Header.

2. Mark-all-as-read action.

3. Filters:

   * All.
   * Orders.
   * Updates.

4. Grouped list:

   * Today.
   * Earlier.

5. Empty state.

### Notification Row

* Type icon.
* Title.
* Short body.
* Timestamp.
* Unread indicator.

Tapping a notification should deep-link to the relevant screen.

---

## 13.12 Account

### Sections

1. Profile summary.
2. Academic details.
3. Addresses.
4. Notification preferences.
5. Appearance.
6. Security.
7. Help and support.
8. Legal.
9. Logout.

Do not place every setting in one unstructured list.

---

## 13.13 Edit Profile

### Sections

* Avatar.
* Full name.
* Phone.
* Academic details.
* Interests.
* Save action.

Changes to department or level should explain how recommendations will change.

---

## 13.14 Addresses

### List Screen

* Default address.
* Other addresses.
* Add address.
* Edit.
* Delete.
* Set as default.

### Address Form

* Address label.
* Recipient name.
* Phone.
* Street.
* Additional details.
* City.
* State.
* Postal code where applicable.
* Delivery instructions.
* Default checkbox.

Use country-appropriate address fields.

---

## 13.15 Notification Preferences

Group by channel:

### Push

* Order updates.
* New arrivals.
* Promotions or broadcasts.

### Email

* Order receipts.
* Security alerts.
* Product updates.

Critical security notices should not be fully disableable where legally and operationally appropriate.

---

## 13.16 Security

Sections:

* Change password.
* Active devices.
* Sign out other devices.
* Security alerts.
* Delete account, subject to policy.

### Active Device Card

* Device name.
* Platform.
* Approximate location.
* Last active.
* Current-device badge.
* Revoke action.

Do not display duplicated sessions for the same active installation.

---

# 14. Admin Information Architecture

Recommended tabs:

```text
Dashboard | Orders | Books | Inventory | More
```

`More` contains:

* Schools.
* Departments.
* Levels.
* Users and restrictions.
* Broadcast notifications.
* Admin profile.
* Security.
* Audit access, if permitted.
* Logout.

---

# 15. Admin Screens

## 15.1 Admin Dashboard

### Sections

1. Header:

   * Admin greeting.
   * Notification icon.
   * Date context.

2. Primary KPI cards:

   * Orders today.
   * Revenue today.
   * Orders requiring action.
   * Low-stock books.

3. Order-status overview:

   * Compact chart or segmented summary.

4. Action required:

   * Unprocessed paid orders.
   * Failed-payment investigations.
   * Low stock.
   * Out-of-stock books.

5. Recent orders.

6. Inventory health.

7. Quick actions:

   * Add book.
   * Adjust inventory.
   * Send broadcast.

### Rules

* Maximum four primary KPI cards at once.
* Prioritise actionable information.
* Label the time period for every metric.
* Do not use unsupported percentage changes.
* Do not use fake chart data.
* Charts must remain readable on narrow screens.

---

## 15.2 Admin Orders

### Sections

1. Search.
2. Status filters.
3. Date filter.
4. Payment filter.
5. Fulfilment filter.
6. Result count.
7. Order cards.
8. Pagination.

### Useful Filter Groups

* Needs action.
* Processing.
* Ready.
* Completed.
* Cancelled/refunded.

Avoid raw technical tabs such as every backend enum.

---

## 15.3 Admin Order Details

### Sections

1. Status and priority header.
2. Allowed next action.
3. Order timeline.
4. Customer information.
5. Contact action.
6. Fulfilment details.
7. Item list.
8. Payment information.
9. Internal activity history.
10. Notes.
11. Destructive or exception actions.

### Status Update Interaction

Use a bottom sheet showing only legal next statuses.

Require a reason for:

* Cancellation.
* Refund.
* Reversal.
* Exceptional inventory change.

Do not present an unrestricted status dropdown.

---

## 15.4 Books List

### Sections

1. Search.

2. Add-book button.

3. Status filters:

   * Published.
   * Draft.
   * Archived.
   * Out of stock.

4. Department and level filters.

5. Sort.

6. Book management cards.

7. Pagination.

### Book Management Card

* Cover.
* Title.
* Author.
* Price.
* Available stock.
* Publication status.
* Quick overflow actions.

---

## 15.5 Add/Edit Book

Use a full-screen form divided into logical sections.

### Section 1: Basic Information

* Title.
* Authors.
* Description.
* ISBN.
* Publisher.
* Edition.
* Publication year.

### Section 2: Academic Classification

* School.
* Department.
* Level.
* Course code.
* Category.

Support multiple departments or levels only if the data model supports them.

### Section 3: Commerce

* Price.
* Currency.
* Initial stock or inventory link.
* Reorder threshold.
* Publication status.

### Section 4: Media

* Cover upload.
* Crop or preview.
* Replace.
* Remove.

### Section 5: Review

* Preview.
* Validation summary.
* Save draft.
* Publish.

### Rules

* Autosave draft only if safely implemented.
* Warn before leaving with unsaved changes.
* Compress cover before upload.
* Preserve draft when upload fails.
* Do not combine stock adjustment history into the book-edit form.

---

## 15.6 Inventory Dashboard

### Sections

1. Inventory KPIs:

   * Total active titles.
   * Low stock.
   * Out of stock.
   * Reserved units.

2. Inventory health chart.

3. Needs restocking.

4. Recent inventory movements.

5. Search and filter.

6. Books inventory list.

### Inventory Card

* Book.
* Available quantity.
* Reserved quantity.
* Reorder threshold.
* Status.
* Adjust action.

---

## 15.7 Inventory Adjustment

### Sections

* Current quantity.
* Reserved quantity.
* Adjustment type.
* Quantity.
* Reason.
* Internal note.
* Resulting quantity preview.
* Confirm action.

Adjustment types:

* Restock.
* Damage.
* Correction.
* Return.
* Manual reduction.

Require a reason.

Display a confirmation summary before applying significant reductions.

---

## 15.8 Schools

### List Sections

* Search.
* School count.
* School list.
* Departments count per school.
* Add school.
* Edit/archive actions.

Avoid destructive deletion when departments or books depend on the school.

---

## 15.9 Departments

### Sections

* Search.
* School filter.
* Department list.
* Student/book counts where available.
* Add department.
* Edit/archive.

The school relationship must be clear.

---

## 15.10 Levels

Academic levels are usually a small controlled list.

### Sections

* Levels list.
* Sort order.
* Active/inactive state.
* Add level only if the system genuinely needs custom levels.

Do not overbuild CRUD for static values without a real need.

---

## 15.11 Users and Account Restrictions

The legacy `Approvals` screen should be renamed because accounts are auto-approved.

Recommended name:

```text
Users & Access
```

### Sections

1. User search.

2. Filters:

   * Active.
   * Restricted.
   * Banned.
   * Incomplete profile.

3. User cards.

4. User details.

5. Restriction history.

6. Restrict or restore action.

### Rules

* Do not imply that every account needs approval.
* Require a reason for restriction or ban.
* Record the acting admin.
* Show consequences before confirmation.
* Do not permanently delete users casually.

---

## 15.12 Broadcast Notifications

### Sections

1. Audience.
2. Channel.
3. Title.
4. Message.
5. Optional destination screen.
6. Schedule or send now.
7. Preview.
8. Estimated recipient count.
9. Confirmation.
10. Delivery results.

### Audience Options

* All students.
* School.
* Department.
* Academic level.
* Specific user segment.
* Admins, where required.

### Rules

* Prevent accidental sends to all users.
* Require confirmation for broad audiences.
* Show character guidance.
* Deep links must be validated.
* Display sent, delivered and failed counts where available.

---

## 15.13 Admin More

Group into sections:

### Catalogue Structure

* Schools.
* Departments.
* Levels.

### Users and Communication

* Users & Access.
* Broadcasts.

### Administration

* Profile.
* Security.
* Active devices.
* Audit records, where authorised.

### Application

* Appearance.
* Help.
* Legal.
* Logout.

---

# 16. Complete User Flows

## 16.1 New Student Registration

```text
Launch
→ Onboarding
→ Create account
→ Enter email, matric number and password
→ Verify email, if enabled
→ Complete personal profile
→ Select department and level
→ Select optional interests
→ Home
```

Failure states:

* Email already used.
* Matric number already used.
* Invalid matric format.
* Verification expired.
* Department data unavailable.
* Profile submission interrupted.

---

## 16.2 Returning Student Login

```text
Launch
→ Restore session
→ Valid session
→ Student Home
```

Or:

```text
Launch
→ Login
→ Credentials accepted
→ Trusted device
→ Student Home
```

Or:

```text
Launch
→ Login
→ Credentials accepted
→ New device
→ OTP verification
→ Student Home
```

---

## 16.3 Browse and Purchase

```text
Home
→ Search or recommendation
→ Store results
→ Book details
→ Add to cart
→ Cart
→ Checkout
→ Payment provider
→ Backend verification
→ Order confirmation
→ Order tracking
```

---

## 16.4 Interrupted Payment

```text
Checkout
→ Payment opened
→ User closes payment
→ Return to app
→ Check payment/order status
→ Payment not confirmed
→ Show retry or choose another method
```

Do not create several duplicate orders for each retry unless the backend intentionally models separate payment attempts.

---

## 16.5 Notification Deep Link

```text
Push notification tapped
→ App opens
→ Session restored
→ Notification marked read
→ Relevant order/book/screen opened
```

If logged out:

```text
Notification tapped
→ Login
→ Successful authentication
→ Original destination restored
```

---

## 16.6 Admin Adds Book

```text
Books
→ Add book
→ Basic details
→ Academic classification
→ Price and inventory
→ Cover upload
→ Preview
→ Save draft or publish
→ Books list
```

---

## 16.7 Admin Processes Order

```text
Dashboard action required
→ Order details
→ Review payment and fulfilment
→ Select allowed next status
→ Confirm action
→ Audit record created
→ Customer notified
→ Updated order state
```

---

## 16.8 Inventory Restock

```text
Inventory
→ Low-stock item
→ Adjust inventory
→ Select Restock
→ Enter quantity and reason
→ Review resulting quantity
→ Confirm
→ Inventory movement recorded
→ Updated inventory displayed
```

---

## 16.9 Logout

```text
Account
→ Logout
→ Confirm
→ Revoke current session
→ Clear sensitive local data
→ Reset navigation
→ Login
```

The app must not route to onboarding after logout.

---

# 17. Responsive and Device Rules

Test layouts on:

* Small Android phones.
* Common mid-range Android phones.
* Large Android phones.
* Standard iPhones.
* Large iPhones.
* Devices with display cutouts.
* Devices using increased font size.
* Light and dark mode.

Rules:

* Avoid fixed heights for text containers.
* Respect bottom safe areas.
* Avoid placing critical actions behind the keyboard.
* Use sticky footers carefully.
* Do not assume every device has the same status-bar height.
* Admin charts and cards must adapt without horizontal overflow.

---

# 18. Content Design

Use plain, direct language.

Prefer:

* `Add to cart`
* `Place order`
* `Payment confirmed`
* `Preparing your order`
* `No books found`
* `Try another title, author or course code`

Avoid:

* `Proceed`
* `Execute transaction`
* `Operation successful`
* `Invalid credentials supplied`
* `Data not found`
* `Kindly input the required details`
* `Oops! Something went wrong` everywhere

Messages should explain the actual situation and next action.

---

# 19. Design Review Checklist

Before approving a screen, confirm:

* The user goal is clear.
* The primary action is visible.
* Information hierarchy is obvious.
* The layout follows the spacing system.
* Typography tokens are used.
* Semantic colour tokens are used.
* Dark mode works.
* Loading is designed.
* Empty state is designed.
* Error state is designed.
* Offline behaviour is considered.
* Long text is supported.
* Keyboard behaviour is correct.
* Screen-reader labels exist.
* Touch targets are large enough.
* Navigation entry and exit are understood.
* The screen does not duplicate another function.
* The mobile design is not a compressed desktop layout.
* The screen uses real data and realistic states.

---

# 20. Final Design Instruction

Every Curricula screen must be designed as part of a complete product journey.

A modern application is not defined by gradients, oversized headings, floating cards or excessive animation. It is defined by clear hierarchy, predictable interaction, useful feedback, accessibility, performance, trustworthy commerce flows and consistent handling of real-world states.

The final application should feel like one product designed by one experienced team—not several unrelated screens generated from separate prompts.