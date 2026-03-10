# Phase 2 Task 02 Summary: Waivers, Insurance & Venue Templates

## Status: COMPLETE (gaps fixed)

## Requirements Verified

| Req ID | Requirement | Status | Evidence |
|--------|------------|--------|----------|
| WAIV-01 | Digital waiver before play | PASS | `WaiverForm.tsx` in setup flow step 2, checkbox required |
| WAIV-02 | Checkbox + timestamp + IP logging | PASS | `WaiverForm.tsx` checkbox, `POST /api/waiver/sign` captures `ip_address`, `user_agent`, `signed_at` |
| WAIV-03 | Waiver stored with audit trail | PASS | `waivers` table: `player_id`, `waiver_text`, `accepted`, `ip_address`, `user_agent`, `signed_at` |
| WAIV-04 | Admin can view all waivers | PASS | `/admin/waivers` page with searchable table showing player, date, IP, user agent |
| WAIV-05 | Waiver text configurable per venue | PASS (FIXED) | See "Gaps Fixed" below |
| INSR-01 | Insurance offer after waiver | PASS | `InsuranceOffer.tsx` in setup flow step 3 |
| INSR-02 | DEI microsite linked | PASS | Links to `https://dailyeventinsurance.com` with `target="_blank"` |
| INSR-03 | Insurance status on profile | PASS | `ShieldCheck`/`Shield` icons in `ProfileCard.tsx` and `/profile/[id]/page.tsx` |

## Gaps Found and Fixed

### GAP: WAIV-05 - Venue-configurable waiver text was not wired up

**Problem**: The `waiver_templates` table existed in the schema, and the `WaiverTemplate` type existed in `types.ts`, but:
1. No database query functions existed for waiver templates
2. No admin UI existed to manage templates
3. The waiver sign route used hardcoded `DEFAULT_WAIVER_TEXT` instead of pulling from venue template
4. The setup flow did not fetch the venue's custom waiver text

**Fix applied** (4 new files, 3 modified files):

#### New Files
1. **`src/lib/db/waiver-templates.ts`** - CRUD functions for waiver templates:
   - `getActiveWaiverTemplate(venueId?)` - fetch active template for a venue
   - `listWaiverTemplates(venueId)` - list all templates for a venue
   - `createWaiverTemplate(template)` - create new (deactivates others if active)
   - `updateWaiverTemplate(id, updates)` - update template (handles active toggle)

2. **`src/app/api/admin/waiver-templates/route.ts`** - Admin API for templates:
   - `GET` - list all templates for the venue
   - `POST` - create new template
   - `PUT` - update existing template
   - All endpoints require admin auth via `isAdmin()`

3. **`src/app/api/waiver/template/route.ts`** - Public API for active template:
   - `GET` - returns active template body + venue name (auth required)
   - Used by setup flow to fetch custom waiver text

4. **`src/app/admin/waiver-templates/page.tsx`** - Admin UI page:
   - List all templates with active indicator
   - Create new template form (title, body, active toggle)
   - Edit existing templates inline
   - Active template highlighted with green border

#### Modified Files
5. **`src/app/api/waiver/sign/route.ts`** - Now fetches active venue template:
   - Calls `getActiveWaiverTemplate(venue.id)` before creating waiver
   - Falls back to `DEFAULT_WAIVER_TEXT` if no template configured
   - Stores the actual text shown to user in the waiver record

6. **`src/app/profile/setup/SetupFlowClient.tsx`** - Now fetches venue template:
   - `useEffect` on mount fetches `/api/waiver/template`
   - Passes custom `waiverText` and `venueName` to `WaiverForm`
   - Falls back to WaiverForm's default text if fetch fails

7. **`src/app/admin/layout.tsx`** - Added "Waiver Templates" nav item

## Verification
- TypeScript: `npx tsc --noEmit` passes with zero errors
- Build: Next.js 16 Turbopack production build has a pre-existing ENOENT race condition unrelated to these changes (also fails on master)
- All new files follow existing patterns (Supabase client, admin auth, Radix UI)
