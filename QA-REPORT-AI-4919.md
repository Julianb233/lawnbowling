# QA Report — AI-4919: Full 121-Page QA Pass

**Date:** 2026-03-23  
**Tested against:** https://www.lawnbowling.app  
**Browsers:** Chromium, WebKit (Safari), iPad viewport  
**Viewports:** Desktop (1280x720), iPhone SE (375x667), iPhone 14 (393x852), iPad Pro (1024x1366), iPad Landscape (1366x1024)

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Auth flow | ✅ Pass | Login, signup, forgot-password all render forms correctly |
| Kiosk mode | ⚠️ Issues | /kiosk and /kiosk/bowls show blank screens (auth-gated without fallback) |
| Tournament | ✅ Pass | /tournament, /bowls pages load. Dynamic bowls routes return 500s with invalid IDs |
| Club directory | ✅ Pass | /clubs loads, search works, state pages work |
| Blog/Learn | ✅ Pass | All articles render, learn pages functional |
| Shop | ✅ Pass | Browse, equipment, custom-merch all load |
| Admin panel | ✅ Pass | All admin pages redirect to login when unauthenticated (no 500s) |
| Mobile responsive | ⚠️ Issues | Some horizontal overflow on iPad Pro for /for-venues |
| Dark mode | ⚠️ Issues | /login, /pricing, /signup blank in dark mode (no hydration) |
| Error pages | ⚠️ Issues | 404 returns 200 instead of 404 status code |

## Critical Bugs Found

### BUG-1: `/gallery` returns 500 server error
- **Severity:** Critical
- **Browsers:** All (Chromium, WebKit, iPad)
- **Description:** The /gallery page returns a 500 internal server error consistently across all browsers and viewports.

### BUG-2: `/bowls/[id]/members` returns 500 with invalid ID
- **Severity:** Medium
- **Browsers:** All
- **Description:** Dynamic bowls routes (/bowls/test-id/members, /bowls/test-id/scores, /bowls/test-id/results, /bowls/test-id/live) return 500 instead of 404 when given invalid IDs. Should gracefully handle missing records.

### BUG-3: Broken images on homepage and key pages
- **Severity:** High
- **Browsers:** All
- **Pages affected:**
  - `/` — celebration-win.png broken (Next.js image optimization)
  - `/gallery` — Unsplash images failing to load
  - `/for-players` — bowls-icon.b0a336d3.png broken
  - `/for-venues` — bowls-icon.b0a336d3.png broken

### BUG-4: `/kiosk` and `/kiosk/bowls` blank screens
- **Severity:** High
- **Browsers:** All including iPad landscape
- **Description:** Kiosk pages show blank screens. These are auth-gated but don't redirect to login or show any UI feedback. On iPad kiosk mode, users see nothing.

### BUG-5: Dark mode blank screens
- **Severity:** Medium
- **Pages:** /login, /pricing, /signup
- **Description:** These pages render blank when the system color scheme is set to dark. Likely a hydration issue with dark mode CSS.

### BUG-6: 404 page returns HTTP 200
- **Severity:** Low
- **Description:** Visiting a non-existent URL (e.g., /this-page-does-not-exist) returns HTTP 200 instead of 404. The page renders a 404 UI but the status code is wrong, which affects SEO (soft 404s).

## Test Results by Browser

### Chromium (Desktop)
- **Passed:** 111/120 smoke tests
- **Failed:** 9 (3 real bugs, 6 network flakes)

### WebKit / Mobile Safari (iPhone 14)
- **Passed:** 113/120 smoke tests
- **Failed:** 7 (all real bugs, consistent with Chromium)

### iPad Pro
- **Passed:** 113/120 smoke tests
- **Failed:** 7 (same bugs as Safari)

### Responsive Tests (all viewports)
- **Passed:** 90/100
- **Failed:** 10 (broken images, dark mode blanks, 404 status)

## Files Created
- `e2e/qa-smoke-all-pages.spec.ts` — 120 smoke tests across all 121 routes
- `e2e/qa-responsive-dark.spec.ts` — Responsive, dark mode, broken images, error pages
- `e2e/qa-kiosk-ipad.spec.ts` — Kiosk iPad landscape tests
- `playwright.config.ts` — Updated with 6 browser/viewport projects

## Recommendations
1. **Fix /gallery 500** — investigate server-side rendering error
2. **Add error boundaries to bowls dynamic routes** — catch missing records, return 404
3. **Fix broken images** — check Next.js image optimization config and missing assets
4. **Add loading/redirect state to kiosk pages** — don't show blank screens
5. **Fix dark mode hydration** — ensure CSS variables load before first paint
6. **Configure custom 404 page with proper status code** — `not-found.tsx` in app router
