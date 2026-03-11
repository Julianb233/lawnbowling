# Phase 08: Tournament Lifecycle

## Objective
Complete tournament-day workflow: scoring, results, multi-round draw, history, print.

## Sub-phases

### 08-01: Score Entry UI and API
- Per-end, per-rink score entry with touch-friendly increment/decrement
- Real-time updates via Supabase Realtime (postgres_changes)
- Auto-save with 1.5s debounce
- Optimistic concurrency control (expected_updated_at)
- Round finalization with confirmation dialog
- Score validation (0-9 per end, max 30 ends)
- Only one team scores per end (lawn bowls rule)

### 08-02: Results Calculation, Multi-round Draw, Tournament Progression
- Results API auto-calculates: total shots, ends won, winner per rink
- Player standings across all rounds (wins, losses, draws, shot diff)
- Tournament progression state machine: registration -> checkin -> draw -> scoring -> results -> (next_round | complete)
- Multi-round support: generate new draw after results finalized
- Live scoreboard page with dark theme for TV display

### 08-03: Tournament History, Player Stats, Print-friendly Sheets
- Tournament history page with filter (all/active/completed)
- Player stats page with career stats across tournaments (wins, win rate, shot diff, ends won)
- Print-friendly draw sheet with score recording table
- Print-friendly results sheet with player standings table
- Sort options for stats: most wins, most games, win rate, shot difference

## Key Files
- `src/app/bowls/[id]/scores/page.tsx` - Score entry UI
- `src/app/bowls/[id]/results/page.tsx` - Results display with print support
- `src/app/bowls/[id]/live/page.tsx` - Live scoreboard
- `src/app/bowls/history/page.tsx` - Tournament history
- `src/app/bowls/stats/page.tsx` - Player statistics
- `src/app/api/bowls/scores/route.ts` - Score CRUD API
- `src/app/api/bowls/results/route.ts` - Results calculation API
- `src/app/api/bowls/progression/route.ts` - Tournament state machine API
- `supabase/migrations/20260311_tournament_scores.sql` - Database schema
