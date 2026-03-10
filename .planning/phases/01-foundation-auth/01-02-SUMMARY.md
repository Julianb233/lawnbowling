# 01-02: Authentication Flow, Database Schema & Admin Role — COMPLETE

## What was built

### Supabase Client Helpers
- `src/lib/supabase/client.ts` — browser client via `createBrowserClient`
- `src/lib/supabase/server.ts` — server client via `createServerClient` with cookie handling
- `src/lib/supabase/middleware.ts` — session refresh middleware, redirects unauthenticated users

### Auth Pages
- `src/app/login/page.tsx` — email+password login with magic link option
- `src/app/signup/page.tsx` — email+password signup, creates player profile on success
- `src/app/auth/callback/route.ts` — exchanges auth code for session, creates player profile if missing

### Session Persistence
- `src/middleware.ts` — calls `updateSession()` on every request, refreshes Supabase auth cookies
- Public paths excluded: `/login`, `/signup`, `/auth/callback`
- Matcher excludes static assets

### Logout
- `src/app/api/auth/logout/route.ts` — `POST` endpoint calling `supabase.auth.signOut()`
- `src/app/profile/ProfilePageClient.tsx` — "Sign Out" button in profile UI

### Admin Role
- `src/lib/auth/admin.ts` — `requireAdmin()` (redirect if not admin) and `isAdmin()` (boolean check)
- Admin role stored in `players.role` column (`'player'` or `'admin'`)
- Admin RLS policies on courts, venues, matches, match_players, waiver_templates, player_reports

### Database Schema (`src/lib/db/schema.sql`)
All required tables with RLS and indexes:
- `venues`, `players`, `waivers`, `waiver_templates`
- `partner_requests`, `courts`, `matches`, `match_players`
- `teams`, `team_members`, `team_messages`
- `match_results`, `player_stats`
- `favorites`, `player_reviews`, `scheduled_games`, `game_rsvps`
- `friendships`, `activity_feed`, `player_reports`, `notification_preferences`

### DB Layer (17 files in `src/lib/db/`)
- `players.ts`, `matches.ts`, `partner-requests.ts`, `courts.ts`, `venues.ts`, `waivers.ts`
- `teams.ts`, `team-messages.ts`, `stats.ts`, `favorites.ts`, `friends.ts`
- `reviews.ts`, `schedule.ts`, `activity.ts`, `reports.ts`, `settings.ts`, `analytics.ts`

## Bugs Fixed
- **Auth callback**: was inserting `{ id: user.id, name }` but schema has `user_id` + `display_name` columns -- fixed to `{ user_id: user.id, display_name }`
- **Signup page**: same column name mismatch -- fixed
- **Missing logout**: no logout endpoint or UI existed -- added `POST /api/auth/logout` and "Sign Out" button on profile page

## Fixes Applied (Phase 1 Re-audit)

### [Rule 1 - Bug] RLS policies used auth.uid() = player_id but player_id references players.id
- **Found during:** Plan 01-02 schema audit
- **Issue:** 15+ RLS policies compared `auth.uid()` (auth user UUID) with `player_id` (references `players.id`, a separate auto-generated UUID). These policies would always evaluate to false, blocking all player-specific operations.
- **Fix:** Created `public.is_own_player(uuid)` SECURITY DEFINER function that joins through `players` table to verify ownership. Replaced all affected policies in both schema.sql and the live Supabase database.
- **Tables affected:** favorites, friendships, waivers, partner_requests, game_rsvps, notification_preferences, teams, team_members, team_messages, match_results, player_reviews, player_reports, scheduled_games

### [Rule 1 - Bug] Pages queried players with .eq("id", user.id) instead of .eq("user_id", user.id)
- **Found during:** Plan 01-02 code audit
- **Issue:** `page.tsx`, `queue/page.tsx`, and `board/page.tsx` queried the `players` table using `.eq("id", user.id)` where `user.id` is the auth UUID. Since `players.id` is auto-generated and different from `auth.users.id`, the query would always return null.
- **Fix:** Changed to `.eq("user_id", user.id)` in all three pages.

### [Rule 1 - Bug] queue/page.tsx queried match_players with user.id instead of player.id
- **Fix:** Changed `.eq("player_id", user.id)` to `.eq("player_id", player.id)` since `match_players.player_id` references `players.id`.

### [Rule 2 - Missing Critical] /offline not in public middleware paths
- **Fix:** Added `/offline` to the public paths array in middleware so unauthenticated users can see the offline page.

## Admin Seed Script
- `scripts/seed-admin.sql` -- SQL to promote a user to admin by email address

## Supabase Project
- **Project ref:** fcwlrvjnmzoszjwmbyfl
- **URL:** https://fcwlrvjnmzoszjwmbyfl.supabase.co
- **Tables deployed:** 21 tables with RLS enabled on all
- **Credentials:** 1Password "Supabase - pick-a-partner" in API-Keys vault

## Verification
- `npx next build --turbopack` passes with 0 errors
- `npx tsc --noEmit` reports 0 errors
- All 4 AUTH requirements (AUTH-01 through AUTH-04) are satisfied
- All 5 success criteria met
- RLS policies tested and deployed to live Supabase project
