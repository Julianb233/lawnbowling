# PRD: Bowls-Specific Player Ratings

## Problem Statement
Player stats in `PlayerSportSkill` track only generic wins/losses and an `elo_rating` field that is declared in `src/lib/types.ts` but never calculated or displayed anywhere in the app. The leaderboard at `/leaderboard` sorts by a simple win rate with a 5-game minimum and has no bowls-specific metrics — shot differential, ends won percentage, or per-position performance are completely absent.

## Goal
Every lawn bowling player has a distinct rating per position (Skip, Vice, Second, Lead) calculated automatically from `tournament_scores` data, with shot differential and ends won tracked per season and displayed with trend sparklines on the leaderboard and profile pages.

## User Stories
- As a player, I want to see my Skip rating separately from my Lead rating so that I understand where I perform best and can request appropriate positions.
- As a player, I want to see my ends-won percentage and shot differential trend over the current season so that I can track whether my game is improving.
- As a club admin, I want the leaderboard to show multiple rating categories (Skip, Overall, Ends Win %) so that I can recognize different types of excellence at the club.
- As a drawmaster, I want position-specific ratings surfaced at check-in so that I can make better-informed draw decisions.
- As a player viewing the leaderboard, I want confidence-weighted ratings rather than raw win rates so that a player with 50 games isn't ranked below a player who won their only 2 games.

## Requirements

1. **REQ-11-01** — Add a `bowls_position_ratings` table in Supabase with columns: `id`, `player_id`, `position` (skip/vice/second/lead/singles), `season` (e.g. "2025"), `elo_rating` (default 1200), `games_played`, `wins`, `losses`, `draws`, `shot_differential`, `ends_won`, `ends_played`, `ends_won_pct` (computed), `updated_at`.

2. **REQ-11-02** — Add a corresponding `BowlsPositionRating` TypeScript interface to `src/lib/types.ts` alongside the existing `PlayerSportSkill` interface, using the `BowlsPosition` type for the `position` field.

3. **REQ-11-03** — Extend the existing `calculateElo` function in `src/lib/elo.ts` with a bowls-specific variant `calculateBowlsElo` that accepts position, shot differential, and ends won as inputs and applies a position-weighted K-factor (Skip K=40, Vice K=36, Second K=32, Lead K=28) to reflect greater strategic accountability at higher positions.

4. **REQ-11-04** — Create `src/lib/bowls-ratings.ts` as a pure calculation module that: reads finalized `tournament_scores` rows for a given player, resolves each player's position from `bowls_checkin` / `tournament_scores` team assignments, computes per-position season stats (shot differential = total_a minus total_b summed per-player, ends won from `ends_won_a` / `ends_won_b` columns in `TournamentScore`), and returns updated `BowlsPositionRating` objects. No DB calls — pure functions only, following the pattern in `src/lib/tournament-engine.ts`.

5. **REQ-11-05** — Create a Supabase Edge Function or Next.js API route at `src/app/api/bowls/recalculate-ratings/route.ts` that calls `bowls-ratings.ts` logic and upserts results into `bowls_position_ratings`. This route must be callable by admins via the admin dashboard and triggered automatically when a `tournament_scores` row is set to `is_finalized = true`.

6. **REQ-11-06** — The leaderboard page (`src/app/leaderboard/page.tsx`) must gain a sport-aware tab strip: when `lawn_bowling` is selected, show four category tabs — Overall, Skip Rating, Lead Rating, Ends Win %. Each tab ranks players by the relevant metric with a confidence-weighted display (Wilson score lower bound for win rate; raw ELO for position ratings).

7. **REQ-11-07** — Add a `BowlsRatingsCard` component at `src/components/stats/BowlsRatingsCard.tsx` showing a 2×2 grid of position cards (Skip, Vice, Second, Lead), each with ELO value, tier badge (using existing `getRatingTier` from `src/lib/elo.ts`), games played, and a mini sparkline of the last 10 rating changes. Wire this into both `src/app/stats/page.tsx` (below `PlayerStatsCard`) and `src/app/profile/` profile view.

8. **REQ-11-08** — The existing `Leaderboard` component at `src/components/stats/Leaderboard.tsx` must be updated to accept a `category` prop and render the appropriate sorted data from `bowls_position_ratings` rather than the generic `player_stats` table when the sport is `lawn_bowling`.

9. **REQ-11-09** — Season scoping: ratings are filtered by the current season year string (derived from `new Date().getFullYear()`). Historical seasons must be accessible via a season selector dropdown on both the leaderboard and the `BowlsRatingsCard`.

10. **REQ-11-10** — All new DB queries must use the existing Supabase client pattern (`src/lib/supabase/client.ts` for client components, `src/lib/supabase/server.ts` for server components), consistent with the rest of the codebase.

11. **REQ-11-11** — The check-in flow at `src/app/bowls/[id]/page.tsx` must display a player's top position rating badge (e.g. "Skip 1,340") next to their name in the player list, sourced from `bowls_position_ratings`.

12. **REQ-11-12** — A Supabase migration file must be provided for the `bowls_position_ratings` table, including RLS policies: players can read all rows, players can only update their own rows, the service role can upsert.

## Success Criteria
- A player who has played 10+ finalized tournament rounds as Skip has a distinct Skip ELO rating that differs from their Lead ELO rating.
- The leaderboard Skip Rating tab correctly orders players by Skip ELO descending and shows at least 3 players.
- `calculateBowlsElo` is covered by unit tests confirming that a Skip victory with +8 shot differential yields a higher ELO gain than a Lead victory with the same differential.
- Recalculate-ratings API route runs in under 3 seconds for a 20-player, 5-round tournament.
- Shot differential and ends-won percentage trend sparklines render in `BowlsRatingsCard` without layout shift.
- No existing generic stats or ELO functionality is broken (existing `PlayerSportSkill.elo_rating` still populated for non-bowls sports).

## Technical Approach
- **New table**: `bowls_position_ratings` in Supabase, migration in `supabase/migrations/`.
- **Pure logic**: `src/lib/bowls-ratings.ts` — no side effects, easily testable with vitest.
- **Trigger point**: extend the `is_finalized` update handler (wherever scores are finalized in `src/app/api/bowls/` or admin routes) to call the recalculate endpoint.
- **Leaderboard refactor**: add `category: 'overall' | 'skip' | 'lead' | 'ends_pct'` prop to `<Leaderboard>`, fetch from `bowls_position_ratings` when category is not `overall`.
- **Sparkline**: use a lightweight SVG path (no chart library) or adopt `recharts` if already present in `package.json`.
- **Key files to read first**: `src/lib/types.ts` (add interface), `src/lib/elo.ts` (add function), `src/components/stats/Leaderboard.tsx` (extend), `src/app/stats/page.tsx` (add card), `src/app/leaderboard/page.tsx` (add tabs).

## Scope & Constraints
- **In scope**: position ratings, season stats, updated leaderboard tabs, BowlsRatingsCard, check-in badge, recalculate API route.
- **Out of scope**: real-time ELO recalculation during live play (only recalculated on finalization); cross-club global leaderboard (venue-scoped only for now); mobile push notification for rating changes.
- **Risk**: position data may be incomplete in older tournament scores if `bowls_checkin.preferred_position` was not recorded. Fallback: treat unresolved positions as `singles` for rating purposes.
- **Constraint**: must not break existing `PlayerSportSkill` usage or the generic `/leaderboard` for non-bowls sports.

## Estimated Effort
L
