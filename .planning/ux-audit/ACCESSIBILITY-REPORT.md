# Accessibility & Performance Audit Report

**App:** LawnBowl (pick-a-partner)
**Target Users:** 60-85 year olds
**Date:** 2026-03-17
**Auditor:** Automated code analysis

---

## Executive Summary

The app has a strong foundation with some excellent accessibility decisions (global 44px min touch targets, `:focus-visible` styles, kiosk-mode design tokens for elderly users). However, there are significant issues with small font sizes (793 instances of `text-xs`), widespread use of 10-11px text, missing loading states on 37 of 39 pages, heavy reliance on raw `<img>` tags instead of Next.js `<Image>`, and inconsistent ARIA labeling. For a 60-85 year old audience, these issues need to be addressed.

**Severity Scale:** CRITICAL / HIGH / MEDIUM / LOW

---

## 1. Color Contrast

### Findings

| Combination | Foreground | Background | Contrast Ratio | WCAG AA (4.5:1) | Verdict |
|---|---|---|---|---|---|
| Body text | `#3D5A3E` | `#FEFCF9` | ~7.1:1 | PASS | Good |
| Heading text | `#0A2E12` | `#FEFCF9` | ~14.5:1 | PASS | Excellent |
| Button text | `#FFFFFF` | `#1B5E20` | ~7.8:1 | PASS | Good |
| Placeholder text | `#3D5A3E` at 60% opacity | `#FEFCF9` | ~3.5:1 | FAIL | Below AA for body text |

### Low-Contrast Patterns Found

- **Severity: MEDIUM** - `placeholder:text-[#3D5A3E]/60` used across all form inputs (contact, signup, onboarding, club settings, admin pages). At 60% opacity the placeholder text drops below WCAG AA 4.5:1 ratio. While placeholders are not required to meet contrast minimums per WCAG 2.1, for elderly users with reduced vision, low-contrast placeholders are a usability concern.

- **Severity: LOW** - `text-gray-400` found in 2 locations:
  - `src/app/shop/checkout/page.tsx:14` (empty state text)
  - `sites/lawnbowl-camp/src/app/page.tsx` (marketing site, not main app)

- **Severity: LOW** - `text-gray-300` found in 1 location:
  - `src/app/shop/checkout/CheckoutPlaceholder.tsx:93` (icon color)

- **Severity: LOW** - `opacity-50` used only on disabled buttons (appropriate) and 2 non-disabled contexts:
  - `src/components/push/PushNotificationPrompt.tsx:83` (subscribing state)
  - `src/app/clubs/settings/page.tsx:537` (cancelling state)

**Overall contrast verdict:** The core color palette is well-chosen for elderly users. Primary text combinations all pass WCAG AA comfortably. The main concern is placeholder text opacity.

---

## 2. Font Sizes

### Severity: HIGH

This is the most significant accessibility issue in the codebase for the target demographic.

**`text-xs` (12px) usage: 793 instances** across the entire `src/` directory.

Top offending files by `text-xs` count:
- `src/app/bowls/[id]/draw-sheet/page.tsx` - 24 instances
- `src/app/bowls/[id]/scores/page.tsx` - 20 instances
- `src/app/bowls/[id]/members/page.tsx` - 17 instances
- `src/app/clubs/page.tsx` - 15 instances
- `src/app/clubs/[state]/[slug]/admin/page.tsx` - 14 instances
- `src/app/clubs/dashboard/page.tsx` - 13 instances
- `src/app/pricing/ClubPricingClient.tsx` - 13 instances
- `src/app/clubs/onboard/page.tsx` - 11 instances

**Explicit sub-12px text found (20+ instances):**

| Size | File | Element | Severity |
|---|---|---|---|
| `text-[10px]` | `ActiveMatchCard.tsx:142` | Match status text | CRITICAL |
| `text-[10px]` | `PeakHoursGrid.tsx:46,67` | Hour/day labels | HIGH |
| `text-[10px]` | `ClubAffiliations.tsx:226` | Role badges | HIGH |
| `text-[10px]` | `Endorsements.tsx:121` | Count labels | HIGH |
| `text-[10px]` | `AchievementBadges.tsx:34` | Badge names | HIGH |
| `text-[10px]` | `NotificationCenter.tsx:150` | Notification count | MEDIUM |
| `text-[10px]` | `Leaderboard.tsx` (6 instances) | Stat labels (ELO, Games, Wins, etc.) | HIGH |
| `text-[11px]` | `BottomNav.tsx:40` | Navigation labels | CRITICAL |
| `text-[11px]` | `NotificationBellNav.tsx:44` | Nav label | CRITICAL |
| `text-[11px]` | `AvailabilitySchedule.tsx:159,170` | Day/time labels | HIGH |
| `text-[11px]` | `ProductCard.tsx:26` | Product badges | MEDIUM |

**Recommendation:** For users aged 60-85:
- Minimum body text: 16px (`text-base`)
- Minimum secondary/label text: 14px (`text-sm`)
- 12px (`text-xs`) acceptable ONLY for purely decorative or non-essential metadata
- 10-11px text should be eliminated entirely

The `text-[11px]` on `BottomNav` and `NotificationBellNav` is especially critical since these are primary navigation elements used on every page.

---

## 3. Touch Targets

### Severity: LOW (well-handled globally)

**Positive findings:**
- Global CSS at `globals.css:92-102` sets `min-height: 44px; min-width: 44px` on all `button`, `input`, `select`, `textarea`, `[role="button"]`, `[role="tab"]`, `[role="checkbox"]`, `[role="radio"]` elements
- Kiosk mode increases this to 56px minimum (`--kiosk-touch-target-min: 56px`)
- `touch-action: manipulation` applied globally to buttons and links
- Many buttons explicitly include `min-h-[44px]` as a safety measure

**Remaining concerns:**
- **MEDIUM:** Inline text links (e.g., "Resend code" on signup, "forgot password" links) rely only on text size for tap target. No explicit padding is applied. Example: `src/app/signup/page.tsx:382` - "Resend code" link with `text-sm` and no padding.
- **LOW:** Letter filter buttons in the members page (`src/app/bowls/[id]/members/page.tsx`) are individual letter buttons that may be crowded on smaller screens.

---

## 4. Focus Indicators

### Severity: LOW (well-handled)

**Positive findings:**
- Global `:focus-visible` style defined at `globals.css:110-113`:
  ```css
  :focus-visible {
    outline: 3px solid #0D47A1;
    outline-offset: 2px;
  }
  ```
- Dark mode override at line 510-512 changes to `#4ade80` (green)
- Kiosk mode has dedicated focus tokens: `--kiosk-focus-outline: 3px solid #0D47A1`
- Many individual form inputs also define `focus:ring-2 focus:ring-[#1B5E20]/20` styles

**Concern:**
- **LOW:** The `focus:ring-[#1B5E20]/20` (20% opacity green ring) may be too subtle for elderly users to notice. The global `:focus-visible` outline is strong, but custom focus rings on inputs override it with a much lighter indicator.

---

## 5. Alt Text

### Severity: MEDIUM

**Image tag counts:**
- Raw `<img>` tags: **17 instances**
- Next.js `<Image>` component: **5 instances**

**Images with empty `alt=""`:** 13 instances found across:
- `src/app/teams/[id]/page.tsx` (2 instances) - player avatars
- `src/components/clubs/ClubMembershipManager.tsx` - member avatars
- `src/components/teams/TeamRoster.tsx` - player avatars
- `src/components/teams/TeamPicker.tsx` (3 instances)
- `src/components/teams/TeamChat.tsx` - sender avatars
- `src/components/stats/MatchHistory.tsx` - player avatars
- `src/components/stats/MatchHistoryDetail.tsx` - player avatar
- `src/components/stats/Leaderboard.tsx` (3 instances) - player avatars

**Verdict:** All images with `alt=""` are avatar/profile images where the user's name is displayed adjacently. Using `alt=""` for decorative avatars is actually correct per WCAG (the name is conveyed via text, not the image). However, for screen reader users, adding `alt={player.display_name}` would provide a richer experience.

**No `<img>` tags found missing the `alt` attribute entirely** -- all have at least `alt=""`.

---

## 6. ARIA Labels

### Severity: MEDIUM

**Total `aria-label` attributes found:** 110 across the codebase
**Total `<button>` elements found:** 479
**Buttons with adjacent `aria-label`:** Difficult to count exactly due to multi-line patterns, but aria-labels are concentrated in specific components.

**Well-labeled areas:**
- Cart drawer buttons (open, close, increase, decrease, remove)
- Admin navigation
- Member management (edit, promote, filter)
- Blog sharing buttons
- Onboarding wizard (remove green, remove member)

**Gaps (icon-only buttons without aria-label):**
- `src/components/admin/ExportButton.tsx` - has an SVG icon + text, acceptable
- Back arrow buttons in several pages use icon-only patterns but many do include aria-label

**Recommendation:** Audit all icon-only buttons systematically. With 479 buttons and only ~110 aria-labels, there are likely icon-only buttons without labels, especially in newer components.

---

## 7. Form Labels

### Severity: MEDIUM

**Positive findings:**
- Most forms use `<label>` elements (60+ instances found)
- `htmlFor` attribute used in key forms: signup, login, onboarding wizard, club settings, waiver forms, notification settings, profile settings

**Gaps:**
- **Contact page** (`src/app/contact/page.tsx`): Labels exist but some lack `htmlFor` binding
- **Club onboard page** (`src/app/clubs/onboard/page.tsx`): Labels use `flex` wrapper pattern but not all have `htmlFor`
- **Club manage page** (`src/app/clubs/manage/page.tsx`): No `htmlFor` on social media URL inputs, description textarea
- **Tournament page** (`src/app/tournament/[id]/page.tsx`): Score input placeholder="e.g. 21-15" with label but no `htmlFor`
- **Admin branding** (`src/app/admin/branding/page.tsx`): Labels present but no `htmlFor` on any inputs
- **ClubEventCalendar** (`src/components/clubs/ClubEventCalendar.tsx`): Labels use `text-xs` class and lack `htmlFor`

**Recommendation:** Add `htmlFor` to all label elements and corresponding `id` to inputs. For elderly users, being able to click the label to focus the input is important for usability.

---

## 8. Bundle Size

### Severity: MEDIUM

| Dependency | Disk Size | Estimated Bundle Impact | Notes |
|---|---|---|---|
| `@sentry/nextjs` | 55 MB | ~50-80 KB gzipped | Heavy but provides error monitoring. Ensure tree-shaking is configured. |
| `framer-motion` | 5.7 MB | ~30-40 KB gzipped | Used for animations. Consider if all animations are necessary for elderly users who may prefer reduced motion. |
| `leaflet` + `leaflet.markercluster` | 3.9 MB+ | ~40 KB gzipped | Map functionality. Should be lazy-loaded (only needed on club directory page). |
| `@stripe/stripe-js` | 1.3 MB | ~30 KB gzipped (loaded async) | Payment processing. Stripe.js loads async by design. |
| `@radix-ui/*` (7 packages) | Variable | ~15-25 KB total gzipped | Well tree-shaken, reasonable. |
| `qrcode` | ~500 KB | ~10 KB gzipped | QR code generation. Should be lazy-loaded. |

**Recommendations:**
- Verify `leaflet` is dynamically imported (not in initial bundle)
- Verify `framer-motion` respects `prefers-reduced-motion` media query
- Ensure Sentry is not capturing excessive replay data on slow connections

---

## 9. Image Optimization

### Severity: HIGH

**Raw `<img>` vs Next.js `<Image>`:** 17 raw `<img>` tags vs only 5 `<Image>` components.

The app overwhelmingly uses raw `<img>` tags, missing out on Next.js automatic:
- WebP/AVIF conversion
- Responsive `srcset` generation
- Lazy loading
- Blur placeholder support
- Image size optimization

**Large unoptimized assets in `/public/images/`:**

| File | Size | Issue |
|---|---|---|
| `pickleball.mp4` | 9.9 MB | Video file, needs compression or streaming |
| `tennis.mp4` | 5.1 MB | Video file, needs compression or streaming |
| `football.mp4` | 3.3 MB | Video file, needs compression or streaming |
| `lawn-bowl-illustrated-icon-dark.png` | 1.1 MB | Logo - should be SVG or compressed PNG |
| `lawn-bowl-illustrated-icon.png` | 796 KB | Logo - should be SVG or compressed PNG |
| `lawn-bowl-illustrated-full.png` | 744 KB | Logo - should be SVG or compressed PNG |
| `community-bonding.png` | 560 KB | Should use WebP (192 KB WebP version exists!) |
| `clubhouse-golden.png` | 476 KB | Needs WebP conversion |
| `celebration-win.png` | 460 KB | Needs WebP conversion |
| `hero-wide.png` + variants | 448 KB each | Multiple hero images, all uncompressed PNG |

**Key concern:** `community-bonding.png` (560 KB) has a WebP version at 192 KB (66% smaller) already in the directory. This suggests WebP conversion was started but not applied universally.

**Recommendation:** Convert all PNG hero/marketing images to WebP, compress logos, and migrate all `<img>` tags to Next.js `<Image>` component for automatic optimization.

---

## 10. Loading States

### Severity: HIGH

**Pages with `loading.tsx`:** 2 out of 39 top-level pages
- `src/app/board/loading.tsx`
- `src/app/profile/loading.tsx`

**Pages WITHOUT `loading.tsx` (37 pages):**
- `/` (homepage)
- `/about`, `/blog`, `/contact`, `/events`, `/faq`
- `/login`, `/signup`, `/onboarding`
- `/bowls`, `/clubs`, `/teams`, `/tournament`, `/pennant`
- `/stats`, `/leaderboard`, `/match-history`
- `/kiosk`, `/tv`
- `/shop`, `/pricing`, `/insurance`
- `/settings`, `/activity`, `/chat`, `/friends`, `/favorites`
- `/gallery`, `/learn`, `/queue`, `/schedule`
- `/admin`, `/for-players`, `/for-venues`
- `/privacy`, `/terms`, `/offline`

**Inline loading patterns found:** Some pages implement their own loading states using conditional rendering (e.g., `animate-pulse` skeletons in `match-history/page.tsx`). A `Skeleton` component exists at `src/components/ui/Skeleton.tsx`.

**Recommendation:** For elderly users on potentially slower connections, every data-fetching page should have either a `loading.tsx` file (for Suspense boundaries) or prominent inline skeleton screens. The current 2/39 coverage is insufficient.

---

## 11. PWA Manifest

### Severity: LOW (well-configured)

**File:** `public/manifest.json`

**Positive findings:**
- `display: "standalone"` - correct for app-like experience
- `start_url: "/bowls"` - meaningful start page
- `orientation: "any"` - supports portrait and landscape
- Icons provided at: 152x152, 180x180, 192x192, 512x512, maskable 512x512
- Categories correctly set to `["sports", "social", "lifestyle"]`
- Service workers present: `public/sw.js`, `public/push-sw.js`
- Serwist (service worker toolkit) properly configured in dependencies

**Minor issues:**
- `screenshots: []` - empty array. Adding screenshots improves the PWA install prompt on Android.
- `id: "/bowls"` - using a path as ID works but a unique identifier string is recommended.

---

## Summary of Findings by Priority

### CRITICAL (fix immediately)
1. **10-11px text on primary navigation** (`BottomNav`, `NotificationBellNav`) - these are the most-used UI elements and unreadable for many elderly users
2. **10px text on active match cards** - game status is essential information

### HIGH (fix soon)
3. **793 instances of `text-xs` (12px)** across the app - too small for target demographic
4. **Raw `<img>` tags (17) vs `<Image>` (5)** - missing automatic optimization
5. **37 of 39 pages lack `loading.tsx`** - no loading feedback for users
6. **1.1 MB logo PNG** and other uncompressed images totaling ~18 MB in `/public/images/`

### MEDIUM
7. **Missing `htmlFor` on many labels** - reduces form usability
8. **Placeholder text at 60% opacity** - may be hard to read
9. **ARIA label coverage gaps** - 110 labels across 479 buttons
10. **Empty `alt=""` on player avatars** - screen reader experience could be richer
11. **Sentry at 55 MB** - verify tree-shaking and bundle impact

### LOW (nice to have)
12. **Focus ring opacity on custom inputs** - `ring-[#1B5E20]/20` may be too subtle
13. **PWA manifest missing screenshots**
14. **Inline text links without padding** for touch targets

---

## Recommended Next Steps

1. **Font size sweep:** Replace all `text-[10px]` and `text-[11px]` with minimum `text-sm` (14px). Audit all `text-xs` usage and upgrade non-decorative text to `text-sm` or `text-base`.
2. **Image migration:** Replace all `<img>` tags with Next.js `<Image>` and convert PNGs to WebP.
3. **Loading states:** Add `loading.tsx` skeleton screens to all data-fetching pages, reusing the existing `Skeleton` component.
4. **Form accessibility:** Add `htmlFor`/`id` bindings to all label/input pairs.
5. **ARIA audit:** Identify all icon-only buttons and add `aria-label` attributes.
