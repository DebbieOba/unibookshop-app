# CURRICULA — Design System

# Implementation Spec for `src/theme.ts`

---

## Contents

1. Overview
2. Color Tokens
3. Typography
4. Spacing Scale
5. Corner Radius Tokens
6. Combined `Theme` Type & Export
7. Component Style Guidelines
8. Reusable Component Inventory
9. Icons & Imagery
10. Accessibility Notes

---

# 1. Overview

`project.md` §4 defines the visual language (dark theme, green primary, purple admin accent,
orange warning) and states tokens live in `src/theme.ts`. This doc turns that into an
implementation spec for that single file, per `frontend-architecture.md`'s folder structure —
**one file, all tokens**, exactly as `project.md` specifies: no `theme/` folder split across
`colors.ts`/`typography.ts`/etc. Everything below (colors, typography, spacing, radii, the
combined `Theme` type) is a section of the same `src/theme.ts`.

- **Light mode is the default; dark mode is a full second palette.** `theme.ts` exports
  `buildTheme(mode)` rather than a single static object; `useTheme()` reads the active mode from
  `themeStore` (zustand) and returns the corresponding built theme. The Settings screen exposes
  a Light/Dark toggle; the choice persists via `secureStorage`.
- **Consumption pattern:** plain `StyleSheet.create` fed by the theme object via the `useTheme()`
  hook, per the confirmed decision — no NativeWind, no Restyle. Every screen/component imports
  tokens through the hook, never hardcodes a hex value, font size, or pixel spacing — this is the
  DRY foundation the rest of the app's styling relies on (`frontend-architecture.md` §2), and it's
  what makes the light/dark switch a contained change: no component needed to change when the
  second palette was added, only `theme.ts`, `themeStore.ts`, and `useTheme.ts` did.

---

# 2. Color Tokens

`src/theme.ts` exports two full token sets — `darkColors` and `lightColors` — of identical
shape (`ColorTokens`), selected by `buildTheme(mode)`. Both are chosen by color theory rather
than taste alone: navy (~220° on the color wheel) and gold (~40°) sit close to complementary,
which is what makes "blue and gold" read as premium/collegiate rather than clashing. In dark
mode, ice blue (an analogous tint of the navy) is the dominant interactive color; in light mode,
a dark slate navy fills that role instead (dark button on light surface, mirroring Linear/
Vercel-style light UIs). Gold is the sparing accent in both, roughly 10% of any given screen
(60-30-10 rule), reserved for secondary links/highlights on shared screens plus the full admin
journey.

### Dark mode (built first; unchanged since)

| Token | Hex | Usage |
|---|---|---|
| Background | `#0A1220` | Screen root background (navy) |
| Background Gradient End | `#101C38` | Second stop for full-screen gradients (Splash/Login) — same hue family as Background, adds depth without introducing a new color |
| Surface | `#101B2E` | Cards, sheets, tab bar |
| SurfaceAlt | `#16233A` | Inputs, nested cards, list-item backgrounds |
| Border | `#223252` | Dividers, input borders, card outlines |
| Primary | `#CCF2FA` | Student CTAs, active/selected states, success accents (ice blue) |
| Primary Dark | `#9FDCE8` | Pressed state of Primary buttons |
| Primary Tint | `#152A38` | Subtle highlighted backgrounds (e.g. selected chip) on student screens |
| Secondary | `#3B82F6` | Focused-input borders, link/info highlights — distinct from the ice-blue Primary |
| Secondary Tint | `#1B2C4D` | Subtle secondary-tinted backgrounds |
| Gold | `#D9B36C` | Brand accent on shared, role-agnostic screens (Splash wordmark accent, Login secondary links) |
| Gold Deep | `#8A6A2F` | Pressed/shadow state of Gold accents |
| Gold Tint | `#332A18` | Subtle gold-tinted backgrounds (glows, badges) |
| Admin Accent | `#C9A96E` | Admin CTAs, active/selected states in the Admin journey (muted gold) |
| Admin Tint | `#2E2A1C` | Subtle highlighted backgrounds on admin screens |
| Warning | `#F59E0B` | Pending/Processing status, non-destructive alerts |
| Warning Subtle | `#3D3017` | Warning-tinted backgrounds |
| Error | `#EF4444` | Rejected/Cancelled status, destructive actions, form validation errors |
| Error Subtle | `#3A1F22` | Error-tinted backgrounds |
| Success | `#61C99A` | Completed/positive states distinct from Primary |
| Success Subtle | `#15392B` | Success-tinted backgrounds |
| Info | `#7DB1FF` | Informational banners/callouts |
| Info Subtle | `#183258` | Info-tinted backgrounds |
| Primary Hover | `#B8E8F0` | Rarely used on mobile (no mouse hover) — kept for parity with the doc's 3-step primary/hover/pressed model |
| Border Strong | `#2E4666` | Emphasized dividers, e.g. between grouped sections |
| Divider | `#1B2A42` | Thin list separators — subtler than Border |
| Text Inverse | `#0A1220` | Text painted onto a filled accent (dark mode's Primary/Success/etc. fills are light-colored, so inverse text is dark, not white) |
| Text Disabled | `#627188` | Disabled control labels — distinct from Text Tertiary (still-active low-emphasis text) |
| Overlay | `rgba(0, 0, 0, 0.64)` | Modal/bottom-sheet backdrop |
| Text Primary | `#F2F6FA` | Headings, primary body copy |
| Text Secondary | `#93A4BD` | Secondary copy, descriptions |
| Text Tertiary | `#56637A` | Placeholder text, timestamps, least-emphasis labels |

### Light mode (default)

**Revision 2** — user supplied a 4-swatch Coolors palette (indigo hero + a 3-step sky-blue tint
ramp: `#5A55D4` / `#DCEEFC` / `#AFDBFB` / `#7DC8F2`) to replace the original slate/amber-derived
light palette (Revision 1, Tailwind-based). Primary/secondary/background/surfaceAlt/border are
built from those four swatches; text/warning/error/gold/adminAccent are untouched — this palette
is entirely blue-family with no warm color in it, so gold stays reserved for the admin journey
rather than being blended in here.

| Token | Hex | Usage |
|---|---|---|
| Background | `#F6FAFE` | Screen root background — a faint tint of the palette's ice-blue swatch, not flat white |
| Background Gradient End | `#EAF3FC` | Gradient second stop |
| Surface | `#FFFFFF` | Cards, sheets, tab bar |
| SurfaceAlt | `#EAF3FC` | Inputs, nested cards — the palette's ice-blue swatch, deepened slightly |
| Border | `#CFE6FA` | Dividers, input borders, card outlines |
| Primary | `#5A55D4` | The palette's indigo hero — main CTA/button fill |
| Primary Dark | `#4744B0` | Pressed state |
| Primary Tint | `#E3E1FA` | Selected chip backgrounds |
| Secondary | `#3AA8E8` | Between the palette's two mid-blue swatches — links/focus accents |
| Secondary Tint | `#E3F4FE` | Subtle secondary-tinted backgrounds |
| Gold | `#FBBF24` | Brand accent on shared screens (amber-400, unchanged from Revision 1) |
| Gold Deep | `#B45309` | Pressed/shadow state (amber-700) |
| Gold Tint | `#FEF3C7` | Subtle gold-tinted backgrounds (amber-100) |
| Admin Accent | `#B45309` | Deeper than Gold, for AA text contrast on white at small sizes |
| Admin Tint | `#FEF3C7` | Subtle highlighted backgrounds on admin screens |
| Warning | `#F59E0B` | Unchanged — already works on white |
| Warning Subtle | `#FFF3D6` | Warning-tinted backgrounds |
| Error | `#EF4444` | Unchanged — already works on white |
| Error Subtle | `#FDECEE` | Error-tinted backgrounds |
| Success | `#16865A` | Completed/positive states distinct from Primary |
| Success Subtle | `#E7F7F0` | Success-tinted backgrounds |
| Info | `#246BCE` | Informational banners/callouts |
| Info Subtle | `#EAF2FE` | Info-tinted backgrounds |
| Primary Hover | `#4F4AC0` | Rarely used on mobile (no mouse hover) — kept for parity with the doc's 3-step primary/hover/pressed model |
| Border Strong | `#B8D4EC` | Emphasized dividers, e.g. between grouped sections |
| Divider | `#E4EEF9` | Thin list separators — subtler than Border |
| Text Inverse | `#FFFFFF` | Text painted onto a filled accent (Primary/Success/etc. fills are dark- or mid-toned here, so inverse text is white) |
| Text Disabled | `#A7AFBC` | Disabled control labels — distinct from Text Tertiary (still-active low-emphasis text) |
| Overlay | `rgba(15, 23, 42, 0.48)` | Modal/bottom-sheet backdrop |
| Text Primary | `#111827` | Headings, primary body copy (gray-900) |
| Text Secondary | `#475569` | Secondary copy, descriptions (slate-600) |
| Text Tertiary | `#94A3B8` | Placeholder text, timestamps (slate-400) |

Rule of thumb: **Primary vs Admin Accent is the one branch every component needs to respect** —
any component rendered in both journeys (Button, Chip, StatusPill selection state) must accept
a `variant: 'student' | 'admin'` (or read the current journey from context) rather than
hardcoding a color. `Gold` is distinct from `Admin Accent`: same family, but used sparingly on
screens that exist before role is known (Splash, Login, Onboarding). `Secondary` exists
alongside `Primary` specifically to give the user-specified blue-800 a real purpose rather than
dropping it — used for focus states and link-style highlights in both modes.

---

# 3. Typography

**Typeface: DM Sans** (`@expo-google-fonts/dm-sans`, loaded in `App.tsx` via `useFonts` —
rendering is gated behind `fontsLoaded` since nothing can lay out correctly with the font
family missing). Custom fonts are selected by exact family name per weight, not synthesized
from a numeric `fontWeight` the way system fonts are, so `theme.ts` exports a `fontFamily` map
(`regular`/`medium`/`semiBold`/`bold` → `DMSans_400Regular`/`DMSans_500Medium`/
`DMSans_600SemiBold`/`DMSans_700Bold`) and **no component may set a bare `fontWeight` style** —
it will be silently ignored. Use `<AppText weight="bold">` instead (see below).

`src/theme.ts` exports a `createTypography(colors)` function returning 12 concrete token
objects (`fontSize`, `lineHeight`, `fontFamily`, `color` default), covering `CLAUDE_DESIGN_SYSTEM.md`'s
full scale under the existing key names (no rename — see the Phase A token-naming decision):

| Variant | Size | Line height | Weight | Color |
|---|---|---|---|---|
| `display` | 32pt | 38 | Bold | Text Primary |
| `title` (≈ Heading 1) | 28pt | 34 | Bold | Text Primary |
| `heading2` | 24pt | 30 | Bold | Text Primary |
| `heading3` | 20pt | 26 | SemiBold | Text Primary |
| `sectionHeader` (≈ Section Title) | 18pt | 24 | SemiBold | Text Primary |
| `bodyLarge` | 16pt | 24 | Regular | Text Primary |
| `body` | 14pt | 21 | Regular | Text Primary |
| `bodyMedium` | 14pt | 21 | Medium | Text Primary |
| `label` | 12pt | 17 | Regular | Text Secondary |
| `caption` | 11pt | 15 | Regular | Text Tertiary |
| `priceLarge` | 22pt | 28 | Bold | Primary |
| `price` | 18pt | 22 | Bold | Primary |

An `<AppText variant="display" | "title" | "heading2" | "heading3" | "sectionHeader" |
"bodyLarge" | "body" | "bodyMedium" | "label" | "caption" | "priceLarge" | "price">` component
wraps RN's `Text` so screens never hand-roll `fontSize` inline — it's the single place that also
wires in dynamic font-scaling support (§10). It additionally accepts a `weight` prop
(`"regular" | "medium" | "semiBold" | "bold"`) for emphasis that overrides the variant's default
DM Sans weight — e.g. a `label`-variant piece of text that needs to read as a bold link.

---

# 4. Spacing Scale

`src/theme.ts` exports a `spacing` const naming `project.md`'s 4/8/12/16/24/32 scale:

| Name | Value |
|---|---|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 24 |
| `xxl` | 32 |

All margin/padding/gap values in the app come from this scale — no ad-hoc numbers in
`StyleSheet.create` calls.

---

# 5. Corner Radius Tokens

`src/theme.ts` exports a `radii` const:

| Name | Value | Applies to |
|---|---|---|
| `input` | 10px | Text inputs, buttons |
| `button` | 10px | Buttons |
| `card` | 14px | Cards, sheets, modals |
| `sheet` | 24px | Top corners of bottom sheets (e.g. `SearchableBottomSheet`) |
| `pill` | fully rounded (`999`) | Status pills, chips, badges |

---

# 6. Combined `Theme` Type & Export

The full `src/theme.ts` is one file, top to bottom: `darkColors`/`lightColors` (§2), a
`createTypography(colors)` function (typography bakes text color in, so it has to be built per
palette rather than defined statically), and `spacing`/`radii` (§4–§5, mode-independent):

```ts
// src/theme.ts

export type ThemeMode = 'light' | 'dark';

const darkColors: ColorTokens = { background: '#0A1220', surface: '#101B2E', /* … §2 */ };
const lightColors: ColorTokens = { background: '#F8FAFC', surface: '#FFFFFF', /* … §2 */ };

function createTypography(colors: ColorTokens) {
  return { title: { fontSize: 28, lineHeight: 34, fontFamily: fontFamily.bold, color: colors.textPrimary }, /* … §3, 12 variants */ };
}

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
const radii = { input: 10, button: 10, card: 14, sheet: 24, pill: 999 } as const;

export interface Theme {
  colors: ColorTokens;
  typography: ReturnType<typeof createTypography>;
  spacing: typeof spacing;
  radii: typeof radii;
}

export function buildTheme(mode: ThemeMode): Theme {
  const colors = mode === 'dark' ? darkColors : lightColors;
  return { colors, typography: createTypography(colors), spacing, radii };
}
```

`useTheme()` (`hooks/useTheme.ts`) reads `mode` from `themeStore` (zustand, `store/
themeStore.ts`) and returns `useMemo(() => buildTheme(mode), [mode])`. Every component consumes
tokens through this hook rather than importing `theme.ts` directly — that indirection is what
made the light-mode addition a contained change: `theme.ts`, `themeStore.ts`, and
`useTheme.ts` changed; no screen or component did. `themeStore`'s `mode` defaults to `'light'`
and is hydrated from `secureStorage` (`getThemeMode`/`setThemeMode`) by `RootNavigator` on boot,
gated behind the same splash-floor as onboarding so there's no flash of the wrong mode.

---

# 7. Component Style Guidelines

- **Buttons** — `radii.button` (10px), height by `size`: `small` 36px, `medium` 48px, `large`
  52px. `variant` picks the visual style (`primary` filled / `secondary` filled blue /
  `outline` bordered / `ghost` text-only with padding / `destructive` filled error / `text`
  inline link-style), independent of `tone` (`student` uses `colors.primary`, `admin` uses
  `colors.adminAccent` — only `primary`/`outline`/`ghost` read `tone`; `secondary`/`destructive`
  are tone-agnostic). Disabled state: `colors.surfaceAlt` background (or transparent for
  `outline`/`ghost`/`text`), `colors.textDisabled` label. Supports `isLoading` (spinner +
  optional `loadingLabel`) and an optional leading `icon`.
- **Cards** — `radii.card` (14px), `colors.surface` background, 1px `colors.border` stroke.
  Used for book cards, order summary cards, dashboard KPI tiles.
- **Inputs** — `radii.input` (10px), `colors.surfaceAlt` background, 1px `colors.border`
  stroke; on validation error, border becomes `colors.error` and a `label`-variant error
  message renders below in `colors.error`.
- **Status pills** — `radii.pill`, small `label`-variant text:
  - Processing → `colors.warning` background tint + text
  - Completed → `colors.primary` background tint + text
  - Cancelled → `colors.error` background tint + text
- **Notification badge** — small `pill`-radius count bubble, `colors.error` background (draws
  the eye), positioned on the Home bell icon and admin bottom-nav.
- **Stock badge** (Book Details) — `pill` radius; `colors.primary` for in-stock,
  `colors.warning` for low stock, `colors.error` for out of stock.

---

# 8. Reusable Component Inventory

Maps to `components/` in `frontend-architecture.md`:

| Component | Notes |
|---|---|
| `Button` | 6 `variant`s (primary/secondary/outline/ghost/destructive/text) × 3 `size`s × student/admin `tone`; `isLoading`/`loadingLabel`/leading `icon` (§7) |
| `IconButton` | for bell, back, filter icons |
| `Card` | base surface container used across Home/Store/Dashboard |
| `BookCard` | cover (Cloudinary thumb) + title + price (`price` typography) + stock badge |
| `Input` | boxed text input — label, helper text, error state, disabled, leading icon, trailing action slot (`InputTrailingIcon` helper for password-visibility-style toggles) |
| `SearchBar` | Store/Home search |
| `SearchableBottomSheet<T>` | generic searchable picker sheet (department/level selection) |
| `Chip` | Preferences interest chips, Store category filters |
| `StatusPill` | Order status rendering (§7); owns the `OrderStatus → label` map so callers never render a raw enum string, with an optional `label` override for reusing its color-coding elsewhere (e.g. stock badges) |
| `OrderCard` | order ref, date, status pill, item count, total (`price` typography), next-step caption, "View order" — optional `showCustomer` (admin variant) |
| `Badge` | generic count badge (notifications) |
| `Avatar` | user avatar, falls back to initials if no Cloudinary URL |
| `AvatarPicker` | tappable avatar picker — person-icon empty state + camera edit badge, used by profile/onboarding screens |
| `EmptyState` | icon + message + optional subtext + optional action (see `frontend-architecture.md` §13) |
| `ErrorState` | icon + message + retry action (default "Try again", `outline` variant) |
| `Skeleton` / `LoadingSpinner` | loading placeholders |
| `Toast` | transient success/error feedback (e.g. "Added to cart") |
| `AuthBackdrop` | Login/SignUp/CompleteProfile shell — full-bleed photo header (`assets/bg.png`), fading into a rounded-top sheet; see §9 |

---

# 9. Icons & Imagery

- **Icon set:** `@expo/vector-icons` (ships with Expo, zero extra native config needed even in
  the EAS custom dev client). Default size 24px; 20px for inline/label-adjacent icons.
- **Book covers:** rendered via Cloudinary URLs (see `frontend-architecture.md` §12) — grid
  thumbnails (Store, Home) request a smaller transformed size than the detail view (Book
  Details) using the same underlying asset.
- **Aspect ratio:** book covers use a consistent 2:3 portrait ratio across grid and detail
  layouts so `BookCard` doesn't need per-screen layout special-casing.
- **Onboarding illustrations:** 3 unDraw illustrations (MIT License —
  `github.com/cuuupid/undraw-illustrations`), stored as raw SVG strings in `src/assets/
  illustrations/onboarding.ts` and rendered via `react-native-svg`'s `SvgXml`. unDraw's
  signature accent purple (`#6c63ff`) is recolored to the brand's `gold` token; every other fill
  (skin tones, per-illustration decorative colors) is left as designed — full re-tinting would
  break the cohesive palette each illustration ships with. Static across light/dark mode; only
  the surrounding chrome (card background, text) adapts.
- **Auth screen photo (`assets/bg.png`):** a warm library/study-space photo behind Login/SignUp
  (`AuthBackdrop`, §8), occupying 45% of the screen (the sheet below is the other 55%) — no
  gradient tint over it, the photo needs to actually be visible. Full-bleed to the top edge
  (behind the status bar — `AuthBackdrop` forces `StatusBar style="light"` while focused);
  logo/wordmark legibility comes from a `textShadow` on the wordmark, not a scrim over the
  photo. Logo + wordmark sit in a solid light pill badge over the photo (not floating directly
  on it) — the logo mark is black (`assets/logo.png`), so the wordmark next to it is black too,
  both needing an opaque light backing to stay legible against the photo rather than a text
  shadow. The seam between photo and sheet is one large single-corner curve —
  `borderTopLeftRadius: SCREEN_WIDTH * 0.85` with `borderTopRightRadius: 0` on the sheet itself
  (a real circular arc, not a hand-tuned SVG path) — flush with the photo/sheet split for most of
  the width, sweeping down in one big arc only near the left edge, per the reference.

---

# 10. Accessibility Notes

- `Text Tertiary` (`#5C6862`) on `Background`/`Surface` is the lowest-contrast pairing in the
  palette — reserve it for genuinely low-emphasis text (timestamps, placeholders) and avoid it
  for anything conveying required information.
- Minimum touch target 44×44 for all interactive elements (buttons, icon buttons, list row
  taps), even where the visible tap area (e.g. a 24px icon) is smaller — pad the touchable
  bounds, not the icon.
- `AppText` respects the OS's dynamic font-scaling setting by default (no `allowFontScaling
  ={false}`), so `fontSize` tokens are treated as a baseline, not a hard cap.
