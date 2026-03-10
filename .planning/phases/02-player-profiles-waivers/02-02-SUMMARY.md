# Phase 2 Plan 02: Liability Waiver Flow, Admin View, DEI Integration Summary

## One-liner
Waiver signing with IP/UA audit trail, cookie-based middleware gating, admin waiver viewer with pagination, configurable waiver templates, and DEI insurance offer integration.

## Status: COMPLETE

## Requirements Verified

| Req ID | Requirement | Status | Evidence |
|--------|------------|--------|----------|
| WAIV-01 | Digital liability waiver required before playing | PASS | Middleware checks `pap_has_waiver` cookie (02-01); sign route sets cookie after signing |
| WAIV-02 | Checkbox acceptance + timestamp + IP logging | PASS | `WaiverForm.tsx` Radix checkbox; `POST /api/waiver/sign` captures IP (x-forwarded-for), user-agent, timestamp |
| WAIV-03 | Waiver stored in DB with audit trail | PASS | `createWaiver()` in `waivers.ts` stores player_id, waiver_text, accepted, ip_address, user_agent, signed_at |
| WAIV-04 | Admin can view all signed waivers | PASS | `/admin/waivers` with AdminWaiversClient table showing player name, date, IP, user agent, search, pagination |
| WAIV-05 | Waiver text configurable per venue | PASS | Admin venue page has Waiver Text section; `waiver_templates` table with CRUD via `/api/admin/waiver-template` |
| INSR-01 | After waiver, user offered optional event insurance | PASS | `InsuranceOffer` component appears as step 3 in SetupFlowClient |
| INSR-02 | DEI microsite linked for insurance purchase | PASS | Links to `https://dailyeventinsurance.com` with target="_blank" |
| INSR-03 | Insurance status visible on player profile | PASS | `ShieldCheck` (green) / `Shield` (gray) icons in `ProfileCard.tsx` and `/profile/[id]/page.tsx` |

## Tasks Completed

### Task 1: Waiver API, configurable text, and cookie gating
**Commit:** `8f77377`

**Changes:**
- `src/app/api/waiver/sign/route.ts` -- Added `pap_has_waiver` cookie (httpOnly, 1yr, secure in prod) after successful waiver creation
- `src/app/admin/venue/page.tsx` -- Added Waiver Text section with title/body inputs, separate save handler, loading state
- `src/app/api/admin/waiver-template/route.ts` -- NEW GET/PUT endpoints for admin waiver template management with isAdmin() auth

**Already complete (no changes needed):**
- `src/lib/db/waivers.ts` -- createWaiver, getWaiverByPlayerId, listWaivers all functional
- `src/lib/db/venues.ts` -- getVenue, updateVenue functional
- `src/lib/db/waiver-templates.ts` -- Full CRUD with active template management
- `src/app/api/waiver/status/[playerId]/route.ts` -- GET handler with owner/admin access control
- `src/app/api/waiver/template/route.ts` -- Public template endpoint for setup flow

### Task 2: Admin waiver view and DEI insurance integration
**Commit:** `93d278f`

**Changes:**
- `src/app/admin/waivers/page.tsx` -- Replaced inline admin check with `requireAdmin()` from `@/lib/auth/admin` for consistency
- `src/app/admin/waivers/AdminWaiversClient.tsx` -- Added Load More pagination with offset tracking, "Showing X of Y waivers" counter

**Already complete (no changes needed):**
- `src/app/api/admin/waivers/route.ts` -- GET with isAdmin(), listWaivers() with limit/offset
- `src/app/api/insurance/status/route.ts` -- POST to update player insurance_status
- `src/components/insurance/InsuranceOffer.tsx` -- DEI link, "Get Coverage" button, "Maybe Later" dismiss
- `src/components/waiver/WaiverForm.tsx` -- Radix checkbox, scrollable waiver text, submit handling
- `src/components/waiver/WaiverStatus.tsx` -- Green signed / yellow unsigned states
- `src/components/profile/ProfileCard.tsx` -- Shield icons for insurance status

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Admin waiver template API endpoint**
- **Found during:** Task 1
- **Issue:** Plan specified adding waiver text to venue settings, but the codebase already uses a separate `waiver_templates` table with full CRUD. No admin API existed for managing templates from the venue settings page.
- **Fix:** Created `/api/admin/waiver-template/route.ts` with GET/PUT endpoints instead of modifying the venue API
- **Files created:** `src/app/api/admin/waiver-template/route.ts`
- **Commit:** `8f77377`

## Key Architecture Notes

- **Waiver system uses `waiver_templates` table** (not a `waiver_text` column on venues). Templates have title, body, is_active flag, and venue_id. Only one active template per venue.
- **Cookie `pap_has_waiver`** is set httpOnly with 1-year expiry. Middleware from 02-01 checks this cookie to skip DB lookups for waiver status.
- **Admin auth pattern:** Server components use `requireAdmin()` (redirects). API routes use `isAdmin(userId)` (returns boolean). Both check `players.role = 'admin'`.

## Files Modified

| File | Change |
|------|--------|
| `src/app/api/waiver/sign/route.ts` | Added pap_has_waiver cookie on successful sign |
| `src/app/admin/venue/page.tsx` | Added waiver text configuration section |
| `src/app/api/admin/waiver-template/route.ts` | NEW - Admin waiver template CRUD |
| `src/app/admin/waivers/page.tsx` | Simplified to use requireAdmin() |
| `src/app/admin/waivers/AdminWaiversClient.tsx` | Added pagination with Load More |
