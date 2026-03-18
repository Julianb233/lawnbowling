# Code Quality & Build Audit Report

**Date:** 2026-03-17
**Branch:** `ralph/ux-club-director-500-members`
**Auditor:** Automated Claude audit

---

## 1. TypeScript Build Check

**Result: BUILD PASSES** -- `npx next build` completes successfully with zero TypeScript errors.

No type errors or build warnings detected. All 102 pages compile and render correctly.

---

## 2. Missing Pages / 404 Risk

**Result: ALL ROUTES HAVE VALID page.tsx WITH DEFAULT EXPORTS**

All 102 `page.tsx` files export a default component. No empty shells detected.

### Placeholder / "Coming Soon" Pages

| Severity | File | Note |
|----------|------|------|
| LOW | `src/app/shop/checkout/page.tsx` | Wraps `CheckoutPlaceholder` -- but this is a fully functional Stripe checkout, not a stub. Name is misleading but code is complete. |
| LOW | `src/app/signup/page.tsx:92` | Contains `// TODO: Supabase phone auth must be enabled in the dashboard for this to work.` -- phone auth may not work without Supabase config. |
| LOW | `src/app/pennant/admin/page.tsx:102` | Uses `venue_id: "00000000-0000-0000-0000-000000000000"` hardcoded placeholder UUID. |

---

## 3. Broken Imports

**Result: NO BROKEN IMPORTS DETECTED**

All `import` statements in page files resolve to existing modules. No dangling references found after multi-agent changes.

---

## 4. Inconsistent Styling

### 4A. `bg-white` on page-level containers (should be `bg-[#FEFCF9]`)

| Severity | File | Line | Element |
|----------|------|------|---------|
| MEDIUM | `src/app/match-history/page.tsx` | 27 | `<div className="min-h-screen bg-white ...">` |
| MEDIUM | `src/app/leaderboard/page.tsx` | 24 | `<div className="min-h-screen bg-white ...">` |
| MEDIUM | `src/app/stats/page.tsx` | 31 | `<div className="min-h-screen bg-white ...">` |
| MEDIUM | `src/app/learn/equipment/page.tsx` | 288 | `<div className="min-h-screen bg-white ...">` |
| MEDIUM | `src/app/learn/positions/page.tsx` | 164 | `<div className="min-h-screen bg-white ...">` |
| MEDIUM | `src/app/learn/lawn-bowling-vs-bocce/page.tsx` | 88 | `<div className="min-h-screen bg-white ...">` |
| MEDIUM | `src/app/learn/rules/page.tsx` | 37 | `<div className="min-h-screen bg-white ...">` |
| MEDIUM | `src/app/learn/glossary/page.tsx` | 36 | `<div className="min-h-screen bg-white ...">` |
| MEDIUM | `src/app/learn/formats/page.tsx` | 146 | `<div className="min-h-screen bg-white ...">` |

**Suggested fix:** Replace `bg-white` with `bg-[#FEFCF9]` on these page-level wrappers to match the warm off-white brand background.

### 4B. `bg-animated-gradient` (old pattern still in use)

| Severity | File | Line |
|----------|------|------|
| MEDIUM | `src/app/board/loading.tsx` | 5 |
| MEDIUM | `src/app/schedule/[id]/page.tsx` | 24 |
| MEDIUM | `src/app/profile/setup/SetupFlowClient.tsx` | 96, 115 |
| MEDIUM | `src/app/schedule/SchedulePageClient.tsx` | 26 |
| MEDIUM | `src/app/queue/QueuePageClient.tsx` | 29 |
| MEDIUM | `src/app/favorites/page.tsx` | 21 |
| MEDIUM | `src/app/friends/page.tsx` | 29 |

**Note:** `bg-animated-gradient` is defined in `globals.css` (lines 233, 503) so it does work, but these 7 pages use a different background style than the rest of the app which uses either `bg-[#FEFCF9]` or `bg-white`.

### 4C. Dark green backgrounds on non-TV/non-hero pages

No page-level dark green backgrounds (`bg-[#1B4D3E]`, `bg-green-900`, etc.) found outside of TV/hero contexts. Only a small `bg-emerald-900/40` badge on the homepage (appropriate for dark-mode variant).

**Result: PASS**

### 4D. Missing `font-display` on h1/h2 headings

| Severity | File | Lines | Details |
|----------|------|-------|---------|
| LOW | `src/app/match-history/page.tsx` | 38 | `<h1>` missing font-display |
| LOW | `src/app/leaderboard/page.tsx` | 29 | `<h1>` missing font-display |
| LOW | `src/app/admin/branding/page.tsx` | 43 | `<h1>` missing font-display |
| LOW | `src/app/admin/waiver-templates/page.tsx` | 116, 145 | `<h1>`, `<h2>` missing font-display |
| LOW | `src/app/admin/kiosk-settings/page.tsx` | 32, 88 | `<h1>`, `<h2>` missing font-display |
| LOW | `src/app/admin/venues/page.tsx` | 49, 53 | `<h1>`, `<h2>` missing font-display |
| LOW | `src/app/admin/page.tsx` | 82 | `<h1>` missing font-display |
| LOW | `src/app/bowls/page.tsx` | 120, 174, 187 | Multiple headings missing font-display |
| LOW | `src/app/favorites/page.tsx` | 24 | `<h1>` missing font-display |
| LOW | `src/app/friends/page.tsx` | 39 | `<h1>` missing font-display |
| LOW | `src/app/gallery/page.tsx` | 55, 114 | Headings missing font-display |
| LOW | `src/app/learn/page.tsx` | 172, 206, 246 | Headings missing font-display |
| LOW | `src/app/learn/equipment/page.tsx` | 311, 346, 405 | Headings missing font-display |
| LOW | `src/app/learn/positions/page.tsx` | 174, 187, 248, 343 | Headings missing font-display |
| LOW | `src/app/offline/page.tsx` | 24, 37 | Headings missing font-display |
| LOW | `src/app/pennant/page.tsx` | 58, 83 | Headings missing font-display |
| LOW | `src/app/privacy/page.tsx` | 18, 24+ | Multiple headings missing font-display |
| LOW | `src/app/stats/page.tsx` | 34, 56 | Headings missing font-display |
| LOW | `src/app/teams/page.tsx` | 11 | `<h1>` missing font-display |
| LOW | `src/app/terms/page.tsx` | 18, 24+ | Multiple headings missing font-display |
| LOW | `src/app/tournament/page.tsx` | 11 | `<h1>` missing font-display |
| LOW | `src/app/blog/page.tsx` | 48, 98, 134, 185 | Multiple headings missing font-display |

**Summary:** ~40+ headings across ~20 pages lack `font-display` / `fontFamily: "var(--font-display)"`. Pages that DO correctly use it include: `events/page.tsx`, `clubs/page.tsx`, `activity/page.tsx`, `clubs/manage/page.tsx`.

**Suggested fix:** Add `style={{ fontFamily: "var(--font-display)" }}` or `className="font-display"` to all `<h1>` and `<h2>` elements in page files.

### 4E. Buttons without `min-h-[44px]`

| Severity | Count | Details |
|----------|-------|---------|
| MEDIUM | ~30 buttons | Found across 30+ pages. Many interactive `<button>` elements lack the `min-h-[44px]` touch target size. |

**Key offenders (sample):**
- `src/app/clubs/page.tsx` lines 142, 145, 173, 189, 249
- `src/app/events/page.tsx` lines 291, 299, 330, 343, 488, 632
- `src/app/login/page.tsx` lines 320, 332, 412, 441, 504, 533, 553, 567
- `src/app/signup/page.tsx` (8 buttons)
- `src/app/settings/page.tsx` line 129
- `src/app/onboarding/page.tsx` lines 63, 118
- `src/app/gallery/page.tsx` lines 73, 89

**Note:** 69 `min-h-[44px]` usages exist across 22 pages, so this standard IS partially adopted. ~120 buttons lack it.

**Suggested fix:** Add `min-h-[44px]` to all interactive buttons to meet WCAG 2.5.8 touch target guidelines (44x44px minimum).

---

## 5. Auth Middleware Check

**File:** `src/lib/supabase/middleware.ts`

### Public Routes (no auth required):
- `/` (root)
- `/login`, `/signup`, `/auth/callback`, `/onboarding`, `/offline`
- `/insurance`, `/terms`, `/privacy`, `/contact`, `/about`, `/faq`
- `/for-venues`, `/for-players`, `/learn`
- `/checkin`, `/api/qr`
- `/clubs`, `/shop`, `/blog`, `/pricing`, `/bowls`
- `/gallery`, `/leaderboard`, `/tv`, `/kiosk`
- `/profile`
- `/sitemap.xml`, `/robots.txt`
- Various API routes

### Protected Routes (auth required):
- `/board`, `/stats`, `/chat`, `/friends`, `/favorites`, `/queue`
- `/match-history`, `/schedule`, `/teams`, `/settings`
- `/admin/*`, `/clubs/manage`, `/clubs/dashboard`, `/clubs/settings`
- `/pennant/*`

### Issues Found:

| Severity | Route | Issue |
|----------|-------|-------|
| HIGH | `/events` | **Protected but should be public.** Events page shows club tournaments, open days, etc. -- this is discovery/marketing content that should be publicly accessible for SEO and user acquisition. Currently redirects unauthenticated users to login. |
| MEDIUM | `/pennant` | Protected -- arguably should be public for spectators viewing pennant standings and fixtures. |
| MEDIUM | `/tournament` | Protected -- tournament brackets could be publicly viewable for spectators. |

**Suggested fix:** Add `/events`, `/pennant`, and `/tournament` to the `publicPaths` array in middleware.ts.

---

## 6. Component Consistency

### 6A. BottomNav in Authenticated Pages

| Severity | Route | Issue |
|----------|-------|-------|
| HIGH | `/favorites` (`src/app/favorites/page.tsx`) | **Missing BottomNav.** User has no way to navigate away except the "Back" link. |
| HIGH | `/settings` (`src/app/settings/page.tsx`) | **Missing BottomNav.** User must use browser back button or header back arrow. |

All other authenticated pages (board, bowls, chat, activity, stats, teams, friends, match-history, leaderboard, pennant, tournament, schedule, events) correctly include `<BottomNav />`.

### 6B. PublicNav Sign In Link

**Result: PASS** -- `src/components/PublicNav.tsx` includes a "Sign In" link on both desktop (line 91) and mobile menu (line 183).

---

## 7. Image/Asset Issues

**Result: ALL IMAGE REFERENCES RESOLVE**

Every `/images/*` path referenced in `src=` attributes across the app resolves to an existing file in `public/images/`. No broken image references detected.

Assets inventory:
- `public/images/` -- 38 files (hero images, social photos, sport images, logos)
- `public/images/logo/` -- 5 logo variants
- `public/icons/` -- 5 PWA icons (152, 180, 192, 512, maskable-512)
- `public/splash/` -- 2 splash screens (iPhone, iPad landscape)

---

## 8. SEO/Meta

### Pages WITH metadata (26 pages):
- All `/learn/*` subpages, `/about`, `/contact`, `/for-venues`, `/for-players`
- `/privacy`, `/terms`, `/faq`, `/insurance/*`
- `/clubs/[state]`, `/clubs/[state]/[slug]`
- `/blog`, `/blog/[slug]`, `/shop/*`
- `/activity` (has metadata)

### Pages WITHOUT metadata (76 pages):

| Severity | Route | Impact |
|----------|-------|--------|
| HIGH | `/` (homepage) | **Homepage has no page-level metadata.** Relies solely on root layout metadata (`title: "Lawnbowling"`). Should have rich og:image, description, keywords. |
| HIGH | `/login` | No meta title -- shows generic "Lawnbowling" |
| HIGH | `/signup` | No meta title |
| HIGH | `/clubs` (directory page) | No page-specific metadata despite being a key SEO page |
| HIGH | `/gallery` | Public page, no metadata |
| HIGH | `/pricing` | Public page, no metadata |
| HIGH | `/bowls` | Public page, no metadata |
| MEDIUM | `/profile/[id]` | Public profile pages lack metadata (could use generateMetadata for dynamic OG) |
| MEDIUM | `/tournament`, `/tournament/[id]` | Shareable content, no OG tags |
| MEDIUM | `/pennant/*` (all 5 pages) | No metadata |
| MEDIUM | `/events` | No metadata |
| LOW | `/board` | Authenticated page -- lower SEO priority |
| LOW | `/admin/*` (all 13 pages) | Admin pages -- low SEO priority but should have title for browser tabs |
| LOW | `/settings`, `/settings/notifications` | Authenticated, low priority |
| LOW | `/kiosk/*` (4 pages) | Kiosk mode, low priority |
| LOW | `/stats`, `/match-history`, `/leaderboard` | Authenticated pages |
| LOW | `/friends`, `/favorites`, `/queue`, `/chat` | Authenticated pages |
| LOW | `/teams/*`, `/schedule/*` | Authenticated pages |
| LOW | `/onboarding/*`, `/profile/setup` | Onboarding flows |
| LOW | `/offline` | PWA offline page |
| LOW | `/tv` | TV display mode |

**Root layout metadata** (`src/app/layout.tsx`):
- `title: "Lawnbowling"`
- `description: "The world's best lawn bowling app..."`
- No `og:image` in metadata (though `opengraph-image` route exists)

**Suggested fix:**
1. Add `metadata` or `generateMetadata` to ALL public-facing pages, especially homepage, clubs, gallery, pricing, bowls.
2. Add dynamic `generateMetadata` for `/profile/[id]`, `/tournament/[id]`, `/clubs/[state]/[slug]` to generate OG images with player/club names.
3. At minimum, add `title` metadata to all authenticated pages for proper browser tab labels.

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Build/TypeScript | 0 | 0 | 0 | 0 | 0 |
| Missing Pages | 0 | 0 | 0 | 0 | 0 |
| Broken Imports | 0 | 0 | 0 | 0 | 0 |
| Styling Consistency | 0 | 0 | ~18 | ~40+ | ~58 |
| Auth Middleware | 0 | 1 | 2 | 0 | 3 |
| Component Consistency | 0 | 2 | 0 | 0 | 2 |
| Image/Assets | 0 | 0 | 0 | 0 | 0 |
| SEO/Meta | 0 | 7 | 5 | ~64 | ~76 |
| **Totals** | **0** | **10** | **~25** | **~104** | **~139** |

### Top Priority Fixes

1. **HIGH** -- Add BottomNav to `/favorites` and `/settings` pages
2. **HIGH** -- Make `/events` route public in middleware (SEO + user acquisition)
3. **HIGH** -- Add metadata to homepage and key public pages (clubs, gallery, pricing, bowls, login, signup)
4. **MEDIUM** -- Replace `bg-white` with `bg-[#FEFCF9]` on 9 page-level containers
5. **MEDIUM** -- Add `min-h-[44px]` to ~120 buttons missing touch targets
6. **MEDIUM** -- Consider making `/pennant` and `/tournament` public for spectators
7. **LOW** -- Add `font-display` to ~40+ headings across 20 pages
8. **LOW** -- Standardize `bg-animated-gradient` usage vs `bg-[#FEFCF9]` across 7 pages
9. **LOW** -- Fix hardcoded placeholder UUID in pennant admin
10. **LOW** -- Add page titles to all authenticated pages for browser tab labels
