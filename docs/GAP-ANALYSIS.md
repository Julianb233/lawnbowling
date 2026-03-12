# Lawnbowling App -- Gap Analysis
Generated: 2026-03-12

## Summary
- **9 Critical issues** (data loss, broken auth, security holes)
- **12 High issues** (missing tables, broken flows, unprotected endpoints)
- **14 Medium issues** (missing UX patterns, schema mismatches, missing validation)
- **8 Low issues** (missing loading states, env var gaps, code duplication)

---

## Critical Issues

### [C-001] Account delete uses wrong column -- deletes nothing or wrong player
- **Category:** Backend
- **File:** `src/app/api/account/delete/route.ts:13`
- **Description:** The DELETE handler queries `.eq("id", user.id)` where `user.id` is the Supabase auth UID. However, the `players` table has a separate `id` column (player UUID) and a `user_id` column (auth UUID). This query will never match, so account deletion silently does nothing. If by coincidence a player row's `id` matches an auth UID, it would delete the wrong player.
- **Impact:** Users cannot delete their accounts. Potential GDPR/privacy compliance failure.
- **Fix:** Change to `.eq("user_id", user.id)` and also call `supabase.auth.admin.deleteUser(user.id)` using the service role client to fully remove the auth record.
- **Effort:** Low

### [C-002] Admin export uses wrong column -- admin check always fails
- **Category:** Backend
- **File:** `src/app/api/admin/export/route.ts:10`
- **Description:** The admin verification query uses `.eq("id", user.id)` instead of `.eq("user_id", user.id)`. Since `user.id` is the auth UID and players.id is the player UUID, this will never find a matching player, so every admin gets a 403 Forbidden response.
- **Impact:** Admin export feature is completely broken -- no admin can export data.
- **Fix:** Change to `.eq("user_id", user.id)`.
- **Effort:** Low

### [C-003] Friends API uses auth UID as player_id -- inserts invalid foreign keys
- **Category:** Backend
- **File:** `src/app/api/friends/route.ts:12`
- **Description:** The POST handler inserts `{ player_id: user.id, ... }` where `user.id` is the auth UID. The `friendships` table expects `player_id` to reference `players.id` (player UUID). This creates rows with invalid foreign key references (if FK constraints are enforced, it fails silently; if not, data is orphaned).
- **Impact:** Friend requests are broken -- either fail on insert or create corrupt data.
- **Fix:** Look up the player row first (`SELECT id FROM players WHERE user_id = ?`), then use the player.id.
- **Effort:** Low

### [C-004] Same auth UID vs player ID bug in favorites, notifications/subscribe, settings/notifications, friends/block
- **Category:** Backend
- **Files:**
  - `src/app/api/favorites/route.ts:12,26`
  - `src/app/api/notifications/subscribe/route.ts:19,47`
  - `src/app/api/settings/notifications/route.ts:23`
  - `src/app/api/friends/block/route.ts:12`
- **Description:** All these routes use `user.id` (auth UID) directly as `player_id` in database operations. The `players` table has a separate `id` column. These inserts/upserts will create rows with invalid `player_id` values.
- **Impact:** Favorites, push notification subscriptions, notification preferences, and blocking are all broken or create orphaned data.
- **Fix:** In each route, first query the player by `user_id`, then use `player.id`. Consider creating a shared helper `getPlayerIdFromAuth(supabase, user.id)`.
- **Effort:** Medium (same fix across 4+ routes)

### [C-005] Email send API has no authentication -- open relay
- **Category:** Backend / Security
- **File:** `src/app/api/email/send/route.ts:21-41`
- **Description:** The `/api/email/send` POST endpoint has zero authentication. Anyone can send emails to arbitrary addresses using the app's email sender identity. No auth check, no rate limiting.
- **Impact:** Can be abused as an open email relay for spam/phishing. Could get the domain blacklisted.
- **Fix:** Add authentication (require logged-in user or admin). Add rate limiting. Consider making this a server-only internal function rather than an API route.
- **Effort:** Low

### [C-006] Club seed API has no admin check -- any authenticated user can overwrite all club data
- **Category:** Backend / Security
- **File:** `src/app/api/clubs/seed/route.ts:16-26`
- **Description:** The `/api/clubs/seed` endpoint only checks if the user is authenticated (`if (!user)`), but does not verify admin role. The JSDoc says "Admin only" but the code does not enforce it. Any logged-in user can trigger a full database re-seed of all clubs.
- **Impact:** Any authenticated user can overwrite/corrupt the entire club directory.
- **Fix:** Add admin role check: query `players` table for `role = 'admin'`.
- **Effort:** Low

### [C-007] Shop checkout API has no authentication -- anonymous users can create Stripe sessions
- **Category:** Backend / Security
- **File:** `src/app/api/shop/checkout/route.ts:27-118`
- **Description:** The `/api/shop/checkout` POST endpoint creates Stripe Checkout sessions without any authentication. While this may be intentional for guest checkout, there is no rate limiting or CSRF protection. Combined with being a public API route (not in the middleware public paths), bots could create unlimited Stripe sessions.
- **Impact:** Potential abuse vector for Stripe session creation spam.
- **Fix:** Add rate limiting at minimum. Consider requiring authentication or implementing CAPTCHA for guest checkout.
- **Effort:** Medium

### [C-008] 20+ database tables referenced in code but missing from migrations
- **Category:** Database
- **Description:** The following tables are used in `supabase.from()` calls across the codebase but have NO corresponding CREATE TABLE in any migration file:
  - `match_players` -- used in queue page, match flows
  - `courts` -- used in admin/courts, court assignment
  - `waivers` -- used in admin/waivers, waiver signing
  - `favorites` -- used in favorites page
  - `player_reviews` -- used in reviews API
  - `player_reports` -- used in reports API
  - `scheduled_games` -- used in schedule feature
  - `game_rsvps` -- used in RSVP feature
  - `notifications` -- used in notification center
  - `player_sport_skills` -- used in profile skills
  - `partner_requests` -- used in partner matching
  - `team_messages` -- used in team chat
  - `player_stats` -- used in stats page
  - `tournament_participants` -- used in tournament join
  - `match_results` -- used in match reporting
  - `court_bookings` -- used in bookings API
  - `push_subscriptions` -- used in push notifications
  - `subscriptions` -- used in Stripe webhook
  - `activity_feed` -- used in activity page
  - `player_endorsements` -- used in profile endorsements
  - `player_availability` -- used in availability scheduling
  - `player_clubs` -- used in profile club affiliations
  - `player_photos` -- used in photo gallery
  - `player_achievements` -- used in achievements
  - `shop_orders` -- used in shop
  - `staff_invitations` -- used in onboarding
  - `club_venues` -- used in club venues
  - `contact_preferences` -- used in contact prefs
- **Impact:** These tables likely exist from an initial migration or manual setup not captured in the `supabase/migrations/` directory. If deploying to a fresh environment, all these features would fail with "relation does not exist" errors.
- **Fix:** Create a comprehensive baseline migration (`0001_initial_schema.sql`) that creates all core tables (venues, players, matches, courts, etc.) with proper constraints, indexes, and RLS policies.
- **Effort:** High

### [C-009] `is_own_player()` function referenced in RLS policies but never created in migrations
- **Category:** Database
- **File:** `supabase/migrations/20260311_club_claims.sql`, `supabase/migrations/20260311_club_members.sql`
- **Description:** RLS policies in `club_claim_requests` and `club_members` call `public.is_own_player(player_id)`, but no migration creates this function. Without it, all RLS policies using this function will fail, blocking all reads/writes to these tables.
- **Impact:** Club claims and club member management are completely broken if this function does not exist.
- **Fix:** Create the function in a migration: `CREATE FUNCTION is_own_player(pid UUID) RETURNS BOOLEAN AS $$ SELECT pid = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1) $$ LANGUAGE sql SECURITY DEFINER;`
- **Effort:** Low

---

## High Issues

### [H-001] Noticeboard post type mismatch between DB constraint and TypeScript
- **Category:** Database / Frontend
- **File:** `supabase/migrations/20260311_noticeboard.sql:7` vs `src/lib/types.ts:412`
- **Description:** The DB CHECK constraint allows only 3 types: `'announcement', 'tournament_result', 'member_post'`. But TypeScript defines 6 types: `"announcement" | "event" | "general" | "question" | "tournament_result" | "member_post"`. Inserting posts with type `"event"`, `"general"`, or `"question"` will fail with a constraint violation.
- **Impact:** Creating event, general, or question posts from the frontend will silently fail.
- **Fix:** ALTER the CHECK constraint to include all 6 types, or remove unused types from TypeScript.
- **Effort:** Low

### [H-002] Duplicate pennant_seasons table definition in two migrations
- **Category:** Database
- **Files:** `supabase/migrations/20260311_pennant_season.sql` and `supabase/migrations/20260311_pennant_tracking.sql`
- **Description:** Both files create `pennant_seasons`, `pennant_divisions`, `pennant_teams`, etc. with `CREATE TABLE IF NOT EXISTS`. While `IF NOT EXISTS` prevents errors, the two files have slightly different column definitions (e.g., foreign key constraint types). This makes it unclear which schema is authoritative.
- **Impact:** Confusion about the true schema. Whichever migration runs first wins, potentially leaving the schema in an inconsistent state.
- **Fix:** Consolidate into a single migration file. Remove the duplicate.
- **Effort:** Low

### [H-003] tournament_scores, tournament_draws, and tv_announcements tables have no RLS policies
- **Category:** Database / Security
- **Files:**
  - `supabase/migrations/20260311_tournament_scores.sql`
  - `supabase/migrations/20260311_draw_style.sql`
  - `supabase/migrations/20260311_tv_announcements.sql`
- **Description:** These tables do not have `ENABLE ROW LEVEL SECURITY` or any policies. With Supabase, this means the anon key can read/write all rows if RLS is not enabled.
- **Impact:** Any unauthenticated user with the anon key can read/modify tournament scores, draw assignments, and TV announcements.
- **Fix:** Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and appropriate SELECT/INSERT/UPDATE/DELETE policies.
- **Effort:** Medium

### [H-004] club_memberships has no UPDATE/DELETE RLS policies -- members cannot be managed
- **Category:** Database
- **File:** `supabase/migrations/20260311_club_memberships.sql:177-183`
- **Description:** The table has SELECT and INSERT policies but no UPDATE or DELETE policies. Club admins cannot change member roles, approve pending members, or remove members via RLS-protected queries.
- **Impact:** Club membership management is broken for any operations that go through RLS (client-side queries).
- **Fix:** Add UPDATE and DELETE policies for club owners/admins.
- **Effort:** Low

### [H-005] Bookings GET endpoint has no authentication -- leaks booking data
- **Category:** Backend / Security
- **File:** `src/app/api/bookings/route.ts:4-20`
- **Description:** The GET handler for `/api/bookings` has no auth check. Anyone can query all court bookings, including player IDs and scheduling details.
- **Impact:** Booking data is publicly accessible.
- **Fix:** Add auth check at the top of the GET handler.
- **Effort:** Low

### [H-006] Admin nav sidebar lists pages that don't exist or are duplicated
- **Category:** Frontend
- **File:** `src/app/admin/layout.tsx:5-15`
- **Description:** The admin nav includes links to `/admin/venues` and `/admin/venue` (singular) as separate items. There are also admin pages (`/admin/analytics`, `/admin/reports`, `/admin/insurance`, `/admin/claims`, `/admin/branding`, `/admin/kiosk-settings`) that exist as page files but are not in the nav.
- **Impact:** Users cannot discover all admin features. The venues/venue distinction is confusing.
- **Fix:** Add all admin pages to the nav. Clarify venue vs venues distinction or merge them.
- **Effort:** Low

### [H-007] club_events RLS policy uses players.id instead of players.user_id for admin check
- **Category:** Database
- **File:** `supabase/migrations/20260311_club_events.sql:136-142`
- **Description:** The "Admins can manage club events" policy checks `WHERE players.id = auth.uid()`. But `auth.uid()` returns the auth UID, while `players.id` is the player UUID. These are different values, so the policy will never match, and no admin can create/update/delete club events.
- **Impact:** Club event management is broken through RLS.
- **Fix:** Change to `WHERE players.user_id = auth.uid()`.
- **Effort:** Low

### [H-008] Middleware public paths don't include all public API routes
- **Category:** Integration
- **File:** `src/lib/supabase/middleware.ts:36-47`
- **Description:** The middleware allows unauthenticated access to some routes (e.g., `/api/clubs`, `/api/shop/products`, `/api/stats/leaderboard`) but several other public-facing API routes are not listed:
  - `/api/waitlist/status` (checked from public waitlist page)
  - `/api/clubs/[state]` (club directory by state)
  - `/api/clubs/info` (club badge component)
  - `/api/clubs/contacts` (club contact info)
  - `/api/bowls/tournament` (public tournament list)
  - `/api/tv/announcements` (TV dashboard is public)
  - `/api/search` (global search)
- **Impact:** These API routes will redirect unauthenticated users to login, breaking public pages that depend on them.
- **Fix:** Add the missing API routes to the publicPaths array, or use a pattern match like `/api/clubs/*` for entire route groups.
- **Effort:** Low

### [H-009] Stripe webhook uses anon-key client instead of service role
- **Category:** Backend
- **File:** `src/app/api/stripe/webhook/route.ts:25`
- **Description:** The Stripe webhook handler calls `createClient()` which creates a server client with the anon key. Webhook handlers have no user session, so any RLS-protected tables (like `subscriptions`) will fail to write. The handler should use the service role key to bypass RLS.
- **Impact:** Subscription status updates from Stripe webhooks silently fail. Users pay but their subscription status is never updated.
- **Fix:** Use `createServiceRoleClient()` instead of `createClient()` in webhook handlers.
- **Effort:** Low

### [H-010] Shop order metadata mismatch -- webhook checks for "shop" but checkout sets "lawnbowl-shop"
- **Category:** Backend
- **File:** `src/app/api/stripe/webhook/route.ts:32` vs `src/app/api/shop/checkout/route.ts:96`
- **Description:** The checkout route sets `metadata.source = "lawnbowl-shop"` but the webhook handler checks `session.metadata?.source === "shop"`. These don't match, so shop orders will never trigger Printify fulfillment.
- **Impact:** Shop orders are charged but never fulfilled through Printify.
- **Fix:** Align the metadata source values (use "shop" in both places, or "lawnbowl-shop" in both).
- **Effort:** Low

### [H-011] CSV export vulnerable to injection
- **Category:** Backend / Security
- **File:** `src/app/api/admin/export/route.ts:19-21`
- **Description:** Player names are wrapped in double quotes but not escaped. If a player name contains `"` or `,`, the CSV will be malformed. If it contains `=`, `+`, `-`, or `@`, it could trigger formula injection when opened in Excel.
- **Impact:** Malformed CSV exports; potential spreadsheet formula injection.
- **Fix:** Properly escape CSV values (double any `"` characters, strip formula-triggering prefixes).
- **Effort:** Low

### [H-012] Player onboarding fields migration has no column for `preferred_hand` used in TypeScript
- **Category:** Database
- **File:** `supabase/migrations/20260312_player_onboarding_fields.sql` vs `src/lib/db/players.ts:18`
- **Description:** The `PlayerProfile` TypeScript type includes `preferred_hand: PreferredHand | null` but no migration adds this column to the players table.
- **Impact:** Queries selecting `preferred_hand` will fail or return null.
- **Fix:** Add `ALTER TABLE players ADD COLUMN IF NOT EXISTS preferred_hand TEXT CHECK (preferred_hand IN ('left', 'right', 'ambidextrous'));` to a migration.
- **Effort:** Low

---

## Medium Issues

### [M-001] No loading.tsx for most routes -- poor perceived performance
- **Category:** Frontend
- **Description:** Only `src/app/board/loading.tsx` and `src/app/profile/loading.tsx` have loading states. High-traffic routes like `/bowls`, `/clubs`, `/schedule`, `/teams`, `/tournament`, `/admin/*`, `/pennant/*` have no loading.tsx, causing blank flashes during navigation.
- **Impact:** Poor user experience, especially on slow connections.
- **Fix:** Add loading.tsx files with skeleton UIs for key routes.
- **Effort:** Medium

### [M-002] No error.tsx for most routes -- errors show generic fallback
- **Category:** Frontend
- **Description:** Only the root `src/app/error.tsx` and `src/app/global-error.tsx` exist. No route-specific error boundaries. A crash in any page shows the root error page, losing context.
- **Impact:** Users lose navigation context on errors. No route-specific recovery options.
- **Fix:** Add error.tsx to key route groups: `/admin/error.tsx`, `/bowls/error.tsx`, `/clubs/error.tsx`, etc.
- **Effort:** Medium

### [M-003] Login/signup forms have minimal validation
- **Category:** Frontend
- **File:** `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- **Description:** Login only checks for empty fields (implicitly via Supabase). Signup checks for name but has no password strength requirements, no email format validation, and no confirmation password field.
- **Impact:** Users can set weak passwords. No client-side feedback for invalid email format.
- **Fix:** Add email regex validation, minimum password length (8+ chars), and optional confirm password field.
- **Effort:** Low

### [M-004] Events page uses hardcoded mock data instead of database
- **Category:** Frontend
- **File:** `src/app/events/page.tsx`
- **Description:** The events page defines a static `ClubEvent` interface and likely uses hardcoded data rather than fetching from the `club_events` table. The page calls `/api/profile` but not any events endpoint.
- **Impact:** Events page shows stale/fake data instead of real club events from the database.
- **Fix:** Replace with `fetch('/api/clubs/events')` call using the actual database.
- **Effort:** Medium

### [M-005] Missing env vars in .env.example
- **Category:** Integration
- **File:** `.env.example`
- **Description:** The `.env.example` file only lists 5 variables but the codebase references 15+ environment variables:
  - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PREMIUM_PRICE_ID`, `STRIPE_VENUE_OWNER_PRICE_ID`
  - `STRIPE_MEMBERSHIP_MONTHLY_PRICE_ID`, `STRIPE_MEMBERSHIP_ANNUAL_PRICE_ID`, `STRIPE_MEMBERSHIP_WEBHOOK_SECRET`
  - `PRINTIFY_API_KEY`, `PRINTIFY_API_TOKEN`, `PRINTIFY_SHOP_ID`, `PRINTIFY_WEBHOOK_SECRET`
  - `EMAIL_API_KEY`, `ADMIN_EMAILS`, `ADMIN_SEED_SECRET`
  - `CRON_SECRET`, `PARTNER_REQUEST_TIMEOUT_MINUTES`
- **Impact:** New developers cannot set up the project without hunting through code for env vars.
- **Fix:** Add all env vars to `.env.example` with placeholder values and comments.
- **Effort:** Low

### [M-006] Two separate club member systems -- `club_members` and `club_memberships`
- **Category:** Database
- **Files:** `supabase/migrations/20260311_club_members.sql`, `supabase/migrations/20260311_club_memberships.sql`
- **Description:** Two tables track club membership with overlapping purposes:
  - `club_members`: roles = member/officer/captain/coach/social_coordinator, status = active/inactive/pending
  - `club_memberships`: roles = owner/admin/manager/member/visitor, status = active/pending/suspended
  Both have `UNIQUE(club_id, player_id)`. Code uses both tables in different places.
- **Impact:** Confusing data model. A player might be in one table but not the other. Queries may miss members.
- **Fix:** Consolidate into a single table with a unified role system.
- **Effort:** High

### [M-007] Blog page likely has no real content system
- **Category:** Frontend
- **File:** `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`
- **Description:** Blog pages exist but `blog_posts` table is not in any migration. The codebase has `src/lib/blog-posts.ts` and `src/lib/blog-posts-new.ts` which likely contain hardcoded content.
- **Impact:** Blog cannot be dynamically managed. Content is baked into the codebase.
- **Fix:** Create a `blog_posts` table or integrate a headless CMS. Low priority if static content is acceptable.
- **Effort:** Medium

### [M-008] Realtime subscription cleanup not guaranteed
- **Category:** Frontend
- **Description:** Multiple components use Supabase realtime subscriptions (e.g., `useRealtimePlayers`, `useTeamChat`). If components unmount during an async operation, subscriptions may not be properly cleaned up.
- **Impact:** Memory leaks and stale subscriptions on long-running sessions.
- **Fix:** Audit all realtime hooks for proper cleanup in useEffect return functions. Add abort controllers.
- **Effort:** Medium

### [M-009] Kiosk mode pages are public but contain admin actions
- **Category:** Frontend / Security
- **File:** `src/app/kiosk/page.tsx`, `src/app/kiosk/bowls/page.tsx`
- **Description:** Kiosk pages are listed as public in middleware (`/kiosk`). However, kiosk components include `AdminPinModal` which suggests admin operations. The public access combined with admin functionality is a security concern.
- **Impact:** Kiosk admin actions might be accessible without proper authentication.
- **Fix:** Verify that admin-level kiosk actions require the PIN and that the PIN check is server-validated.
- **Effort:** Medium

### [M-010] club_events.club_id is TEXT but clubs.id is UUID
- **Category:** Database
- **File:** `supabase/migrations/20260311_club_events.sql:109`
- **Description:** `club_events.club_id` is defined as `TEXT NOT NULL` with no foreign key, while `clubs.id` is `UUID`. This prevents referential integrity and makes joins unreliable if the text value doesn't match the UUID format.
- **Impact:** Potential data integrity issues. Events could reference non-existent clubs.
- **Fix:** Change to `club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE`.
- **Effort:** Low

### [M-011] visit_requests.club_id is TEXT but clubs.id is UUID
- **Category:** Database
- **File:** `supabase/migrations/20260311_visit_requests.sql:693`
- **Description:** Same issue as club_events -- `club_id TEXT NOT NULL` instead of UUID with foreign key.
- **Impact:** No referential integrity for visit requests.
- **Fix:** Change to `club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE`.
- **Effort:** Low

### [M-012] noticeboard_posts.club_id is TEXT while it should be UUID
- **Category:** Database
- **File:** `supabase/migrations/20260311_noticeboard.sql:488`
- **Description:** `club_id text` without a foreign key reference to clubs.
- **Impact:** Data integrity gap.
- **Fix:** Change to UUID with FK reference.
- **Effort:** Low

### [M-013] Admin claims page exists but not in admin nav
- **Category:** Frontend
- **File:** `src/app/admin/claims/page.tsx`
- **Description:** The admin claims management page exists as a route but is not linked from the admin sidebar navigation in `src/app/admin/layout.tsx`.
- **Impact:** Admin cannot discover the claims management feature through normal navigation.
- **Fix:** Add `{ href: "/admin/claims", label: "Claims" }` to the navItems array.
- **Effort:** Low

### [M-014] visit_requests RLS policy has broken auth.uid() comparison
- **Category:** Database
- **File:** `supabase/migrations/20260311_visit_requests.sql:720`
- **Description:** The SELECT policy uses `auth.uid() = player_id::text::uuid`. This double-cast (UUID to TEXT to UUID) is unnecessary and fragile. The player_id is a UUID referencing players(id), but auth.uid() returns the auth user UUID, which is a different value. The comparison will never match because player_id is the player's UUID, not the auth user's UUID.
- **Impact:** Players cannot read their own visit requests through RLS.
- **Fix:** Change to use a subquery: `player_id = (SELECT id FROM players WHERE user_id = auth.uid())`.
- **Effort:** Low

---

## Low Issues

### [L-001] Two Printify client libraries exist
- **Category:** Backend
- **Files:** `src/lib/printify.ts`, `src/lib/shop/printify.ts`
- **Description:** Two separate files implement Printify API clients with different env var names (`PRINTIFY_API_KEY` vs `PRINTIFY_API_TOKEN`). This creates confusion about which one is authoritative.
- **Impact:** Maintenance burden. Potential for using wrong credentials.
- **Fix:** Consolidate into a single Printify client module.
- **Effort:** Low

### [L-002] No PWA service worker precaching for offline support
- **Category:** Integration
- **File:** `src/app/sw.ts`, `src/app/offline/page.tsx`
- **Description:** The offline page exists and the service worker route is registered, but there's no evidence of precaching critical assets. The offline experience is likely just the offline page without cached app shell.
- **Impact:** Minimal offline functionality despite having PWA infrastructure.
- **Fix:** Configure serwist/workbox to precache the app shell, key pages, and static assets.
- **Effort:** Medium

### [L-003] Multiple duplicate migration patterns for the same columns
- **Category:** Database
- **Files:** `20260311_tournament_club_id.sql` and `20260311_multi_club_scoping.sql`
- **Description:** Both migrations add `club_id` to the tournaments table with `ADD COLUMN IF NOT EXISTS`. While safe due to idempotency, it indicates disorganized migration management.
- **Impact:** Technical debt. Confusion about which migration is canonical.
- **Fix:** Consolidate duplicate migrations during a cleanup pass.
- **Effort:** Low

### [L-004] PlayerProfile type in db/players.ts differs from Player type in types.ts
- **Category:** Frontend
- **Files:** `src/lib/db/players.ts:11-26`, `src/lib/types.ts:24-44`
- **Description:** Two different TypeScript interfaces describe a player: `PlayerProfile` (with `user_id`, `preferred_hand`, `years_experience`) and `Player` (with `preferred_position`, `years_playing`, `experience_level`). Components import from different sources.
- **Impact:** Type confusion. Fields may not match actual database columns.
- **Fix:** Create a single source of truth for the Player type.
- **Effort:** Medium

### [L-005] Contact page has no form submission
- **Category:** Frontend
- **File:** `src/app/contact/page.tsx`
- **Description:** The contact page exists with styling but the form may not actually submit anywhere (no API route for contact form submissions was found).
- **Impact:** Users cannot submit contact inquiries through the app.
- **Fix:** Add a contact form API route or use a third-party service (e.g., Formspree).
- **Effort:** Low

### [L-006] The `bowls_checkins` table is referenced in migrations but base CREATE TABLE is missing
- **Category:** Database
- **File:** `supabase/migrations/20260311_checkin_source.sql:46`
- **Description:** The migration alters `bowls_checkins` to add a column, but no migration creates the base table.
- **Impact:** Migration will fail on a fresh database if run in isolation.
- **Fix:** Ensure the base table creation is in the initial migration.
- **Effort:** Low

### [L-007] club_members_roster RLS is too permissive for writes
- **Category:** Database / Security
- **File:** `supabase/migrations/20260311_club_members_roster.sql:221-225`
- **Description:** INSERT and UPDATE policies allow any authenticated user to manage roster members (`auth.uid() IS NOT NULL`). This means any logged-in user can modify any club's roster.
- **Impact:** Any user can add/edit members in any club's roster.
- **Fix:** Restrict to club admins/managers using a membership check.
- **Effort:** Low

### [L-008] Search API route not in middleware public paths
- **Category:** Integration
- **File:** `src/lib/supabase/middleware.ts`
- **Description:** The `/api/search` route is used by the `GlobalSearch` component which appears in the main nav. If an unauthenticated user tries to use search, the API call will redirect to login.
- **Impact:** Search is non-functional for logged-out users browsing public pages.
- **Fix:** Add `/api/search` to public paths if search should work for anonymous users.
- **Effort:** Low

---

## Architecture Notes

### Tables with RLS enabled and policies defined (verified)
- `clubs` (implied by migrations)
- `club_claim_requests` -- has RLS + policies (depends on missing `is_own_player` function)
- `club_members` -- has RLS + policies (depends on missing `is_own_player` function)
- `club_memberships` -- has RLS + policies (missing UPDATE/DELETE)
- `club_events` -- has RLS + policies (broken admin check)
- `club_members_roster` -- has RLS + policies (overly permissive)
- `green_conditions` -- has RLS + policies
- `bowls_position_ratings` / `bowls_rating_history` -- has RLS + policies
- `noticeboard_posts` / `noticeboard_reactions` / `noticeboard_comments` -- has RLS + policies
- `notification_preferences` -- has RLS (implied)
- `visit_requests` -- has RLS + policies (broken auth comparison)

### Tables WITHOUT RLS (security risk)
- `tournament_scores`
- `tournament_draws`
- `tv_announcements`
- All ~20 tables missing from migrations (unknown RLS status)

### Environment Variables Summary
| Variable | In .env.example | Used In Code |
|----------|----------------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Yes |
| NEXT_PUBLIC_APP_URL | Yes | Yes |
| EMAIL_FROM | Yes | Yes |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | Yes | Yes |
| VAPID_PRIVATE_KEY | Yes | Yes |
| STRIPE_SECRET_KEY | No | Yes |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | No | Yes |
| STRIPE_WEBHOOK_SECRET | No | Yes |
| STRIPE_PREMIUM_PRICE_ID | No | Yes |
| STRIPE_VENUE_OWNER_PRICE_ID | No | Yes |
| STRIPE_MEMBERSHIP_MONTHLY_PRICE_ID | No | Yes |
| STRIPE_MEMBERSHIP_ANNUAL_PRICE_ID | No | Yes |
| STRIPE_MEMBERSHIP_WEBHOOK_SECRET | No | Yes |
| PRINTIFY_API_KEY | No | Yes |
| PRINTIFY_API_TOKEN | No | Yes |
| PRINTIFY_SHOP_ID | No | Yes |
| PRINTIFY_WEBHOOK_SECRET | No | Yes |
| EMAIL_API_KEY | No | Yes |
| ADMIN_EMAILS | No | Yes |
| ADMIN_SEED_SECRET | No | Yes |
| CRON_SECRET | No | Yes |
| PARTNER_REQUEST_TIMEOUT_MINUTES | No | Yes |
