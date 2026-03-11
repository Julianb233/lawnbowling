# PRD: Unified Check-In Flow

## Problem Statement
The kiosk (`/kiosk`), availability board (`/board`), and tournament check-in (`/bowls/[id]`) are three completely disconnected systems — a player checking in at the kiosk iPad does not appear in the tournament's checked-in list, forcing the drawmaster to manually re-check in every player. The kiosk was designed for multi-sport drop-in (pickleball partner matching), not bowls-specific tournament days.

## Goal
A single check-in action propagates everywhere: player checks in once at the kiosk iPad, selects their bowls position preference, and immediately appears in the tournament's checked-in list without any manual intervention by the drawmaster.

## User Stories
- As a **player arriving on tournament day**, I want to check in at the kiosk iPad once and select my preferred position so that I appear in the draw automatically without the drawmaster having to find me.
- As a **drawmaster**, I want every kiosk check-in to land directly in the tournament check-in list so that I don't have to re-enter players manually before generating the draw.
- As a **kiosk operator (venue admin)**, I want to configure the kiosk to a specific active tournament so that check-ins are routed to the right event and not the generic availability board.
- As a **player**, I want to see my check-in confirmation with my selected position on the kiosk screen so that I know I'm registered correctly for the draw.
- As a **drawmaster**, I want the kiosk to fall back to generic check-in mode on non-tournament days so that the venue's day-to-day drop-in flow is not disrupted.

## Requirements

- **UCI-01** — The kiosk must detect whether an active tournament exists for the current venue. "Active" means `tournament.status IN ('registration', 'in_progress')` and `tournament.starts_at` is within a configurable window (default: same calendar day).
- **UCI-02** — When a tournament is detected, the kiosk check-in UI must replace the generic partner-matching flow with a bowls-specific check-in screen that collects: player identity (via QR scan or name search) and preferred position (skip / vice / second / lead).
- **UCI-03** — On position confirmation, the kiosk must write directly to `bowls_checkins` (same table used by `/bowls/[id]`). The `tournament_id` is derived from the active tournament detected in UCI-01.
- **UCI-04** — The tournament check-in list at `/bowls/[id]` (the `checkin` view) must poll or receive realtime updates from `bowls_checkins` so that a kiosk check-in appears within 3 seconds without a manual page refresh.
- **UCI-05** — If multiple active tournaments exist for a venue, the kiosk must present a tournament selection step before position selection.
- **UCI-06** — The kiosk must display a "You're checked in!" confirmation screen for at least 4 seconds showing the player's name, position, and tournament name before resetting to the idle state.
- **UCI-07** — A player who is already checked in and rescans or searches again must be shown their existing check-in with the option to change their position preference (not create a duplicate row).
- **UCI-08** — The kiosk bowls mode must be visually distinct from the generic drop-in mode — use a tournament-specific header showing the tournament name and player count.
- **UCI-09** — The `/kiosk` route must accept an optional `?mode=bowls&tournament_id=<id>` query parameter so that a venue admin can bookmark a direct kiosk URL for a specific tournament (bypassing auto-detection).
- **UCI-10** — The `/bowls/[id]` check-in view must show a badge or indicator next to each player indicating how they checked in: "Kiosk", "Manual", or "App".
- **UCI-11** — The drawmaster must be able to manually remove a player from the check-in list (e.g., player left before the draw) via the `/bowls/[id]` UI. This action must also remove them from `bowls_checkins`.
- **UCI-12** — The generic kiosk check-in flow (non-bowls days) must remain unchanged when no active bowls tournament is detected.
- **UCI-13** — All check-in API routes must be idempotent: calling checkin twice for the same `(player_id, tournament_id)` pair must upsert rather than create a duplicate row.
- **UCI-14** — Unit tests must cover: auto-detection logic, upsert behavior, and the fallback to generic mode when no tournament is found.

## Success Criteria
- A player who completes kiosk check-in appears in the `/bowls/[id]` checked-in list within 3 seconds, verified by a manual end-to-end test in staging.
- Zero duplicate rows in `bowls_checkins` for any `(player_id, tournament_id)` pair regardless of how many times a player checks in.
- The drawmaster can generate a draw immediately after all players have checked in via kiosk, with no additional manual steps required.
- The kiosk's generic drop-in flow is unchanged on non-tournament days (no regression).
- All 14 requirements have a corresponding passing test or a QA sign-off checkpoint.

## Technical Approach

**Key files to modify:**
- `src/app/kiosk/page.tsx` — Add tournament detection on mount; switch `KioskView` to include a `"bowls_checkin"` mode.
- `src/app/kiosk/bowls/` (new) — New route/component tree for the bowls-specific kiosk check-in flow.
- `src/components/kiosk/KioskCheckIn.tsx` — Refactor to accept an optional `tournamentId` prop; if set, render bowls position selector instead of sport selector.
- `src/app/api/bowls/checkin/route.ts` — Ensure the POST handler uses `upsert` on `(player_id, tournament_id)` unique key. Add a `checkin_source` column (`kiosk | manual | app`) to `bowls_checkins`.
- `src/app/bowls/[id]/page.tsx` — Replace polling interval on `loadCheckins` with a Supabase realtime subscription to `bowls_checkins` filtered by `tournament_id`.
- `supabase/migrations/` — Migration to add `checkin_source` column and `UNIQUE(player_id, tournament_id)` constraint to `bowls_checkins`.

**Auto-detection query:**
```ts
supabase.from("tournaments")
  .select("id, name, status, starts_at")
  .eq("venue_id", venueId)
  .in("status", ["registration", "in_progress"])
  .gte("starts_at", startOfDay)
  .lte("starts_at", endOfDay)
  .order("starts_at", { ascending: true })
  .limit(5)
```

**Realtime subscription pattern:**
```ts
supabase.channel("bowls_checkins")
  .on("postgres_changes", { event: "*", schema: "public", table: "bowls_checkins", filter: `tournament_id=eq.${tournamentId}` }, handleChange)
  .subscribe()
```

**Dependencies:** Supabase realtime must be enabled on the `bowls_checkins` table (add to replication publication). No new third-party packages required.

## Scope & Constraints

**In scope:**
- Kiosk bowls mode UI and auto-detection logic
- `bowls_checkins` upsert with `checkin_source` column
- Realtime sync from kiosk check-in to `/bowls/[id]` check-in list
- Manual removal of check-ins by drawmaster
- `?mode=bowls&tournament_id` query param support

**Out of scope:**
- QR code generation for player membership cards (separate PRD)
- Check-in via NFC or biometrics
- Modifying the `/board` availability board to reflect tournament check-ins
- Multi-venue kiosk federation

**Risks:**
- Supabase realtime may not be enabled in all deployment environments — provide a 5-second polling fallback with exponential back-off.
- If two simultaneous kiosk check-ins race on the same player, the `UNIQUE` constraint must be the source of truth (upsert wins, no 500 error surfaced to user).

## Estimated Effort
L
