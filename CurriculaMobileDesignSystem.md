CURRICULA — COMPLETE MOBILE SCREEN DESIGN
MASTER PROMPT
File Name

  CURRICULA-COMPLETE-SCREEN-DESIGN-SYSTEM.md


# 1. YOUR ROLE

You are working as a:

 - Senior Mobile Product Designer.
 - Senior UI/UX Designer.
 - Senior React Native Engineer.
 - Senior Design Systems Engineer.
 - Senior Product Manager.
 - Senior Accessibility Specialist.
 - Senior E-commerce Experience Designer.

Your responsibility is to redesign and implement the complete Curricula mobile application so that it looks,
feels and behaves like a carefully designed modern production application.

Do not produce an AI-looking application.

Do not create generic dashboard screens.

Do not create disconnected screens with random cards.

Do not make every section a rounded rectangle.

Do not use random gradients, oversized headings or excessive shadows to create false visual quality.

The final result must feel like a product created by an experienced mobile design and engineering team.


# 2. PRODUCT SUMMARY

Curricula is a mobile textbook marketplace for university students.

Students can:

 - Create accounts.
 - Complete their academic profiles.
 - Browse textbooks.
 - Search by title, author and course.
 - Filter books by school, department and level.
 - View book details.
 - Add books to favourites.
 - Add books to cart.
 - Checkout using Paystack or Flutterwave.
 - Track orders.
 - Receive notifications.
 - Manage their profile, addresses and security settings.

Administrators can:

 - View operational metrics.
 - Manage books.
 - Manage inventory.
 - Manage orders.
 - Manage schools.
 - Manage departments.
 - Manage academic levels.
 - Manage users and restrictions.
 - Send broadcast notifications.
 - Monitor stock levels.
 - View application settings.

The application uses one React Native codebase for both students and administrators.

The user’s role is determined automatically after authentication.

Do not add a manual role-selection screen.


# 3. PRIMARY DESIGN OBJECTIVE

Design Curricula so that it can visually compete with modern:

 - E-commerce applications.
 - Book marketplace applications.
 - University service applications.
 - Retail mobile applications.
 - Inventory management applications.
 - Order management applications.

The student application should feel like a polished mobile commerce application.

The admin application should feel like a mobile operations application.

The admin experience must not look like a desktop admin table squeezed into a mobile screen.

4. NON-NEGOTIABLE DESIGN RULES

## 4.1 Do Not Vibe-Code the Interface

Do not:

 - Generate screens independently.
 - Invent a new card style for every page.
 - Use different spacing on different screens.
 - Change button styles randomly.
 - Use different input styles across forms.
 - Use random icon libraries.
 - Add a banner merely because the screen looks empty.
 - Add carousels where users need a simple list.
 - Add charts without useful data.
 - Add sections that have no real user value.
 - use fake promotions.
 - Use Lorem Ipsum.
 - Use fake percentage growth.
 - Use fake student statistics.
 - Use decorative UI that reduces usability.
 - Put every content group inside a floating card.
 - Use huge hero sections inside operational screens.
 - Use desktop tables.
 - Use excessive horizontal scrolling.
 - Hide important actions behind unnecessary menus.
 - Use a large splash animation that delays application startup.

Every section must have a product reason.


## 4.2 Screen Completion Rule

Every screen must include all relevant states:

 - Initial loading.
 - Background refreshing.
 - Populated success state.

 - Empty state.
 - Error state.
 - Offline state.
 - Disabled state.
 - Submitting state.
 - Permission-denied state.
 - Restricted-account state.
 - Partial-data state.
 - Search-no-results state.
 - Pagination state.
 - Destructive-action confirmation where applicable.

A screen is not complete if only the happy path is designed.


## 4.3 Consistency Rule

Every screen must use the same:

 - Typography system.
 - Spacing system.
 - Colour tokens.
 - Input components.
 - Button components.
 - Card hierarchy.
 - Header patterns.
 - Search patterns.
 - Modal patterns.
 - Bottom-sheet patterns.
 - Status badges.
 - Skeleton loaders.
 - Error components.
 - Empty-state components.
 - Image ratios.
 - Icon family.
 - Animation timing.


# 5. VISUAL DIRECTION

The visual design should feel:

 - Modern.
 - Clean.
 - Academic.
 - Trustworthy.

 - Youthful.
 - Calm.
 - Premium without being luxurious.
 - Professional without being corporate.
 - Easy to scan.
 - Highly usable.

Avoid:

 - Loud neon colours.
 - Childish school illustrations.
 - Excessive gradients.
 - Glassmorphism on every component.
 - Heavy drop shadows.
 - Oversized bold text.
 - Overcrowded home screens.
 - Too many badges.
 - Excessive decorative lines.
 - Too many competing colours.


# 6. DESIGN TOKENS


## 6.1 Colours

Use semantic tokens rather than hardcoded colours.

Light Theme

```javascript
  const lightTheme = {
    background: '#F6F8FC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F0F3F8',
    surfaceRaised: '#FFFFFF',

    primary: '#5856D6',
    primaryPressed: '#4542BC',
    primarySoft: '#ECEBFF',

    secondary: '#268BC5',
    secondarySoft: '#E7F5FC',

    accent: '#D99A14',
    accentSoft: '#FFF6DD',

      textPrimary: '#151A24',
      textSecondary: '#596579',
      textTertiary: '#7E8899',
      textDisabled: '#A8B0BD',
      textInverse: '#FFFFFF',

      border: '#DCE2EA',
      borderStrong: '#C8D0DB',
      divider: '#E9EDF2',

      success: '#18865B',
      successSoft: '#E7F7F0',

      warning: '#B56F00',
      warningSoft: '#FFF3D8',

      danger: '#C33D48',
      dangerSoft: '#FDEBED',

      info: '#276DCE',
      infoSoft: '#EAF2FD',

      overlay: 'rgba(15, 23, 42, 0.52)',
 };
```

Dark Theme

```javascript
 const darkTheme = {
   background: '#09111F',
   surface: '#111C2E',
   surfaceSubtle: '#162338',
   surfaceRaised: '#192840',

      primary: '#AAA8FF',
      primaryPressed: '#8F8CED',
      primarySoft: '#2B2953',

      secondary: '#6BBCED',
      secondarySoft: '#18394D',

      accent: '#D9B36C',
      accentSoft: '#3A3020',

      textPrimary: '#F4F7FB',
      textSecondary: '#B6C1D1',
      textTertiary: '#8998AC',

       textDisabled: '#647288',
       textInverse: '#111827',

       border: '#293A53',
       borderStrong: '#3A4D68',
       divider: '#223249',

       success: '#61CA9A',
       successSoft: '#153A2B',

       warning: '#EFB956',
       warningSoft: '#3D3017',

       danger: '#EF838B',
       dangerSoft: '#421F25',

       info: '#7EB1FF',
       infoSoft: '#183258',

       overlay: 'rgba(0, 0, 0, 0.68)',
  };
```


## 6.2 Typography

Use DM Sans throughout.

```javascript
  const typography = {
    display: {
       fontSize: 32,
       lineHeight: 39,
       fontWeight: '700',
    },

       heading1: {
            fontSize: 28,
            lineHeight: 34,
            fontWeight: '700',
       },

       heading2: {
          fontSize: 24,
          lineHeight: 30,
          fontWeight: '700',
       },

heading3: {
  fontSize: 20,
  lineHeight: 26,
  fontWeight: '600',
},

sectionTitle: {
  fontSize: 18,
     lineHeight: 24,
     fontWeight: '600',
},

bodyLarge: {
   fontSize: 16,
   lineHeight: 24,
   fontWeight: '400',
},

body: {
   fontSize: 14,
   lineHeight: 21,
   fontWeight: '400',
},

bodyMedium: {
   fontSize: 14,
   lineHeight: 21,
   fontWeight: '500',
},

label: {
   fontSize: 12,
   lineHeight: 17,
   fontWeight: '500',
},

caption: {
   fontSize: 11,
   lineHeight: 16,
   fontWeight: '400',
},

priceLarge: {
   fontSize: 22,
   lineHeight: 28,
   fontWeight: '700',
},

       price: {
         fontSize: 17,
         lineHeight: 22,
         fontWeight: '700',
       },
  };
```

Do not use unnecessarily large text.

Use screen headings between 24px and 28px.

Do not use 40px or 48px headings on ordinary mobile screens.


## 6.3 Spacing


```javascript
  const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
       base: 16,
       lg: 20,
       xl: 24,
       xxl: 32,
       xxxl: 40,
       section: 48,
  };
```

Default rules:

 - Screen horizontal padding: 16px or 20px.
 - Section gap: 24px to 32px.
 - Card padding: 12px to 16px.
 - Form input gap: 16px.
 - Related text gap: 4px to 8px.
 - Bottom safe-area padding must always be respected.


## 6.4 Radius


```javascript
  const radius = {
    small: 8,
    medium: 12,

       large: 16,
       extraLarge: 24,
       pill: 999,
  };
```

Use:

 - 10–12px for inputs.
 - 10–12px for buttons.
 - 14–16px for cards.
 - 24px top radius for bottom sheets.
 - Full pill radius for badges and chips.

Do not make every element 24px rounded.


# 7. GLOBAL MOBILE LAYOUT RULES


## 7.1 Screen Container

Every screen must:

 - Respect safe areas.
 - Use consistent horizontal padding.
 - Support small Android devices.
 - Support large iPhones.
 - Support increased text size.
 - Handle keyboard appearance.
 - Avoid fixed content heights.
 - Avoid clipped content.
 - Avoid actions under the bottom navigation.


## 7.2 Screen Header Types

Create these reusable header variants:


### Standard Header


Contains:

 - Back button.
 - Screen title.
 - Optional trailing action.

Use for:

 - Book details.
 - Order details.
 - Forms.
 - Settings subpages.


### Main Tab Header


Contains:

 - Greeting or title.
 - Optional subtitle.
 - Notification icon.
 - Cart or action icon.
 - Avatar where relevant.

Use for:

 - Home.
 - Admin dashboard.
 - Store.
 - Account.


### Search Header


Contains:

 - Back button or title.
 - Search input.
 - Optional filter action.

Use for:

 - Full catalogue search.
 - Admin book search.
 - User search.


### Collapsible Header


Use only when:

 - A details page has significant scroll content.
 - The main title can collapse safely.
 - It improves context.

Do not use collapsible headers everywhere.


# 8. GLOBAL COMPONENT SPECIFICATIONS


## 8.1 Primary Button

Must include:

 - Minimum height: 48px.
 - Horizontal padding: 18px.
 - Medium or semibold label.
 - Loading spinner.
 - Disabled style.
 - Pressed state.
 - Accessible label.
 - Optional leading icon.

Do not resize when loading.


## 8.2 Secondary Button

Use for:

 - Alternative actions.
 - Edit actions.
 - Non-primary navigation.
 - Retry actions.

It must never visually compete with the primary action.


## 8.3 Icon Button

Requirements:

 - Minimum touch target: 44px.
 - Visible pressed state.
 - Accessibility label.
 - Badge support.
 - Consistent icon size.


## 8.4 Search Input

The search component must contain:

 - Search icon.
 - Placeholder.
 - Clear button when text exists.
 - Loading indicator during active search.
 - Optional filter button.
 - Optional voice search only if truly implemented.
 - Focused state.
 - Error state where applicable.

Search must be debounced.

Do not request on every keystroke.


## 8.5 Filter Chips

Filter chips must support:

 - Default.
 - Selected.
 - Disabled.
 - Removable.
 - Count badge.

Do not put twenty chips in a horizontally scrolling row.

Use a filter bottom sheet when filter options become complex.


## 8.6 Banner Components

Create separate banner types:


### Promotional Banner


Use for:

 - Genuine campaigns.
 - New semester offers.
 - Free-delivery campaigns.
 - Important book collections.

It should contain:

 - Short headline.
 - One supporting sentence.
 - One CTA.
 - Relevant visual.
 - Clear contrast.


### Informational Banner


Use for:

 - Profile incomplete.
 - Update academic level.
 - Delivery changes.
 - App maintenance information.


### Warning Banner


Use for:

 - Payment verification delay.
 - Stock changes.
 - Restricted actions.
 - Address problems.


### Success Banner


Use sparingly for persistent success information.

Do not place banners on every screen.


## 8.7 Carousel Components

Carousels may be used for:

 - Home promotions.
 - New-arrival campaigns.
 - Featured academic collections.
 - Onboarding slides.

Carousel rules:

 - Maximum 3–5 slides.
 - Show page indicators.
 - Allow manual swiping.

 - Do not auto-rotate quickly.
 - If auto-rotation exists, pause during interaction.
 - Do not hide critical content only in a carousel.
 - Maintain the same card height.
 - Make banners readable without requiring image text.
 - Do not create carousels on settings, checkout or admin forms.


## 8.8 Book Card Types

Create these reusable book-card variants.


### Compact Horizontal Book Card


Use for:

 - Search suggestions.
 - Cart.
 - Related books.
 - Admin lists.

Contains:

 - Cover.
 - Title.
 - Author.
 - Price.
 - Availability.
 - Optional action.


### Grid Book Card


Use for:

 - Store.
 - Favourites.
 - Recommendations.

Contains:

 - 2:3 cover.
 - Favourite icon.
 - Availability badge.
 - Two-line title.
 - One-line author.
 - Rating.
 - Price.


### Featured Book Card


Use for:

 - Home recommendation feature.
 - Campaign sections.

Contains:

 - Larger cover.
 - Short relevance message.
 - Price.
 - CTA.

Do not invent different book-card layouts for each screen.


## 8.9 Skeleton Components

Build matching skeletons for:

 - Book cards.
 - Order cards.
 - Profile headers.
 - Cart items.
 - Admin KPI cards.
 - Notifications.
 - Form detail pages.
 - Charts.
 - Search suggestions.

Skeleton shapes must resemble the real content.

Do not show a generic spinner in the middle of every screen.


## 8.10 Empty State

Every empty state contains:

 - Relevant simple illustration or icon.
 - Clear heading.
 - One-sentence explanation.
 - Primary action where useful.
 - Secondary action only when necessary.

Example:

  No favourite books yet

  Save any book you are interested in and it will appear here.

  Browse books


## 8.11 Error State

Every full error state contains:

 - Calm icon.
 - Specific heading.
 - Useful explanation.
 - Retry button.
 - Secondary navigation action where appropriate.
 - Request ID only inside optional support details.

Do not expose stack traces or technical API messages.


## 8.12 Bottom Sheet

Use bottom sheets for:

 - Filters.
 - Sort options.
 - Department selection.
 - Level selection.
 - Address selection.
 - Delivery-method details.
 - Contextual actions.
 - Legal next order statuses.
 - Image-source selection.

Bottom-sheet structure:

     1. Drag handle.
     2. Title.
     3. Optional supporting text.
     4. Scrollable content.
     5. Sticky action footer where needed.
     6. Safe-area padding.


## 8.13 Modal

Use modals only for:

 - Short confirmations.
 - Destructive warnings.
 - Critical decisions.
 - Small focused actions.

Do not use modals for:

 - Checkout.
 - Long forms.
 - Book creation.
 - Order details.
 - Large filter systems.
 - Full user-management screens.


# 9. AUTHENTICATION NAVIGATION

The application must resolve these states:

  BOOTING
  FIRST_LAUNCH
  SIGNED_OUT
  NEW_DEVICE_VERIFICATION
  PROFILE_INCOMPLETE
  STUDENT_APP
  ADMIN_APP
  ACCOUNT_RESTRICTED

Do not manually push the user from Login to Onboarding.

The authentication state must determine the navigation tree.

10. COMPLETE PRE-AUTH SCREEN DESIGNS

## 10.1 Splash Screen



### Purpose


Load:

 - Fonts.
 - Theme.
 - Secure session.
 - App configuration.
 - User role.
 - Profile-completion state.


### Visual Layout


 - Solid theme background.
 - Curricula logo centred.
 - Wordmark below.
 - Optional subtle logo reveal.
 - Small loader only if loading exceeds a short threshold.

Motion

 - Logo fade and slight scale.
 - 200–300ms.
 - No long cinematic animation.

Do Not

 - Hold the screen for a fixed 3.2 seconds.
 - Add slogans.
 - Show progress percentages.
 - Add random floating books.
 - Delay navigation after loading has completed.


## 10.2 Onboarding Screen


Layout

Use a three-slide carousel.

Each slide contains:

     1. Illustration area occupying approximately 40% of the available content height.
     2. Heading.
     3. Maximum two lines of supporting text.
     4. Progress indicators.
     5. Bottom action area.

Slide One

Heading:

  Find textbooks for your course

Supporting text:

  Browse books selected for your department, level and academic needs.

Visual:

 - Student browsing textbooks.
 - University environment.
 - Clean modern illustration.

Slide Two

Heading:

  Buy with confidence

Supporting text:

  See current prices, availability and clear order information before paying.

Visual:

 - Book order and secure payment.
 - Avoid generic banking graphics.

Slide Three

Heading:

  Track every order

Supporting text:

  Receive updates from payment confirmation until your books arrive.

Visual:

 - Order status progression.

Controls

 - Skip at top right.
 - Page indicator above footer.
 - Next button.
 - Final button: Get started .

Design Rules

 - Do not show onboarding after logout.
 - Do not request notification permission here.
 - Do not use overly abstract unDraw artwork without adapting it to the product.
 - Do not use a small image with huge unused empty space.


## 10.3 Welcome/Auth Entry Screen

Create this screen only if needed after onboarding.

Sections

     1. Brand illustration or compact book collage.
     2. Heading: Your university bookshop, in one place
     3. Supporting text.
     4. Primary CTA: Create account
     5. Secondary CTA: Log in
     6. Terms and privacy links.

Do not add this screen if it unnecessarily duplicates Login.


## 10.4 Login Screen


Header

 - Back button only when entered from Auth Entry.
 - Compact logo.
 - No large image banner.

Main Sections

    1. Heading: Welcome back
    2. Supporting text: Log in with your email address or matric number.
    3. Identifier input.
    4. Password input.
    5. Forgot-password link.
    6. Login button.
    7. Create-account link.

Identifier Input

Label:

  Email or matric number

Placeholder:

  name@example.com or EEE/34/1234

Password Input

 - Visibility toggle.
 - Password-manager support.
 - Proper autocomplete.

Loading State

 - Button label becomes Logging in .
 - Spinner inside button.
 - Inputs remain visible.
 - Prevent repeated submission.

Error State

Use inline banner:

  We could not log you in with those details. Check your information and try
  again.

Do not reveal whether the account exists.

Footer

 - Privacy policy.
 - Terms.
 - Application version, optional and subtle.

New Device Flow

After valid credentials from a new device:

  Login
  → Verify this device

Do not create the full session before verification succeeds.


## 10.5 New Device Verification Screen


Header

 - Back or cancel action.
 - Security status icon.

Sections

    1. Heading: Verify this device
    2. Explanation with masked email.
    3. OTP input.
    4. Expiry text.
    5. Verify button.
    6. Resend code.
    7. Use another account.

OTP Component

 - Five digits.
 - Support paste.
 - Support operating-system OTP autofill.
 - Automatically move focus.
 - Allow deletion and correction.

 - Use one visually grouped accessible input or correctly accessible individual cells.

States

 - Code sent.
 - Invalid code.
 - Expired code.
 - Too many attempts.
 - Resending.
 - Resent successfully.
 - Network error.

Security Banner

Optional:

  We ask for verification when your account is used on a device we do not
  recognise.


## 10.6 Sign-Up Screen


Main Sections

    1. Heading: Create your student account
    2. Email address.
    3. Matric number.
    4. Password.
    5. Confirm password.
    6. Terms checkbox.
    7. Create-account button.
    8. Login link.

Password Requirements

Display a compact checklist after focus:

 - Minimum length.
 - Number.
 - Letter.
 - Any additional backend requirement.

Do not use aggressive red errors before interaction.

Terms

Use:

  I agree to the Terms of Service and Privacy Policy.

Both documents must be tappable.

Success Flow

  Create account
  → Email verification if enabled
  → Complete profile


## 10.7 Email Verification Screen

Use this only if email verification is part of the final flow.

Sections

       1. Email icon.
       2. Heading: Check your email
       3. Masked email address.
       4. Five-digit verification input.
       5. Verify button.
       6. Resend countdown.
       7. Change email.
       8. Help link.

Do Not

 - Create a separate generic success toast.
 - Let users repeatedly request codes without rate limits.
 - Automatically send several codes.


## 10.8 Complete Profile Screen

Use a three-step full-screen form.

Shared Header

 - Back where allowed.

 - Step text: Step 1 of 3

 - Thin progress bar.

 - Save-and-exit only if partial profile persistence exists.

Step 1: Personal Information

Sections:

    1. Avatar upload.
    2. Full name.
    3. Phone number.
    4. Continue button.

Avatar component:

 - Circular preview.
 - Camera overlay icon.
 - Bottom sheet:
 - Take photo.
 - Choose from library.
 - Remove photo.

Avatar must remain optional.

Step 2: Academic Information

Sections:

    1. Institution, if future-ready.
    2. School.
    3. Department.
    4. Academic level.
    5. Explanation: We use this information to show books relevant to your course.

Use searchable bottom-sheet selectors.

Department selection should automatically derive the school where possible.

Do not show 57 departments as an unsearchable list.

Step 3: Interests and Preferences

Sections:

    1. Subject-interest chips.
    2. New-arrival notification option.
    3. Optional recommendation preference.
    4. Profile summary.
    5. Complete-profile button.

Do not require users to select interests.


## 10.9 Forgot Password Screen


Sections

    1. Back button.
    2. Heading: Reset your password
    3. Supporting text.
    4. Email input.
    5. Send-reset-link button.
    6. Return-to-login link.

Submitted State

Replace form with:

 - Mail icon.
 - Check your email .
 - Masked email.
 - Resend action.
 - Open-email-app action.
 - Return to login.

Use the same submitted response whether or not the account exists.


## 10.10 Reset Password Screen


Sections

    1. Heading.
    2. New password.
    3. Password requirements.
    4. Confirm password.
    5. Reset-password button.

States

 - Valid reset token.
 - Expired token.
 - Already-used token.
 - Invalid token.
 - Successful reset.

Success Screen

 - Success icon.
 - Password updated .
 - Supporting text.
 - Log in button.


## 10.11 Restricted Account Screen


Sections

    1. Calm warning icon.
    2. Heading: Your account is currently restricted
    3. Reason, when policy allows.
    4. Restriction date.
    5. Available next action.
    6. Contact support.
    7. Logout.

Do not show the normal application beneath a restriction overlay.


# 11. STUDENT NAVIGATION

Use five bottom tabs:

  Home
  Store
  Orders
  Favourites
  Account

Global actions:

 - Cart.
 - Notifications.

Do not add Cart and Notifications as extra tabs.

Selected tab:

 - Stronger icon.
 - Primary colour.
 - Visible text label.

Unselected tab:

 - Outline icon.
 - Secondary text colour.


# 12. COMPLETE STUDENT SCREEN DESIGNS


## 12.1 Student Home Screen



### Purpose


Help the student:

 - Find books quickly.
 - Continue an active shopping journey.
 - Discover relevant books.
 - Track active orders.
 - Update academic information when needed.

Header Section

Contains:

 - Small greeting: Good morning

 - Student first name.

 - Profile avatar.
 - Notification icon.
 - Cart icon with item-count badge.

Do not use an oversized heading.

Search Section

Use a prominent search bar:

  Search by title, author or course code

Behaviour:

 - Tapping opens the Store search.
 - Search icon left.
 - Optional scan icon only if real ISBN scanning is implemented.
 - Do not add a microphone unless voice search exists.

Primary Hero Banner Carousel

A banner carousel may appear below search.

Maximum three banners.

Possible banner types:

Banner 1: Academic Relevance

  Books selected for your department
  Browse textbooks recommended for Electrical Engineering.

CTA:

  View recommendations

Banner 2: New Semester

Only when there is a real campaign.

  Prepare for the new semester
  Find books for your current level before classes begin.

CTA:

  Browse books

Banner 3: Delivery or Pickup Information

Only when operationally useful.

  Choose delivery or campus pickup
  See available fulfilment options during checkout.

CTA:

  Learn more

Banner design:

 - 16px radius.
 - Strong but restrained background.
 - One illustration or book collage.
 - One CTA.
 - No dense text.
 - Consistent height.
 - Page indicators.

Do not use fake discounts.

Academic Profile Card

Display:

 - Department.
 - Level.
 - School.
 - Edit action.

Example:

  Your academic profile
  Electrical & Electronics Engineering
  300 Level

CTA:

  Update

Show an informational banner when the academic profile is incomplete.

Active Order Section

Show only when an active order exists.

Section heading:

  Your active order

Card contains:

 - Order reference.
 - Status.
 - Progress bar or compact timeline.
 - Expected next step.
 - Two book thumbnails.
 - Track order .

Do not show empty active-order placeholders.

Continue Shopping Section

Show when:

 - Cart has items.
 - User recently viewed books.

Possible content:

 - Cart summary.
 - Last viewed books.
 - Saved unfinished checkout.

Do not show the section when there is no meaningful continuation.

Recommended for Your Level

Horizontal carousel of book cards.

Each card:

 - Cover.
 - Title.
 - Author.
 - Price.
 - Rating.
 - Favourite.
 - Relevance chip such as 300 Level .

Section header:

 - Title.
 - See all .

Recommendations must use real department/level associations.

New Arrivals

Use a horizontal book list or two-column preview.

Show:

 - Recently added relevant books.
 - New badge.
 - Date only if useful.

Do not label old seeded books as new.

Popular in Your Department

Only show if based on real:

 - Purchases.
 - Favourites.
 - Views.
 - Ratings.

Do not display fake popularity.

Browse by Category

Use a two-row horizontal or responsive grid.

Possible categories:

 - Engineering.
 - Mathematics.
 - Computing.
 - Sciences.
 - Agriculture.
 - Management.
 - Environmental studies.

Each category card:

 - Small icon.
 - Label.
 - Soft background.
 - Consistent size.

Do not use large illustration cards for every category.

Recently Viewed

Show a compact horizontal list.

Allow:

 - Open book.
 - Clear history, optional.

Store only appropriate local history.

Home Empty/Personalisation State

When academic profile is missing:

 - Show profile-completion banner.
 - Show general new arrivals.
 - Show popular books.
 - Avoid pretending recommendations are personalised.


## 12.2 Store Screen


Header

 - Title: Store

 - Cart icon.

 - Notification icon, optional depending on navigation consistency.

Sticky Search

Search input remains visible near the top.

Placeholder:

  Search books, authors or course codes

Quick Filter Chips

Show only the most used:

 - Department.
 - Level.
 - In stock.
 - Price.
 - All filters.

Selected chips must display clearly.

Featured Collection Banner

Optional and non-sticky.

Examples:

 - Essential 300 Level textbooks .
 - New computer science arrivals .
 - Books under ₦10,000 .

Use only data-backed collections.

Results Header

Contains:

 - Result count.
 - Current sort.
 - View mode only if both modes are fully designed.

Example:

  248 books
  Recommended

Book Grid

Use two columns.

Each card:

 - 2:3 image.
 - Favourite icon.
 - Availability badge.
 - Two-line title.
 - One-line author.
 - Rating.
 - Price.

Spacing:

 - 12px column gap.
 - 20px vertical gap.

Do not add a large button to every grid card.

Pagination

Use infinite scrolling or paginated loading.

Show:

 - Footer loader.
 - Retry button on pagination error.
 - End-of-results message only when useful.

Pull to Refresh

Support pull-to-refresh without replacing existing content with a full spinner.

Search Suggestions

When the search field is active, show:

    1. Recent searches.
    2. Suggested titles.
    3. Suggested authors.
    4. Suggested course codes.
    5. Clear-history action.

Do not show unrelated trending searches without real data.

Search Results State

Highlight the query in the results summary.

Example:

  34 results for “engineering mathematics”

No Search Results

Display:

 - Search icon.

 - Heading: No matching books

 - Explanation.

 - Suggestions:
 - Check spelling.
 - Try an author.
 - Remove filters.
 - Clear filters button.


## 12.3 Filter Bottom Sheet


Header

 - Drag handle.
 - Filter books .

 - Clear all .

Sections

Department

 - Current department shortcut.
 - Searchable selector.
 - Multi-select only if product requirements support it.

Academic Level

 - 100 Level.
 - 200 Level.
 - 300 Level.
 - 400 Level.
 - 500 Level.

School

Use searchable selector.

Category

Use compact checkboxes or chips.

Availability

 - In stock.
 - Out of stock.
 - All.

Default should not hide out-of-stock books unless specified.

Price Range

 - Minimum.
 - Maximum.
 - Preset ranges where useful.

Rating

 - 4 stars and above.
 - 3 stars and above.

Only include if ratings are meaningful.

Sticky Footer

 - Result preview: Show 248 books

 - Clear or cancel as secondary action.


## 12.4 Sort Bottom Sheet

Options:

 - Recommended.
 - Newest.
 - Price: Low to High.
 - Price: High to Low.
 - Highest Rated.
 - Most Popular, only with real data.

Show radio selection.

Close automatically after selection or provide Apply consistently.


## 12.5 Book Details Screen



### Collapsible Header


Initial:

 - Back.
 - Share.
 - Favourite.

Collapsed:

 - Book title.
 - Back.
 - Favourite.

Book Hero

Layout:

 - Centred large 2:3 cover.
 - Soft background behind cover.

 - Subtle shadow.
 - Tap to view full image.

Optional thumbnail gallery only if books have multiple real images.

Core Details

Display:

 - Book title.
 - Author.
 - Edition.
 - Rating.
 - Review count.
 - Price.
 - Stock status.

The price must be prominent but not larger than the title.

Relevance Tags

Show only useful tags:

 - Department.
 - Level.
 - Course code.
 - Category.

Use a maximum visible count and More where needed.

Stock State

In Stock

  In stock

Low Stock

  Only 3 left

Only show exact low quantity when the data is real.

Out of Stock

  Currently out of stock

Optional:

  Notify me when available

Only if backend support exists.

Purchase Panel

Contains:

 - Quantity stepper.
 - Add to cart.
 - Buy now, optional.

Rules:

 - One dominant CTA.
 - Disable when out of stock.
 - Show maximum stock handling.
 - Show success through cart badge and subtle snackbar.

Description Section

Heading:

  About this book

Show:

 - 4–6 lines initially.
 - Read more .
 - Expanded state.

Book Information Section

Use structured rows:

 - ISBN.
 - Publisher.
 - Edition.
 - Publication year.
 - Language.
 - Format.

Do not create a card for each field.

Academic Relevance Section

Display:

 - Schools.
 - Departments.
 - Levels.
 - Course codes.

Explain relevance where useful:

  Commonly used by 300 Level Electrical Engineering students.

Only use claims supported by data.

Ratings Summary

Contains:

 - Average rating.
 - Stars.
 - Rating count.
 - Distribution bars.
 - Write a review , subject to policy.

Reviews Preview

Show 2–3 reviews.

Each review:

 - User display name.
 - Verified purchase badge where real.
 - Rating.
 - Date.
 - Review text.
 - Helpful action only if implemented.

CTA:

  See all reviews

Related Books

Horizontal list.

Relationship should be based on:

 - Course.
 - Department.
 - Level.
 - Category.
 - Purchase behaviour.

Sticky Bottom Footer

Contains:

 - Price.
 - Add-to-cart button.

Respect bottom safe area.

Hide or adapt when the keyboard is not involved.


## 12.6 Full Book Image Viewer


Layout

 - Dark overlay.
 - Close button.

 - Zoomable image.
 - Optional image count.
 - Share action.

Do not use this screen when only a low-resolution image exists.


## 12.7 Ratings and Reviews Screen


Header

 - Back.
 - Ratings and reviews .

Summary

 - Average rating.
 - Total reviews.
 - Rating-distribution bars.

Filter Chips

 - All.
 - 5 stars.
 - 4 stars.
 - 3 stars.
 - With comments.

Sort

 - Most recent.
 - Highest rated.
 - Lowest rated.
 - Most helpful, only if supported.

Review List

Paginated.

Write Review CTA

Visible only when allowed.


## 12.8 Write Review Screen


Sections

    1. Book summary.
    2. Star selector.
    3. Review title, optional.
    4. Review text.
    5. Character counter.
    6. Submit button.

Validation

 - Rating required.
 - Review text limit.
 - Prevent repeated submission.

Success

Return to reviews with new review highlighted or updated.


## 12.9 Cart Screen


Header

 - Back or tab title.
 - Cart .
 - Item count.
 - Clear-cart action inside overflow menu, not as a dominant action.

Cart Notices

Show a warning banner when:

 - Price changed.
 - Stock reduced.
 - Item unavailable.
 - Delivery method unavailable.

Do not silently remove products.

Cart Item

Contains:

 - Cover.
 - Title.
 - Author or edition.
 - Price.
 - Quantity stepper.
 - Remove icon.
 - Stock warning.

Use swipe-to-remove only if there is also an accessible visible action.

Save for Later

Do not add unless the feature is fully supported.

Favourites can serve as the save mechanism.

Delivery Preview

Optional compact section:

  Delivery options are calculated at checkout.

Or show the selected method when returning from checkout.

Order Summary

Rows:

 - Subtotal.
 - Estimated delivery.
 - Discount, only if real.
 - Tax, if applicable.
 - Estimated total.

Clarify when the final amount may change.

Sticky Footer

Contains:

 - Total.
 - Checkout button.

CTA:

  Proceed to checkout

Empty Cart State

 - Cart illustration.
 - Your cart is empty .
 - Explanation.
 - Browse books .
 - Optional recently viewed section below.


## 12.10 Checkout Screen

Use one scrollable full screen with clear grouped sections.

Header

 - Back.
 - Checkout .
 - Secure-payment icon or text.

Contact Section

Display:

 - Full name.
 - Email.
 - Phone.
 - Edit action.

Do not ask the user to re-enter known details unless missing.

Fulfilment Method Section

Cards:

Delivery

 - Icon.
 - Label.
 - Estimated duration.
 - Fee.
 - Description.

Pickup

Only if supported.

 - Pickup location.
 - Opening period.
 - Fee.
 - Instructions.

Selected card must be obvious.

Address Section

When delivery is selected:

 - Default address card.
 - Change action.
 - Add address.
 - Validation warning when incomplete.

Order Items Section

Compact collapsible list.

Display:

 - Thumbnail.
 - Title.
 - Quantity.
 - Line total.

Do not repeat the full cart controls.

Payment Method Section

Options:

 - Paystack.
 - Flutterwave.

Each payment option:

 - Provider logo.
 - Short explanation.
 - Supported payment types, only when accurate.
 - Selected state.

Do not display secret or technical provider information.

Price Summary

Rows:

 - Items subtotal.
 - Delivery.
 - Discount.
 - Tax.
 - Total.

Total must be visually strongest.

Agreement Text

  By placing this order, you agree to the Terms of Service and Refund Policy.

Sticky Payment Footer

Displays:

 - Exact total.
 - CTA: Pay ₦25,500

Loading:

  Preparing payment

Prevent multiple taps.


## 12.11 Address Selection Bottom Sheet

Contains:

 - Saved addresses.
 - Default badge.
 - Edit action.
 - Add-new-address action.
 - Select button if selection is not immediate.


## 12.12 Add/Edit Address Screen


Fields

 - Address label.
 - Recipient name.
 - Phone number.
 - Street address.
 - Additional details.
 - City.
 - State.
 - Postal code, optional where appropriate.
 - Delivery instructions.
 - Default-address toggle.

Map

Do not add map selection unless location support is accurate and useful.

Footer

 - Save address.


## 12.13 Payment Initialisation Screen

Show only if necessary between checkout and provider UI.

Content

 - Shield or payment icon.
 - Preparing secure payment .
 - Order amount.
 - Provider.
 - Non-blocking progress indicator.

Do not leave users here for an indefinite time.

Show Retry after failure.


## 12.14 Payment Verification Screen


States

Verifying

 - Loader.
 - Confirming your payment .
 - Do not pay again while we check the transaction.

Delayed

 - Informational warning.
 - Refresh status.
 - View orders.
 - Contact support.

Failed

 - Clear explanation.
 - Try again.
 - Choose another payment method.
 - View order.

Confirmed

Navigate to Order Confirmation.

Do not trust the provider client callback alone.


## 12.15 Order Confirmation Screen


Hero

 - Success icon.

 - Heading: Order confirmed

 - Supporting text.

Summary Card

 - Order reference.
 - Amount paid.
 - Payment method.
 - Date.
 - Fulfilment method.

Items

Compact item list.

What Happens Next

Timeline:

    1. Payment confirmed.
    2. Order preparation.
    3. Delivery or pickup.
    4. Completion.

Actions

Primary:

  Track order

Secondary:

  Continue shopping

Optional:

  Download receipt

Only if supported.


## 12.16 Orders Screen


Header

 - Title: Orders

 - Search action.

 - Filter action.

Segmented Tabs

Use user-friendly groups:

 - Active.
 - Completed.
 - Cancelled.

Do not create a tab for every backend status.

Active Order Card

Contains:

 - Order reference.
 - Date.
 - Status badge.
 - Item thumbnails.
 - Item count.
 - Total.
 - Next step.
 - View order .

Completed Order Card

Contains:

 - Completion date.

 - Items.
 - Total.
 - Buy-again action only if supported.
 - Review action for eligible books.

Order Search

Search by:

 - Order reference.
 - Book title where supported.

Empty States

Different copy for:

 - No active orders.
 - No completed orders.
 - No cancelled orders.


## 12.17 Order Details Screen


Status Hero

Contains:

 - Status badge.
 - Clear human-friendly status.
 - Short next-step explanation.
 - Expected date where reliable.

Order Timeline

Use a vertical or horizontal responsive timeline.

Stages:

 - Order placed.
 - Payment confirmed.
 - Preparing.
 - Ready or dispatched.
 - Completed.

Cancelled/refund states must branch correctly.

Do not mark future stages as complete.

Order Information

 - Order reference.
 - Date.
 - Fulfilment method.

Items Section

Each item:

 - Thumbnail.
 - Title.
 - Quantity.
 - Price.
 - Review action when eligible.

Delivery/Pickup Section

Delivery:

 - Address.
 - Recipient.
 - Phone.
 - Delivery instructions.

Pickup:

 - Location.
 - Pickup instructions.
 - Available time.

Payment Summary

 - Subtotal.
 - Delivery.
 - Discount.
 - Tax.
 - Total.

 - Payment provider.
 - Payment reference, partially masked where appropriate.

Help Section

Actions:

 - Contact support.
 - Report an issue.
 - Cancellation, when policy permits.
 - Request refund, when policy permits.

Do not show unavailable actions.


## 12.18 Cancel Order Flow

Use bottom sheet or dedicated confirmation.

Display:

 - Order reference.
 - Cancellation eligibility.
 - Consequences.
 - Refund expectations.
 - Reason selector.
 - Optional note.
 - Confirm cancellation.

Use destructive styling.

Do not cancel immediately from a single tap.


## 12.19 Favourites Screen


Header

 - Favourites
 - Count.
 - Sort or filter action.

Content

Two-column grid.

Each card:

 - Cover.
 - Title.
 - Author.
 - Price.
 - Availability.
 - Remove favourite.

Optional Sections

 - Price drop, only if real.
 - Back in stock, only if real.

Empty State

 - Heart/book icon.
 - No favourite books yet .
 - Supporting text.
 - Browse books .


## 12.20 Notifications Screen


Header

 - Notifications
 - Mark all as read.
 - Settings shortcut.

Filter Chips

 - All.
 - Orders.
 - Books.
 - Account.

Grouping

 - Today.
 - This week.
 - Earlier.

Notification Row

Contains:

 - Relevant icon.

 - Title.
 - One- or two-line body.
 - Timestamp.
 - Unread indicator.
 - Optional thumbnail.

Swipe Actions

Optional:

 - Mark read.
 - Delete.

Must have accessible alternatives.

Empty State

Different for:

 - No notifications.
 - No notifications in selected filter.


## 12.21 Account Screen


Profile Header

Contains:

 - Avatar.
 - Name.
 - Email or matric.
 - Department and level.
 - Edit-profile action.

Optional Profile Completion Banner

Show only if incomplete.

Section: Your Account

 - Edit profile.
 - Academic information.
 - Addresses.
 - Orders, optional shortcut.

Section: Preferences

 - Notifications.
 - Appearance.
 - Language only if supported.

Section: Security

 - Change password.
 - Active devices.
 - Security alerts.

Section: Support

 - Help centre.
 - Contact support.
 - Report a problem.

Section: Legal

 - Privacy policy.
 - Terms.
 - Refund policy.

Footer

 - Logout.
 - App version.

Do not display logout as a large red button near frequently used settings.


## 12.22 Edit Profile Screen


Sections

    1. Avatar.
    2. Personal information.
    3. Academic information.
    4. Interests.
    5. Save button.

Unsaved Changes

Warn before leaving.

Academic Change Banner

When department or level changes:

  Changing your academic profile will update the books recommended to you.


## 12.23 Academic Information Screen

Display:

 - School.
 - Department.
 - Level.
 - Matric number.
 - Institution.

Matric number may be read-only depending on policy.

Use searchable selectors.


## 12.24 Notification Preferences Screen


Push Notifications

 - Order updates.
 - New arrivals.
 - Broadcasts.
 - Recommendations.

Email Notifications

 - Receipts.
 - Order status.
 - Security alerts.
 - Product updates.

Important Rule

Security alerts should remain enabled or clearly explain any restrictions.


## 12.25 Appearance Screen

Options:

 - System default.
 - Light.

 - Dark.

Show visual previews.

Persist selection.

Apply immediately.


## 12.26 Change Password Screen

Fields:

 - Current password.
 - New password.
 - Confirm new password.

Display:

 - Password requirements.
 - Revoke other sessions option, if supported.
 - Update button.

On success:

 - Show dedicated success feedback.
 - Explain whether other devices were signed out.


## 12.27 Active Devices Screen


Current Device

Place first.

Display:

 - Device name.
 - Platform.
 - Last active.
 - Approximate location.
 - Current-device badge.

Other Devices

Display unique device sessions.

Actions:

 - View details.
 - Sign out.
 - Sign out all other devices.

Device Details Bottom Sheet

 - Device.
 - Platform.
 - App version.
 - First signed in.
 - Last active.
 - Approximate IP location.
 - Revoke session.

Do not duplicate the same installation.


## 12.28 Help Centre Screen


Search

  Search help topics

Categories

 - Account.
 - Orders.
 - Payments.
 - Delivery.
 - Returns.
 - Security.

Popular Articles

Use only real support content.

Contact Support

 - Email.
 - In-app message only if supported.
 - Phone only if operationally supported.


## 12.29 Contact Support Screen

Fields:

 - Category.
 - Order, optional.
 - Subject.
 - Message.
 - Attachment, optional.
 - Submit.

Display expected support response time only if accurate.


## 12.30 Legal Screens

Separate screens:

 - Terms of Service.
 - Privacy Policy.
 - Refund Policy.

Use readable typography.

Provide:

 - Effective date.
 - Section navigation for long documents.
 - External-open option where needed.


# 13. ADMIN NAVIGATION

Use five tabs:

  Dashboard
  Orders
  Books
  Inventory
  More

Global admin actions:

 - Notifications.

 - Profile.
 - Quick create, only where contextually appropriate.


# 14. COMPLETE ADMIN SCREEN DESIGNS


## 14.1 Admin Dashboard


Header

Contains:

 - Greeting.
 - Admin name.
 - Date.
 - Notification icon.
 - Avatar.

Operational Alert Banner

Show only when action is needed.

Examples:

 - 8 paid orders need processing .
 - 12 books are low in stock .
 - 3 payment records need review .

CTA:

  Review now

Use warning or info style depending on severity.

KPI Carousel or Grid

Use a two-column grid or horizontally scrollable KPI row.

Maximum primary KPIs:

       1. Orders today.
       2. Revenue today.

       3. Orders requiring action.
       4. Low-stock books.

Each KPI card:

 - Label.
 - Main value.
 - Time range.
 - Small icon.
 - Optional trend only if backed by real comparative data.

Do not invent percentage changes.

Order Status Overview

Use:

 - Segmented progress bars.
 - Donut chart.
 - Compact bar chart.

Show:

 - Paid.
 - Processing.
 - Ready.
 - Completed.

Chart must have:

 - Legend.
 - Data labels or accessible summary.
 - Clear period.

Do not use tiny labels.

Action Required Section

Cards for:

 - Paid orders not processed.
 - Payment verification issues.
 - Low stock.
 - Out of stock.
 - Failed notification jobs, only if admins manage them.

Each card:

 - Count.
 - Short explanation.
 - CTA.

Recent Orders

Compact vertical list.

Each order:

 - Reference.
 - Customer.
 - Amount.
 - Status.
 - Time.
 - Chevron.

CTA:

  View all orders

Inventory Health

Display:

 - Healthy.
 - Low stock.
 - Out of stock.

Use horizontal progress or stacked bar.

Include:

  Review inventory

Quick Actions

Grid of compact actions:

 - Add book.
 - Adjust stock.
 - Send broadcast.
 - Manage departments.

Do not use more than four primary quick actions.


## 14.2 Admin Notifications Screen

Use similar notification patterns to student notifications but with operational categories:

 - Orders.
 - Inventory.
 - Payments.
 - System.

Each notification links to the relevant admin screen.


## 14.3 Admin Orders Screen


Header

 - Orders
 - Search.
 - Filter.

Summary Strip

Compact horizontally scrollable status counts:

 - Needs action.
 - Processing.
 - Ready.
 - Completed.

Tapping applies a filter.

Filter Chips

 - Needs action.

 - Paid.
 - Processing.
 - Ready.
 - Completed.
 - Cancelled.
 - Refunded.

Do not show every filter simultaneously on small devices.

Order Search

Search by:

 - Order reference.
 - Customer name.
 - Email.
 - Matric number where appropriate.

Admin Order Card

Contains:

 - Order reference.
 - Customer name.
 - Date/time.
 - Amount.
 - Payment status.
 - Order status.
 - Fulfilment method.
 - Number of items.
 - Contextual next action.

Example next action:

  Start processing

Only show legal next actions.

Bulk Actions

Do not add bulk status changes on mobile unless clearly safe and required.


## 14.4 Admin Order Filter Bottom Sheet

Sections:

 - Order status.
 - Payment status.
 - Fulfilment method.
 - Date range.
 - Amount range.
 - Customer department, optional.
 - Sort.

Footer:

  Show 48 orders


## 14.5 Admin Order Details Screen


Header

 - Back.
 - Order reference.
 - Overflow menu.

Status and Action Hero

Contains:

 - Current status.
 - Payment state.
 - Primary legal next action.
 - Warning banner when attention is required.

Example:

  Payment confirmed
  This order is ready to be moved into processing.

CTA:

  Start processing

Order Timeline

Show:

 - Status.
 - Actor.
 - Date/time.
 - Reason or note where applicable.

Customer Section

Display:

 - Name.
 - Email.
 - Phone.
 - Matric number, if relevant.
 - Department.
 - Level.
 - Contact actions.

Do not expose unnecessary personal data.

Fulfilment Section

Delivery:

 - Address.
 - Instructions.
 - Method.
 - Delivery fee.

Pickup:

 - Location.
 - Pickup instructions.

Item Section

Each item:

 - Cover.
 - Title.
 - Quantity.
 - Unit price.
 - Total.
 - Inventory status.

Payment Section

 - Provider.
 - Amount.
 - Currency.
 - Payment status.
 - Internal reference.
 - Provider reference.
 - Verification timestamp.

Hide sensitive details.

Internal Notes

 - Existing notes.
 - Add note.
 - Timestamp.
 - Admin identity.

Activity History

Show:

 - Status changes.
 - Inventory reservations.
 - Payment confirmation.
 - Notifications sent.
 - Admin changes.

Exception Actions

Inside overflow or dedicated section:

 - Cancel order.
 - Begin refund.
 - Resend notification.
 - Report payment issue.

Require confirmation and reason.


## 14.6 Update Order Status Bottom Sheet

Display:

 - Current status.
 - Only legal next statuses.
 - Explanation of each.
 - Optional reason.
 - Confirmation.

Example:

  Move order to Processing?
  The customer will be notified that preparation has started.

Do not provide a generic dropdown containing every status.


## 14.7 Admin Books Screen


Header

 - Books
 - Add-book button.
 - Search action.

Search Field

  Search title, author, ISBN or course

Status Summary Chips

 - Published.

 - Draft.
 - Out of stock.
 - Archived.

Filter Chips

 - School.
 - Department.
 - Level.
 - Stock.
 - Publication status.
 - Sort.

Book Admin Card

Use compact horizontal layout.

Contains:

 - Cover.
 - Title.
 - Author.
 - Price.
 - Available stock.
 - Publication status.
 - Overflow menu.

Quick actions:

 - Edit.
 - Adjust stock.
 - Archive.
 - View details.

Do not place several buttons directly on every card.

Empty State

For no books:

 - Illustration.
 - No books added yet .
 - Add your first book .

For filtered state:

 - No books match these filters .
 - Clear filters .


## 14.8 Add Book Screen

Use a multi-section form or stepper.

Recommended steps:

  Basic details
  Academic classification
  Price and inventory
  Cover and publishing
  Review

Step 1: Basic Details

Fields:

 - Title.
 - Author.
 - Description.
 - ISBN.
 - Publisher.
 - Edition.
 - Publication year.
 - Language.
 - Format.

Use character limits and helper text.

Step 2: Academic Classification

Fields:

 - School.
 - Department.
 - Level.
 - Course code.
 - Category.

 - Tags.

Use searchable bottom sheets.

Allow multiple departments or levels only if the backend supports it.

Step 3: Price and Inventory

Fields:

 - Price.
 - Currency.
 - Initial available stock.
 - Reorder threshold.
 - Optional SKU.

Display money formatting correctly.

Step 4: Cover and Publishing

Sections:

 - Cover upload.
 - Image preview.
 - Replace.
 - Remove.
 - Draft/published selection.
 - Visibility summary.

Image requirements:

 - Recommended ratio.
 - Maximum size.
 - Supported formats.

Step 5: Review

Display a realistic product preview.

Sections:

 - Cover.
 - Title.
 - Author.

 - Price.
 - Academic tags.
 - Stock.
 - Publication state.

Actions:

 - Save draft.
 - Publish book.

Form Behaviour

 - Preserve entered values between steps.
 - Warn before leaving.
 - Scroll to first error.
 - Show upload progress.
 - Do not lose text when image upload fails.
 - Prevent duplicate submission.


## 14.9 Edit Book Screen

Same structure as Add Book.

Additional sections:

 - Publication information.
 - Current stock summary.
 - Last updated.
 - Change history link.

Do not combine historical inventory movements into editable fields.


## 14.10 Admin Book Details Screen


Sections

 - Cover and publication state.
 - Title and author.
 - Price.
 - Stock summary.
 - Academic associations.
 - Description.
 - Metadata.

 - Sales summary, only if real.
 - Rating summary.
 - Recent inventory movements.
 - Edit action.
 - Adjust inventory.
 - Archive action.


## 14.11 Inventory Dashboard


Header

 - Inventory .
 - Search.
 - Filter.
 - Adjustment shortcut.

Inventory KPI Grid

 - Active titles.
 - Available units.
 - Low-stock titles.
 - Out-of-stock titles.

Maximum four.

Inventory Health Chart

Use:

 - Stacked horizontal bar.
 - Donut chart.
 - Progress distribution.

Categories:

 - Healthy.
 - Low.
 - Out.

Restock Alert Banner

Example:

  12 books need restocking
  Review books that have reached their reorder threshold.

CTA:

  View low stock

Low Stock Section

List top urgent items.

Each row:

 - Cover.
 - Title.
 - Current quantity.
 - Reorder threshold.
 - Adjust button.

Recent Movements

Display:

 - Book.
 - Movement type.
 - Quantity change.
 - Admin.
 - Time.

Full Inventory List

Searchable and paginated.


## 14.12 Inventory Book Details


Header Summary

 - Book cover.
 - Title.

 - SKU or ISBN.
 - Inventory status.

Quantity Summary

 - Available.
 - Reserved.
 - Total.
 - Reorder threshold.

Stock Visual

Progress or bar indicating distance from threshold.

Actions

 - Adjust inventory.
 - Change reorder threshold.
 - View book.

Movement History

Filter by:

 - Restock.
 - Sale.
 - Reservation.
 - Correction.
 - Damage.
 - Return.


## 14.13 Adjust Inventory Screen


Summary

 - Book.
 - Current available quantity.
 - Reserved quantity.
 - Current threshold.

Form

 - Adjustment type.
 - Quantity.
 - Increase/decrease behaviour.
 - Reason.
 - Internal note.

 - Resulting quantity preview.

Warning

For large reductions:

  This adjustment will leave only 2 available units.

Confirm

Use a review confirmation before submission.


## 14.14 Inventory Movement Details

Display:

 - Movement type.
 - Quantity.
 - Previous quantity.
 - New quantity.
 - Reason.
 - Admin.
 - Order reference where related.
 - Timestamp.
 - Audit identifier.

Read-only.


## 14.15 More Screen


Profile Header

 - Admin avatar.
 - Name.
 - Role.
 - Email.

Catalogue Structure

 - Schools.
 - Departments.
 - Levels.

Users and Communication

 - Users & Access.
 - Broadcast notifications.

Administration

 - Admin profile.
 - Active devices.
 - Audit activity.
 - Application settings.

Support and Legal

 - Help.
 - Terms.
 - Privacy.

Footer

 - Logout.
 - Version.


## 14.16 Schools Screen


Header

 - Schools .
 - Add button.
 - Search.

School Card

Contains:

 - School name.
 - Abbreviation.
 - Number of departments.
 - Number of active books, if available.
 - Active/archived status.
 - Overflow menu.

Actions:

 - View departments.
 - Edit.
 - Archive.

Do not permanently delete schools with dependent records.


## 14.17 Add/Edit School Screen

Fields:

 - School name.
 - Abbreviation.
 - Description, optional.
 - Active status.

Display dependent-record warning when archiving.


## 14.18 School Details Screen

Sections:

 - School information.
 - Department count.
 - Book count.
 - Departments list.
 - Add department.
 - Edit school.
 - Archive.


## 14.19 Departments Screen


Header

 - Departments .
 - Add.
 - Search.

Filters

 - School.
 - Status.

Department Card

 - Department name.
 - Code.
 - School.

 - Supported levels.
 - Book count.
 - Status.
 - Overflow menu.


## 14.20 Add/Edit Department Screen

Fields:

 - Department name.
 - Department code.
 - School.
 - Supported levels.
 - Description, optional.
 - Active status.

Use searchable school selector.


## 14.21 Department Details Screen

Sections:

 - Department information.
 - School.
 - Levels.
 - Book count.
 - Student count, only if real.
 - Relevant books preview.
 - Edit.
 - Archive.


## 14.22 Academic Levels Screen


Header

 - Academic levels .
 - Add, only if custom levels are allowed.

Level Row

 - Display name.
 - Numeric order.
 - Active state.

 - Number of associated books.
 - Edit.

Do not overcomplicate a list of five fixed values.


## 14.23 Add/Edit Level Screen

Fields:

 - Name.
 - Numeric value or sort order.
 - Description.
 - Active state.

Warn when deactivating a level associated with books or users.


## 14.24 Users & Access Screen

Rename legacy Approvals to:

  Users & Access

Header

 - Search.
 - Filter.
 - Optional export only if supported.

Summary Chips

 - Active.
 - Restricted.
 - Banned.
 - Incomplete profiles.

Search

By:

 - Name.
 - Email.
 - Matric number.

User Card

 - Avatar.
 - Name.
 - Email or matric.
 - Department.
 - Level.
 - Status badge.
 - Last active.
 - Chevron.


## 14.25 User Details Screen


Profile Header

 - Avatar.
 - Name.
 - Account status.
 - Email.
 - Matric number.

Academic Section

 - School.
 - Department.
 - Level.

Account Section

 - Created date.
 - Last login.
 - Email verification.
 - Profile completion.

Orders Summary

 - Total orders.
 - Completed.
 - Cancelled.
 - Total spent, only if appropriate.

Device Summary

 - Active sessions count.
 - Last device.

Restriction History

 - Action.
 - Reason.
 - Admin.
 - Date.

Actions

 - Restrict account.
 - Restore account.
 - Ban account.
 - Revoke sessions.

Require confirmation and reason.


## 14.26 Restrict User Flow

Use full confirmation sheet.

Display:

 - User.
 - Current status.
 - Restriction type.
 - Duration, if temporary restrictions exist.
 - Reason.
 - Internal note.
 - Consequences.

Confirm button:

  Restrict account

Use destructive styling.


## 14.27 Broadcast Notifications Screen


Header

 - Broadcasts .
 - Create broadcast.

Summary

 - Drafts.
 - Scheduled.
 - Sent.

Filter Tabs

 - All.
 - Draft.
 - Scheduled.
 - Sent.

Broadcast Card

 - Title.
 - Audience.
 - Channels.
 - Status.
 - Recipient count.
 - Scheduled/sent date.
 - Delivery summary.
 - Overflow menu.


## 14.28 Create Broadcast Screen

Use a step-based flow.

Step 1: Audience

Options:

 - All students.
 - School.
 - Department.
 - Academic level.
 - Custom segment.

Display estimated recipient count.

For all-student broadcasts, show a warning.

Step 2: Message

Fields:

 - Title.
 - Message.
 - Optional image.
 - Notification type.
 - Deep-link destination.

Character guidance:

 - Short push title.
 - Concise notification body.

Step 3: Channels

 - In-app.
 - Push.
 - Email.

Explain differences.

Step 4: Schedule

 - Send now.
 - Schedule date and time.

Use timezone clearly.

Step 5: Preview and Confirm

Preview:

 - Push notification.
 - In-app card.
 - Email summary where possible.

Display:

 - Audience.
 - Estimated recipients.
 - Channels.
 - Schedule.

For broad sends, require explicit confirmation.


## 14.29 Broadcast Details Screen

Sections:

 - Message.
 - Audience.
 - Channels.
 - Status.
 - Schedule.
 - Recipient estimate.
 - Delivery results.
 - Failed deliveries.
 - Created by.
 - Created date.
 - Cancel schedule, when allowed.
 - Duplicate broadcast, optional.


## 14.30 Admin Profile Screen

Fields:

 - Avatar.
 - Full name.
 - Email.
 - Phone.
 - Role, read-only unless permission exists.
 - Save.


## 14.31 Admin Security Screen

Sections:

 - Change password.
 - Active devices.
 - Security alerts.
 - Sign out all other sessions.
 - Two-factor authentication if later supported.


## 14.32 Audit Activity Screen

Use only for authorised admins.

Filters

 - Actor.
 - Action.
 - Entity.
 - Date.
 - Severity.

Audit Card

 - Action.
 - Entity.
 - Actor.
 - Date.
 - Short change summary.

Detail Screen

 - Previous values.
 - New values.
 - Reason.
 - Request ID.
 - Actor.
 - Timestamp.

Mask sensitive fields.


# 15. GLOBAL SEARCH EXPERIENCES


## 15.1 Student Global Search

Search categories:

 - Books.
 - Authors.
 - Course codes.
 - Categories.

Search results should be grouped when useful.


## 15.2 Admin Global Search

Do not create one global search unless it is valuable.

Possible entities:

 - Orders.
 - Books.
 - Users.

Results must be clearly grouped and permission-aware.


# 16. GLOBAL BANNER RULES

Use banners only for:

 - Genuine promotion.
 - Important information.
 - Required user action.
 - Operational warning.
 - Security notice.

Do not use banners for:

 - Decorative filler.
 - Repeating the page title.
 - Ordinary success messages.
 - Random motivational quotes.
 - Fake offers.

Every banner must answer:

     1. What happened?
     2. Why does it matter?
     3. What can the user do?


# 17. GLOBAL CAROUSEL RULES

Use carousels only for:

 - Home promotional campaigns.
 - Relevant academic collections.
 - Onboarding.

 - Featured product sets.

Do not use carousels for:

 - Checkout.
 - Settings.
 - Addresses.
 - Notifications.
 - Order details.
 - Admin forms.
 - Legal content.
 - Security.

A carousel must never be the only place where important information appears.


# 18. GLOBAL FORM RULES

Every form must include:

 - Visible labels.
 - Appropriate keyboard.
 - Validation.
 - Helper text.
 - Error text.
 - Disabled state.
 - Loading state.
 - Scroll-to-error.
 - Keyboard avoidance.
 - Unsaved-changes handling.
 - Server-error mapping.
 - Duplicate-submission prevention.

Do not use placeholders as labels.


# 19. GLOBAL LOADING RULES

Use:

 - Skeletons for screen content.
 - Inline spinners for buttons.
 - Footer loader for pagination.
 - Pull-to-refresh indicator.
 - Upload progress for files.

Do not remove already loaded content during a background refresh.


# 20. GLOBAL EMPTY STATES

Design separate empty states for:

 - Empty cart.
 - No favourites.
 - No orders.
 - No active orders.
 - No notifications.
 - No search results.
 - No books.
 - No low-stock books.
 - No broadcasts.
 - No restricted users.
 - No audit events.
 - No saved addresses.

Do not reuse the exact same copy and illustration everywhere.


# 21. GLOBAL ERROR STATES

Design separate error states for:

 - Failed session restoration.
 - Failed book loading.
 - Failed search.
 - Failed order loading.
 - Failed payment initialisation.
 - Failed payment verification.
 - Failed notification loading.
 - Failed admin metrics.
 - Failed image upload.
 - Failed pagination.
 - Offline mode.

Use contextual messages.


# 22. OFFLINE EXPERIENCE

When offline:

 - Show a persistent offline banner.
 - Keep cached books visible.
 - Keep cached order summaries visible.
 - Disable payment.
 - Disable order-status mutations.
 - Disable inventory adjustments.
 - Disable broadcasts.
 - Allow safe local preference changes.
 - Provide Retry.

Never pretend a critical server mutation succeeded offline.


# 23. MOTION AND INTERACTIONS

Use animations for:

 - Screen transitions.
 - Bottom sheets.
 - Favourite toggles.
 - Cart badge changes.
 - Expand/collapse sections.
 - Skeleton fade.
 - Order success.
 - Status transitions.

Use durations:

 - Fast: 120–160ms.
 - Standard: 180–240ms.
 - Emphasised: 260–320ms.

Avoid:

 - Constant bouncing.
 - Floating decorative icons.
 - Long loading animations.
 - Auto-playing promotional motion.
 - Large animations during checkout.

Respect reduced-motion settings.


# 24. ACCESSIBILITY RULES

Every screen must support:

 - Screen readers.
 - Dynamic font size.
 - Proper heading hierarchy.
 - Accessible button labels.
 - Accessible form errors.
 - Minimum 44×44 touch areas.
 - Colour contrast.
 - Non-colour status indicators.
 - Reduced motion.
 - Logical focus order.
 - Keyboard navigation where applicable.
 - Clear selected states.

Do not hide essential text inside images.


# 25. DARK MODE RULES

Every screen must be designed for both light and dark modes.

Do not simply invert colours.

Dark mode must:

 - Use dark navy surfaces.
 - Maintain visible borders.
 - Avoid pure black everywhere.
 - Reduce heavy shadows.
 - Maintain readable images.
 - Adjust status colours.
 - Maintain accessible contrast.
 - Preserve clear selected states.

No hardcoded colours inside screens.


# 26. PERFORMANCE DESIGN RULES

 - Use properly sized book thumbnails.
 - Preserve image aspect ratios.

 - Avoid large full-resolution images in grids.
 - Avoid nested vertical scroll views.
 - Virtualise long lists.
 - Paginate large results.
 - Keep banners lightweight.
 - Avoid unnecessary blur and transparency.
 - Avoid rendering hidden admin trees for students.
 - Avoid complex charts that harm mobile performance.


# 27. RESPONSIVE TESTING

Every screen must work on:

 - Small Android phones.
 - Mid-range Android devices.
 - Large Android phones.
 - Standard iPhones.
 - Large iPhones.
 - Devices with notches.
 - Devices with larger text settings.
 - Light mode.
 - Dark mode.
 - Slow connections.
 - Offline mode.

Do not design only for one large simulator.


# 28. COPYWRITING RULES

Use clear language.

Use:

  Add to cart
  Place order
  Payment confirmed
  Preparing your order
  No books found
  Try another search
  Update password
  Save address

  Adjust inventory
  Send notification

Avoid:

  Proceed
  Execute
  Operation successful
  Kindly fill the form
  Invalid credentials supplied
  Data unavailable
  Something went wrong
  Click here

Buttons must explain their outcome.


# 29. IMPLEMENTATION INSTRUCTIONS FOR CLAUDE

Before implementing any screen:

    1. Inspect the existing navigation.
    2. Inspect the current reusable components.
    3. Inspect the theme implementation.
    4. Inspect the backend contracts.
    5. Identify the relevant role.
    6. Identify the screen’s primary user goal.
    7. Identify all screen states.
    8. Identify all actions.
    9. Identify the correct navigator.
   10. Reuse existing components.
   11. Do not create new API endpoints.
   12. Do not change working business functionality.
   13. Do not hardcode mock data.
   14. Do not use random design values.
   15. Do not create unfinished buttons.
   16. Do not leave placeholder components.
   17. Ensure both iOS and Android support.
   18. Ensure light and dark mode.
   19. Ensure accessibility.
   20. Ensure loading, empty and error states.


# 30. FINAL CLAUDE COMMAND

Redesign and implement every Curricula mobile screen described in this document.

Do not only redesign the Home, Store and Dashboard screens.

Every authentication, student, commerce, order, account, admin, inventory, academic-structure, user-
management, broadcast, security, support, legal, loading, error and empty-state screen must follow the
same complete design system.

Do not add random UI to make pages look busy.

Do not generate a generic AI-designed application.

Treat every screen as part of one connected mobile product.

The application must look modern, beautiful, professional, accessible and production-ready.

It must feel deliberately designed by senior mobile product designers and built by senior React Native
engineers.

The final result must be able to compete visually and functionally with modern production mobile
applications.
