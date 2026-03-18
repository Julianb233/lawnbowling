# Lawn Bowl API & Backend Gap Analysis — 500-Player Scale

**Date**: 2026-03-17
**Scenario**: 500 members, 60+ rinks, 3 rounds, 3 greens

## Critical Scale Failures (P0)

### 1. Mead/Gavel Draw Tables Max at 32 Players
- **Files**: `src/lib/mead-tables.ts`, `src/lib/gavel-tables.ts`
- **Issue**: Mead Fours only covers 16/20/24/28/32. Gavel covers 12/16/20/24.
- **Impact**: 500-player Mead draw silently falls back to random with no warning (now partially fixed by US-009 frontend warning)
- **Fix needed**: Generate Mead tables for 40, 48, 56, 64, 100, 128. Or implement algorithmic Mead generation instead of lookup tables.
- **Effort**: 8h

### 2. Serial Rating Upsert on Score Finalization
- **Files**: `src/app/api/bowls/scores/route.ts:328-346`, `src/app/api/bowls/progression/route.ts:114-184`
- **Issue**: Rating updates loop one-at-a-time: `for (rating of newRatings) { await supabase.upsert(...) }`
- **Impact**: 496 sequential DB calls for 500 players = timeout
- **Fix**: Batch upsert: `supabase.from("bowls_position_ratings").upsert(newRatings, { onConflict: "player_id,position,season" })`
- **Effort**: 2h

### 3. Serial Notification Loop
- **Files**: `src/app/api/bowls/notifications/route.ts:106-113`, `src/app/api/notifications/send/route.ts:131-151`
- **Issue**: Each push notification sent sequentially. 500 × 100ms = 50s timeout.
- **Fix**: `Promise.all()` with concurrency pool of 50
- **Effort**: 3h

### 4. Missing QR Generation Endpoint
- **Issue**: No `GET /api/qr/generate` — only check-in POST endpoints exist
- **Impact**: QR poster (US-003) generates client-side only. No server-side QR for email/PDF.
- **Fix**: Add `GET /api/qr/generate?tournament_id=xxx&format=svg|png`
- **Effort**: 2h

## High Priority (P1)

### 5. No Pagination on ANY GET Endpoint
- **Affected**: `/bowls/checkin`, `/bowls/scores`, `/bowls/results`, `/bowls/tournament`, `/bowls/members`
- **Impact**: 500 check-ins = 500-row payload per request
- **Fix**: Add `?limit=50&offset=0` to all GET routes
- **Effort**: 6h total

### 6. O(n²) Match History in Team Assignment
- **File**: `src/app/api/bowls/assign/route.ts:71-73`
- **Issue**: Queries ALL match_players for 500 player IDs = 250k rows scanned
- **Fix**: Index on `match_players(player_id)`, limit to last 20 matches per player
- **Effort**: 4h

### 7. Rating Logic Duplicated in 2 Routes
- **Files**: `scores/route.ts` AND `progression/route.ts`
- **Issue**: Same rating calculation copy-pasted. Divergence risk.
- **Fix**: Extract to shared `recalculateRatings()` function in bowls-ratings.ts
- **Effort**: 3h

### 8. No Bulk Check-In Endpoint
- **Issue**: No `POST /api/bowls/checkin/bulk` for CSV import or RSVP batch check-in
- **Impact**: 200 RSVPed members must check in one-by-one
- **Fix**: Add bulk upsert endpoint
- **Effort**: 3h

### 9. No Rate Limiting
- **Affected**: `/bowls/checkin`, `/qr/checkin`, `/qr/venue-checkin`
- **Impact**: 500 simultaneous phone check-ins could flood the API
- **Fix**: Add rate limiting middleware (100 req/min per IP)
- **Effort**: 2h

## Medium Priority (P2)

### 10. Checkin GET Not Idempotent for Bulk
- Members POST creates duplicates if called twice. Needs conflict resolution.

### 11. No Async Job Queue
- Draw generation, rating calc, and notification delivery should be async for 500+ players

### 12. No Export Functionality
- No CSV download for results, members, or scores

### 13. Rating Calc Not Idempotent
- Calling recalculate-ratings twice double-counts. Needs `recalculated_at` timestamp guard.

## API Readiness Matrix

| Route | Method | 500-Player Ready? | Blocker |
|-------|--------|-------------------|---------|
| /bowls/tournament | GET | No | No pagination |
| /bowls/checkin | POST | Yes | Idempotent upsert |
| /bowls/checkin | GET | No | No pagination |
| /bowls/checkin/bulk | POST | MISSING | Doesn't exist |
| /bowls/draw | POST | No | Mead tables max 32 |
| /bowls/scores | GET | No | No pagination |
| /bowls/scores | POST | Yes | Optimistic concurrency |
| /bowls/scores | PATCH | No | Serial rating upsert |
| /bowls/scores | PUT | Yes | New unlock endpoint |
| /bowls/results | GET | No | No pagination |
| /bowls/notifications | POST | No | Serial send loop |
| /bowls/assign | POST | No | O(n²) history scan |
| /bowls/members | GET | No | No pagination |
| /qr/generate | GET | MISSING | Doesn't exist |
| /notifications/send | POST | No | Serial loop |

## Effort Summary
- **P0 Critical**: ~15h
- **P1 High**: ~18h
- **P2 Medium**: ~15h
- **Total to 500-player ready**: ~48h
