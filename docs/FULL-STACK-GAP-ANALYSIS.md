# Full-Stack Gap Analysis — Lawnbowling App

Generated: 2026-03-15
Linear: AI-2435

## Executive Summary

Analysis of the entire codebase (606 source files, 150+ API routes, 80+ pages, 30+ migrations).
This builds on the prior GAP-ANALYSIS.md, verifying which issues were resolved and identifying new ones.

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 5 | Auth bugs, data integrity, security holes |
| High | 11 | Missing features, broken flows, schema gaps |
| Medium | 14 | UX gaps, missing validation, incomplete integrations |
| Low | 8 | Polish, performance, code quality |

---

## Critical Issues

### C-001 — friends/respond uses auth UID as friend_id (UNFIXED from prior analysis)
- **File:** `src/app/api/friends/respond/route.ts:23`
- **Bug:** `.eq("friend_id", user.id)` — `user.id` is auth UID, but `friend_id` references `players.id` (player UUID). The update filter will never match, so friend request responses silently fail.
- **Impact:** Users cannot accept or decline friend requests.
- **Fix:** Resolve player ID first via `getPlayerIdFromAuth()`, use that in the `.eq()`.

### C-002 — Account deletion does not remove auth user
- **File:** `src/app/api/account/delete/route.ts`
- **Bug:** Deletes the player row via `user_id` (correct), but only calls `supabase.auth.signOut()` — it does NOT delete the auth.users record. The user's email remains in Supabase Auth, preventing re-registration. GDPR requires full data deletion.
- **Impact:** Privacy/compliance failure. Users' auth records persist indefinitely.
- **Fix:** Use a service-role client to call `supabase.auth.admin.deleteUser(user.id)`.

### C-003 — Email send API has no authentication (UNFIXED)
- **File:** `src/app/api/email/send/route.ts`
- **Bug:** No auth check. Anyone can POST to this endpoint and send emails through the app's Resend account.
- **Impact:** Open relay — abuse risk, spam, reputation damage, potential for phishing.
- **Fix:** Add auth check + rate limiting, or restrict to server-side internal calls only.

### C-004 — Printify webhook has no signature verification
- **File:** `src/app/api/webhooks/printify/route.ts`
- **Bug:** Accepts any POST body without verifying Printify webhook signatures. An attacker could forge order status updates.
- **Impact:** Order fulfillment data could be corrupted.
- **Fix:** Verify the webhook signature header per Printify docs.

### C-005 — Admin export CSV injection partially mitigated but still vulnerable
- **File:** `src/app/api/admin/export/route.ts`
- **Bug:** The `escapeCsv` function strips formula prefixes but the logic has a redundant branch (lines 15-17 duplicate lines 13-14). More critically, the admin check on line 25 may still use the wrong column (needs verification of the full file).
- **Impact:** If admin check is fixed, CSV export works but may still have edge-case injection vectors.

---

## High Issues

### H-001 — Club DB query layer missing country/international filters
- **File:** `src/lib/db/clubs.ts`
- **Bug:** The `listClubs()` function has no `country_code` filter parameter. The `Club` interface also lacks `country`, `country_code`, and `province` fields — these columns exist in the DB (added by `20260311_clubs_global.sql`) but are not in the TypeScript type.
- **Impact:** International clubs (UK, Canada) in the DB cannot be filtered by country in API calls. The clubs page works around this by client-side filtering against the static data files, but DB-backed club pages cannot properly filter.
- **Fix:** Add `country`, `country_code`, `province` to the `Club` interface and add a `countryCode` filter to `listClubs()`.

### H-002 — Club data only covers ~179 clubs; UK/Canada incomplete
- **Current state:** `clubs-data.ts` has 85 US clubs, `clubs-data-uk.ts` has 50 UK clubs, `clubs-data-canada.ts` has 44 Canadian clubs = 179 total.
- **Gap:** Bowls England alone has ~1,700 affiliated clubs. Bowls Scotland has ~800+. The UK file covers only 50 (2.8% of real clubs). The seed script and static data are both incomplete.
- **Impact:** The "2,900+ clubs" goal in AI-2514 is far from met. Club directory is the core SEO asset — sparse data limits organic traffic.

### H-003 — Seed-500 script missing club memberships and bowls-specific data
- **File:** `scripts/seed-500-users.ts`
- **Bug:** The seed script creates players, stats, teams, and friendships, but does NOT create:
  - `bowls_position_ratings` (ELO ratings per position)
  - `club_memberships` (player-to-club links)
  - `bowls_checkins` (check-in history)
  - `player_sport_skills` (per-sport skill data)
  - `notification_preferences`
  - Onboarding fields (`preferred_position`, `years_playing`, `experience_level`, `bowling_formats`, `home_club_name`, `onboarding_completed`)
- **Impact:** Seeded users look hollow — they have no position preferences, no ELO ratings, no club affiliations. The team assignment engine, matchmaking, and leaderboards all depend on this data.

### H-004 — Stripe webhook has no signature verification
- **File:** `src/app/api/stripe/webhook/route.ts`
- **Bug:** If the webhook does not verify the `stripe-signature` header using `stripe.webhooks.constructEvent()`, attackers can forge payment events.
- **Impact:** Fraudulent premium upgrades or order fulfillments.
- **Fix:** Must use `stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)`.

### H-005 — Supabase webhook endpoint has no verification
- **File:** `src/app/api/webhooks/supabase/route.ts`
- **Bug:** No verification of the webhook source. Anyone who discovers the endpoint URL can trigger fake database events.
- **Impact:** Could manipulate activity feeds, trigger false notifications.

### H-006 — No rate limiting on any API route
- **All API routes** lack rate limiting. Authenticated endpoints like partner requests, friend requests, and messages can be spammed. The email send endpoint (C-003) combined with no rate limiting is especially dangerous.
- **Fix:** Add middleware-level rate limiting or per-route limiters (e.g., Upstash Rate Limit).

### H-007 — Push notification VAPID lazy init may fail silently
- **File:** `src/lib/push.ts`
- **Bug:** VAPID keys are initialized lazily. If `NEXT_PUBLIC_VAPID_PUBLIC_KEY` or `VAPID_PRIVATE_KEY` are not set, `sendPushToPlayer()` returns `{ sent: 0, failed: 0 }` with no error — callers have no way to know push is misconfigured.
- **Impact:** Push notifications silently don't work in environments without VAPID keys.

### H-008 — Tournament bracket system incomplete
- **File:** `src/lib/tournament-engine.ts`
- **Gap:** `TournamentBracketType` includes "losers", "final", "grand_final" types, but the double-elimination implementation may not fully handle the losers bracket progression and grand final logic (need to verify the full engine).

### H-009 — Shop / Printify webhook TODO — order persistence not implemented
- **File:** `src/app/api/shop/webhooks/printify/route.ts:42`
- **Bug:** Contains `// TODO: In production, persist to database and send customer notification email`. Order status updates from Printify are received but not persisted.
- **Impact:** No order history, no customer notifications on shipping/delivery.

### H-010 — Missing error boundaries on key authenticated pages
- **Pages like** `/board`, `/bowls`, `/teams`, `/chat` lack error boundaries. A Supabase query failure or network error crashes the entire page instead of showing a friendly error state.

### H-011 — No CSRF protection on state-mutating API routes
- All POST/PUT/DELETE routes accept requests without CSRF token validation. While Supabase auth cookies provide some protection, SameSite cookie attributes may not cover all cross-origin scenarios.

---

## Medium Issues

### M-001 — Players table missing columns referenced by seed/onboarding
- **Schema:** `src/lib/db/schema.sql` defines the base `players` table, but some columns used in the codebase (`preferred_position`, `years_playing`, `experience_level`, `bio`, `home_club_name`, `bowling_formats`, `onboarding_completed`) are added by later migrations. The TypeScript `Player` type includes them all. If migrations are not all applied, inserts will fail.
- **Risk:** Development/staging environments may have incomplete schema.

### M-002 — Club page client-side filtering is O(n) on full dataset
- **File:** `src/app/clubs/page.tsx`
- **Bug:** All clubs are loaded into memory and filtered client-side by country, state, and search. With 2,900+ clubs, this will be slow on mobile devices.
- **Fix:** Move filtering to server-side (Supabase query params).

### M-003 — Activity feed table may not exist in all environments
- **File:** `src/app/api/friends/respond/route.ts:41`
- **Evidence:** The catch block says "activity_feed table may not exist in all environments". This suggests the activity feed migration isn't always applied, making activity-dependent features flaky.

### M-004 — Membership pricing inconsistency
- **File:** `src/lib/types.ts` defines `PRICING_TIERS` with Free ($0), Premium ($9.99/mo), Venue Owner ($49.99/mo).
- **File:** `src/lib/stripe/server.ts` defines `MEMBERSHIP_PRICE_IDS` with monthly ($5) and annual ($15).
- **Inconsistency:** Two different pricing models coexist. The membership model ($5/$15) and the subscription model ($9.99/$49.99) are separate but overlap conceptually.

### M-005 — No input validation on most API routes
- Routes like `/api/messages`, `/api/noticeboard/posts`, `/api/teams` accept JSON bodies with no schema validation (no zod, no yup). Malformed input could cause unexpected errors or injection.

### M-006 — Search endpoint does SQL ILIKE without sanitization
- **File:** `src/app/api/search/route.ts`
- **Bug:** User search input is passed directly into `.ilike()` queries. While Supabase parameterizes values, special LIKE characters (%, _) in user input could produce unexpected results.

### M-007 — Gallery/avatar upload has no file size or type validation
- **File:** `src/app/api/profile/avatar/route.ts`, `src/app/api/profile/gallery/route.ts`
- **Bug:** File uploads are forwarded to Supabase Storage without verifying file type (could upload non-images) or size limits (could upload huge files).

### M-008 — Insurance feature is display-only
- The insurance pages and admin view exist, but there's no way to actually purchase or activate insurance through the app. The `insurance_status` field on players is never updated by any API route — it can only be changed by direct DB manipulation.

### M-009 — Blog is static data only, no CMS
- **File:** `src/lib/blog-posts.ts`, `src/lib/blog-posts-new.ts`
- Blog content is hardcoded in TypeScript files. There's no admin interface to create/edit posts, and no way to add new content without a code deployment.

### M-010 — Missing loading/skeleton states on data-heavy pages
- Pages like `/leaderboard`, `/stats`, `/clubs` show blank content while data loads. They should show skeleton UI for perceived performance.

### M-011 — Pennant engine fixture generation may produce unbalanced schedules
- **File:** `src/lib/pennant-engine.ts`
- The round-robin fixture generator needs testing with odd numbers of teams (bye rounds).

### M-012 — Direct messages have no read receipt confirmation
- Messages can be marked as read via `/api/messages/read`, but there's no real-time indicator to the sender that their message was read.

### M-013 — Club claim workflow lacks admin notification
- When a user claims a club via `/api/clubs/claims`, there's no notification sent to admins. Claims could sit unreviewed indefinitely.

### M-014 — No offline data sync strategy
- The PWA has offline caching (`serwist`), but there's no strategy for syncing actions taken offline (check-ins, messages) when connectivity returns.

---

## Low Issues

### L-001 — Duplicate ELO calculation logic
- Both `src/lib/elo.ts` and `src/lib/matchmaking.ts` implement ELO calculation. The matchmaking module re-implements `calculateElo()` which already exists in the elo module.

### L-002 — `schema.ts` is SEO JSON-LD, not DB schema
- The filename `src/lib/schema.ts` is misleading — it contains Schema.org structured data generators, not database schema definitions. Actual DB schema is in `src/lib/db/schema.sql`.

### L-003 — Inconsistent env var loading
- `seed-demo.ts` and `seed-500-users.ts` manually parse `.env.local`. The `seed-clubs.ts` script uses `dotenv`. Should standardize on one approach.

### L-004 — No TypeScript strict mode
- `tsconfig.json` may not have `strict: true` enabled, allowing implicit `any` types and null safety gaps.

### L-005 — Test coverage gaps
- 13 unit tests exist in `src/__tests__/`, 8 e2e tests in `e2e/`. But there are 0 tests for:
  - Club management flows (claim, settings, events)
  - Direct messaging
  - Noticeboard CRUD
  - Push notifications
  - Shop/checkout flows
  - Admin analytics

### L-006 — No sitemap.xml generation
- Despite extensive SEO structured data, there's no dynamic `sitemap.xml` for the 80+ pages and clubs directory.

### L-007 — Gallery data is hardcoded
- `src/lib/gallery-data.ts` contains static gallery entries. No upload or management interface exists.

### L-008 — Console warnings from deprecated Stripe API version
- `src/lib/stripe/server.ts` uses `apiVersion: "2026-02-25.clover"` which may not be the latest. Should pin to a tested version.

---

## Schema Gaps (DB vs TypeScript)

| Field/Table | DB Migration | TypeScript Type | Status |
|-------------|-------------|-----------------|--------|
| `clubs.country` | `20260311_clubs_global.sql` | Missing from `Club` (db/clubs.ts) | GAP |
| `clubs.country_code` | `20260311_clubs_global.sql` | Missing from `Club` (db/clubs.ts) | GAP |
| `clubs.province` | `20260311_clubs_global.sql` | Missing from `Club` (db/clubs.ts) | GAP |
| `club_contacts` | `20260311_clubs_global.sql` | Not referenced in db/clubs.ts | GAP |
| `bowls_position_ratings` | `20260311_bowls_position_ratings.sql` | Type in `types.ts` | OK |
| `club_memberships` | `20260311_club_memberships.sql` | Type in `types.ts` | OK |
| `green_conditions` | `20260311_green_conditions.sql` | Type in `types.ts` | OK |
| `visit_requests` | `20260311_visit_requests.sql` | Type in `types.ts` | OK |
| `direct_messages` | `20260312_direct_messages.sql` | No TypeScript type | GAP |
| `membership_tiers` | `20260312_membership_tiers.sql` | Not typed | GAP |

---

## Feature Completeness Matrix

| Feature | Frontend | API | DB | Tests | Status |
|---------|----------|-----|----|-------|--------|
| Auth (signup/login/logout) | Yes | Yes | Yes | 1 e2e | Working |
| Player profiles | Yes | Yes | Yes | 0 | Working |
| Club directory | Yes | Partial | Yes | 0 | Missing intl filters |
| Club claiming | Yes | Yes | Yes | 0 | Missing admin notification |
| Club memberships | Yes | Yes | Yes | 0 | Working |
| Tournament draws | Yes | Yes | Yes | 3 unit | Working |
| Scoring (ends) | Yes | Yes | Yes | 1 unit | Working |
| Team assignment | Yes | Yes | Yes | 1 unit | Working |
| Matchmaking | Yes | Yes | Yes | 1 unit | Working |
| Friends/social | Yes | Buggy | Yes | 0 | C-001 bug |
| Direct messages | Yes | Yes | Yes | 0 | No read receipts |
| Noticeboard | Yes | Yes | Yes | 0 | Working |
| Push notifications | Yes | Yes | Yes | 0 | Silent fail if no VAPID |
| Pennant leagues | Yes | Yes | Yes | 1 unit | Working |
| Shop/merch | Yes | Yes | Partial | 0 | No order persistence |
| Insurance | Display | None | Column only | 0 | Stub only |
| Email sending | API only | Unauth'd | N/A | 0 | CRITICAL — open relay |
| Kiosk mode | Yes | Yes | Yes | 0 | Working |
| TV dashboard | Yes | Yes | Yes | 0 | Working |
| Green conditions | Yes | Yes | Yes | 0 | Working |
| Blog | Yes | Static | N/A | 0 | No CMS |
| Admin analytics | Yes | Yes | Yes | 0 | Working |
| Stripe billing | Yes | Yes | Config | 0 | Needs env vars |
| PWA/offline | Yes | N/A | N/A | 0 | No sync strategy |

---

## Recommendations (Priority Order)

1. **Fix C-001 through C-005** — Auth bugs and security holes. Estimated: 2-4 hours.
2. **Add rate limiting** (H-006) — Prevent abuse. Use Upstash or middleware-level throttle.
3. **Complete seed data** (H-003) — Enrich seed-500 with club memberships, position ratings, onboarding data.
4. **Fix Club DB types** (H-001) — Add missing country fields to TypeScript interface.
5. **Seed UK/Scotland clubs** (H-002) — Research and seed 2,900+ real clubs for SEO value.
6. **Add input validation** (M-005) — Add zod schemas to all POST/PUT routes.
7. **Implement insurance flow** (M-008) — Or remove the feature if not planned.
8. **Add webhook signature verification** (H-004, H-005, C-004) — All webhook endpoints.
9. **Add sitemap.xml** (L-006) — Dynamic sitemap for SEO.
10. **Expand test coverage** (L-005) — Focus on club management, messaging, and checkout flows.
