# Phase 8: Tournament Lifecycle — Scoring, Results, Multi-Round

## Status: COMPLETE

All six success criteria are met by existing code. No gaps found.

## Success Criteria Verification

### 1. Score entry per end per rink in real-time
- **File**: `src/app/bowls/[id]/scores/page.tsx`
- End-by-end score entry with increment/decrement buttons per team per end
- Per-rink scoring grid with add/remove end controls
- Supabase realtime subscription for live updates across devices
- Auto-save with 1.5s debounce; conflict detection (HTTP 409)
- Finalize round locks all scores permanently
- **API**: `src/app/api/bowls/scores/route.ts` (GET, POST, PATCH)

### 2. Results automatically calculated (shots, ends, winner)
- **Engine**: `src/lib/tournament-engine.ts`
  - `calculateBowlsResult()` — totals, ends won, winner, margin from end-by-end scores
  - `buildStandings()` — aggregates across rounds: W/L/D, shots for/against, shot difference, ends won
  - `sortStandings()` — tiebreakers: wins > shot difference > ends won > points for
  - `calculateMatchResult()` — single, best-of-3, best-of-5 formats
- **Results page**: `src/app/bowls/[id]/results/page.tsx`
  - Stats overview (rounds, total shots, total ends, highest score)
  - Round-by-round rink results with end-by-end breakdown tables
  - Player standings table (P, W, L, D, SF, SA, +/-)
- **Tests**: `src/__tests__/tournament-engine.test.ts` — 25+ unit tests covering all engine functions

### 3. Multi-round tournaments supported
- Score entry page has round selector (1-5)
- `src/app/bowls/[id]/results/page.tsx` supports advancing to next round via progression API
- `generateSeededDraw()` avoids repeat opponents using previous-round history
- Round finalization triggers next-round availability
- **API**: `src/app/api/bowls/progression/` (GET state, POST next_round/complete)

### 4. Tournament history viewable with past results and player stats
- **History page**: `src/app/bowls/history/page.tsx`
  - Lists all lawn bowls tournaments (all/active/completed filter)
  - Shows player count, rounds played, rink games per tournament
  - Links to results page for each tournament
- **Player standings**: Full W/L/D record, shots for/against, shot differential
- **Results page**: Per-round breakdown with end-by-end tables

### 5. Print-friendly draw sheet available
- **Draw view**: `src/app/bowls/[id]/page.tsx` — "Print Draw Sheet" button (`window.print()`)
- **Print CSS**: `src/app/globals.css` — `@media print` block:
  - Hides nav, footer, `.no-print` elements
  - White background, black text
  - Draw view tabs marked with `no-print` class

### 6. Dynamic tournament entity (not hardcoded)
- **DB layer**: `src/lib/db/tournaments.ts` — full CRUD via Supabase
  - `createTournament()`, `getTournament()`, `listTournaments()`
  - Configurable: name, sport, format (round_robin/single_elimination/double_elimination), max_players, venue_id
- **Types**: `src/lib/types.ts` — `Tournament`, `TournamentMatch`, `TournamentParticipant`, `TournamentScore`
- **API routes**: `src/app/api/tournament/` — REST endpoints for create, read, join, start, report results, forfeit
- **Bracket generation**: Single elimination, double elimination (with losers bracket + grand final), round robin (circle method)

## Key Architecture

- **Pure engine** (`tournament-engine.ts`): All logic is pure functions, no DB calls, fully unit-tested
- **DB layer** (`db/tournaments.ts`): Supabase queries, bracket generation, result recording with winner advancement
- **Bowls flow**: Check-in > Board > Draw > Scores > Results > Next Round/Complete
- **Generic tournaments**: `/tournament` route supports any sport with bracket/standings views
- **Bowls-specific**: `/bowls` route adds lawn bowls concepts (rinks, ends, positions, team assignments)
