# Phase 5 Research: Court Management & Admin

## What Already Exists

Phase 5 has **extensive existing implementation**. This research catalogs what's built vs. what gaps remain against requirements MATCH-02 through MATCH-05 and ADMIN-01 through ADMIN-05.

### Court CRUD (ADMIN-02) -- MOSTLY COMPLETE
- **Admin page**: `src/app/admin/courts/page.tsx` -- client component with add/edit/delete UI
- **API route**: `src/app/api/admin/courts/route.ts` -- GET/POST/PUT/DELETE with admin auth
- **DB layer**: `src/lib/db/courts.ts` -- `listCourts()`, `createCourt()`, `updateCourt()`, `deleteCourt()`
- **Schema**: `courts` table with id, venue_id, name, sport, is_available, created_at
- **Gap**: No "lanes" concept separate from courts (roadmap mentions "courts and lanes" but schema treats them the same -- acceptable for v1)

### Court Assignment (MATCH-02) -- COMPLETE
- **Manual assign**: `assignCourtToMatch()` in `src/lib/db/courts.ts`
- **Auto assign**: `autoAssignCourt()` finds first available court for sport
- **API**: `src/app/api/matches/assign-court/route.ts` -- admin-only POST
- **UI**: `AssignCourtModal` component for manual selection
- **CourtStatusBoard** has `handleAssign` for auto-assigning queued matches

### Court Status Board (MATCH-03) -- COMPLETE
- **Component**: `src/components/courts/CourtStatusBoard.tsx`
- **Realtime**: Subscribes to postgres_changes on courts + matches tables
- **CourtCard**: Shows open/queued/playing status with color indicators
- **Player list**: Shows matched player names on each court

### Match Timer (MATCH-04) -- COMPLETE
- **Component**: `src/components/courts/MatchTimer.tsx`
- **Features**: Elapsed time counter, optional duration limit, overtime animation (red pulse)
- **Integration**: Used in CourtCard when match is playing

### Match Completion (MATCH-05) -- COMPLETE
- **Logic**: `completeMatch()` in `src/lib/db/courts.ts`
- **Auto-cascade**: Frees court, auto-assigns next queued match for same sport
- **API**: `src/app/api/matches/complete/route.ts` -- admin-only
- **UI**: CompleteMatchButton component + "End Match" in CourtCard

### Admin Panel Layout -- COMPLETE
- **Layout**: `src/app/admin/layout.tsx` with sidebar nav (Dashboard, Venue, Courts, Players, Waivers, Matches)
- **Auth guard**: `requireAdmin()` in layout
- **Dashboard**: `src/app/admin/page.tsx` with stat cards (players online, matches today, courts in use, total players)

### Venue Settings (ADMIN-01) -- COMPLETE
- **Page**: `src/app/admin/venue/page.tsx` -- name, address, timezone editing
- **API**: `src/app/api/admin/venue/route.ts` -- GET/PUT
- **DB**: `src/lib/db/venues.ts` -- `getVenue()`, `updateVenue()`

### Player Management (ADMIN-04 partial) -- COMPLETE
- **Page**: `src/app/admin/players/page.tsx` -- search, skill filter, role toggle
- **API**: `src/app/api/admin/players/route.ts` -- GET with search/filter, PUT for role

### Waiver Viewer (ADMIN-04 partial) -- COMPLETE
- **Page**: `src/app/admin/waivers/page.tsx` + `AdminWaiversClient`
- **API**: `src/app/api/admin/waivers/route.ts`

### Match History (ADMIN-04 partial) -- COMPLETE
- **Page**: `src/app/admin/matches/page.tsx` -- table with sport, players, court, status, duration, date
- **DB**: `listMatches()` in `src/lib/db/matches.ts`

### Sports Management (ADMIN-03) -- GAP
- **Schema**: `venues.sports text[]` column exists but no admin UI to manage it
- **Current state**: Sports are hardcoded in courts admin page: `["pickleball", "lawn_bowling", "tennis", "badminton", "table_tennis"]`
- **Need**: Admin page/section to add/remove sports available at the venue

### Empty Admin Pages -- GAP
- `src/app/admin/analytics/` -- directory exists but empty (no page.tsx)
- `src/app/admin/branding/` -- directory exists but empty
- `src/app/admin/reports/` -- directory exists but empty
- These are bonus features beyond v1 requirements but directories exist

### Manual Court Assignment (ADMIN-05) -- MOSTLY COMPLETE
- Assignment logic exists but admin UI for manually assigning/unassigning from admin panel (not just court board) could be more explicit
- CourtStatusBoard handles assign via button but is player-facing; admin needs direct control

## Gap Summary

| Requirement | Status | Gap |
|-------------|--------|-----|
| MATCH-02 | Complete | - |
| MATCH-03 | Complete | - |
| MATCH-04 | Complete | - |
| MATCH-05 | Complete | - |
| ADMIN-01 | Complete | - |
| ADMIN-02 | Complete | - |
| ADMIN-03 | **Gap** | No sports management UI for venue |
| ADMIN-04 | Mostly Complete | Players + waivers + matches all viewable; could add search to match history |
| ADMIN-05 | Mostly Complete | Manual assign exists via CourtStatusBoard but admin panel needs explicit court-to-match assignment view |

## Key Decisions

- Schema is complete -- no DB changes needed
- `venues.sports` column already exists for ADMIN-03
- Court board + timer + assignment chain all work end-to-end
- Plans should focus on: (1) wiring up remaining gaps in existing code, (2) integration testing the full flow
