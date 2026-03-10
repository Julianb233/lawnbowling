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
- **Auth callback**: was inserting `{ id: user.id, name }` but schema has `user_id` + `display_name` columns — fixed to `{ user_id: user.id, display_name }`
- **Signup page**: same column name mismatch — fixed
- **Missing logout**: no logout endpoint or UI existed — added `POST /api/auth/logout` and "Sign Out" button on profile page

## Verification
- `npx next build` passes with 0 errors
- All 4 AUTH requirements (AUTH-01 through AUTH-04) are satisfied
- All 5 success criteria met
