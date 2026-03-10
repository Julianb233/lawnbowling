# Production Smoke Test Report

**Date:** 2026-03-10
**URL:** https://pick-a-partner.vercel.app
**Linear:** AI-2113

## Summary

Validated critical user flows on production. Most flows work correctly. Found 1 critical bug affecting the profile pages.

## Results

### Public Pages (All PASS)

| Page | Status | Notes |
|------|--------|-------|
| Landing `/` | PASS | Hero, nav, CTAs, stats all render correctly |
| Login `/login` | PASS | Email/password form, magic link, error messages work |
| Signup `/signup` | PASS | Display name, email, password fields; account creation works |
| For Venues `/for-venues` | PASS | Pricing tiers, features, setup steps render |
| Learn `/learn` | PASS | 6 sport guides listed (Pickleball, Lawn Bowling, Tennis, Badminton, Racquetball, Flag Football) |
| FAQ `/faq` | PASS | 23 questions across 6 categories |
| Insurance `/insurance` | PASS | Coverage details, carriers, CTAs render |

### Authenticated Pages

| Page | Status | Notes |
|------|--------|-------|
| Board `/board` | PASS | Sport filters, check-in button, player cards, courts status, venue selector all work |
| Queue `/queue` | PASS | Shows queue status, link to board |
| Activity `/activity` | PASS | Shows real activity feed (check-ins, matches, joins) |
| Leaderboard `/leaderboard` | PASS | Sport filters work, empty state shows correctly |
| Kiosk `/kiosk` | PASS | Demo Venue, Kiosk Mode, Check In button, Board tab |
| **Profile `/profile`** | **FAIL** | Crashes with "Something went wrong" for authenticated users |
| **Profile Setup `/profile/setup`** | **FAIL** | Crashes with "Something went wrong" for new users |

### Auth Guard (PASS)

Protected pages (`/profile`, `/board`, `/kiosk`, `/leaderboard`) correctly redirect unauthenticated users to `/login`.

### Signup-to-Board Flow (PASS)

Full flow tested: signup with new account -> auto-redirect to `/board` -> board loads with venue data, sport filters, courts.

### Login Flow (PASS)

- Invalid credentials show clear error message ("Invalid login credentials")
- Valid credentials redirect to board
- Magic link option available

## Bugs Found

### BUG-1: Profile pages crash for all users (CRITICAL)

**Affected pages:** `/profile`, `/profile/setup`
**Severity:** Critical — blocks profile viewing, profile creation, and waiver signing
**Root cause:** Server-side `getPlayerByUserId()` throws on Supabase DB errors (likely RLS policy or table access issue). The error propagates to Next.js error boundary instead of redirecting gracefully.
**Impact:** Users cannot view or set up their profile, which blocks the waiver signing flow.
**Fix applied:** Wrapped DB calls in try/catch to handle errors gracefully — profile page redirects to setup on error, setup page continues with setup flow on error.

### BUG-2: Error boundary has no diagnostics (LOW)

**Affected:** Global error boundary (`src/app/error.tsx`)
**Severity:** Low — makes debugging production errors harder
**Fix applied:** Added `console.error` logging and error digest display for debugging.

## Flows Not Testable

- **Waiver signing:** Blocked by profile bug (profile page crashes before waiver UI renders)
- **Partner request:** No other available players on production to test with
- **Check-in via QR:** Requires physical kiosk/camera
- **Stripe checkout:** Would create real charges

## Recommendations

1. Run `npm run seed:demo` against production Supabase or verify RLS policies allow authenticated users to query `players` table
2. Verify the `players` table exists and has correct schema in production Supabase
3. After profile bug fix is deployed, re-test waiver signing flow
4. Consider adding a health-check API endpoint (`/api/health`) that validates DB connectivity
