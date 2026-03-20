# Database Migration Report — 2026-03-12

**Project:** Lawnbowling
**Target:** Production Supabase (`fcwlrvjnmzoszjwmbyfl`)
**PostgreSQL:** 17.6
**Linear:** AI-2449

---

## Migration Results

| # | Migration File | Status | Notes |
|---|---------------|--------|-------|
| 1 | `20260312_is_own_player_function.sql` | PASS | `is_own_player()` function created, granted to `authenticated` |
| 2 | `20260312_missing_tables.sql` | PASS | Created `shop_orders`, `subscriptions`, `staff_invitations` with RLS + policies |
| 3 | `20260312_player_preferred_hand.sql` | PASS | Added `preferred_hand` column to `players` |
| 4 | `20260312_player_onboarding_fields.sql` | PASS | Added onboarding columns: `preferred_position`, `years_playing`, `experience_level`, `bio`, `home_club_name`, `bowling_formats`, `onboarding_completed` |
| 5 | `20260312_membership_tiers.sql` | PASS | Added `membership_tier`, `membership_expires_at`, `stripe_customer_id`, `stripe_subscription_id` to `players` |
| 6 | `20260312_notification_preferences.sql` | PASS | Added notification preference columns + RLS policies |
| 7 | `20260312_noticeboard_post_types.sql` | SKIP | Table `noticeboard_posts` does not exist yet |
| 8 | `20260312_enable_rls_missing_tables.sql` | SKIP | Tables `tournament_scores`, `tournament_draws`, `tv_announcements` do not exist yet |
| 9 | `20260312_fix_club_events_rls.sql` | SKIP | Table `club_events` does not exist yet |
| 10 | `20260312_fix_visit_requests_rls.sql` | SKIP | Table `visit_requests` does not exist yet |
| 11 | `20260312_triggers.sql` | PASS | All trigger functions created; triggers applied to existing tables |
| 12 | `20260312_pg_cron_jobs.sql` | PASS | `pg_cron` + `pg_net` extensions enabled; 5 cron jobs scheduled |

**Result: 8/12 applied, 4/12 skipped (target tables not yet created)**

---

## Verification: Extensions

| Extension | Version | Status |
|-----------|---------|--------|
| pg_cron | 1.6.4 | Enabled |
| pg_net | 0.19.5 | Enabled |

## Verification: Cron Jobs

| Job Name | Schedule | Status |
|----------|----------|--------|
| expire-partner-requests | `*/2 * * * *` (every 2 min) | Scheduled |
| expire-visit-requests | `0 * * * *` (hourly) | Scheduled |
| cancel-stale-tournaments | `0 3 * * *` (daily 3am UTC) | Scheduled |
| prune-activity-feed | `0 4 * * 0` (weekly Sun 4am) | Scheduled |
| expire-staff-invitations | `0 5 * * *` (daily 5am UTC) | Scheduled |

## Verification: Triggers

| Trigger | Table | Timing | Event |
|---------|-------|--------|-------|
| trg_update_player_stats | matches | AFTER | UPDATE |
| trg_activity_on_match_complete | matches | AFTER | UPDATE |
| trg_set_updated_at | notification_preferences, partner_stats, player_stats, players, shop_orders, subscriptions, teams, waiver_templates | BEFORE | UPDATE |
| trg_audit | players, staff_invitations, subscriptions | AFTER | INSERT/UPDATE/DELETE |

## Verification: New Tables

| Table | RLS | Policies |
|-------|-----|----------|
| shop_orders | Enabled | Users view own + service role full access |
| subscriptions | Enabled | Users view own + service role full access |
| staff_invitations | Enabled | Club admins manage + service role full access |
| audit_log | Enabled | Admins view + service role full access |

## Verification: New Player Columns

All 12 new columns confirmed on `players` table: `preferred_hand`, `preferred_position`, `years_playing`, `experience_level`, `bio`, `home_club_name`, `bowling_formats`, `onboarding_completed`, `membership_tier`, `membership_expires_at`, `stripe_customer_id`, `stripe_subscription_id`.

---

## Skipped Migrations — Action Required

The following 4 migrations must be re-applied once the prerequisite tables are created:

1. **`20260312_noticeboard_post_types.sql`** — Requires `noticeboard_posts` table
2. **`20260312_enable_rls_missing_tables.sql`** — Requires `tournament_scores`, `tournament_draws`, `tv_announcements` tables
3. **`20260312_fix_club_events_rls.sql`** — Requires `club_events` table
4. **`20260312_fix_visit_requests_rls.sql`** — Requires `visit_requests` table

**Note:** The `expire-visit-requests` and `cancel-stale-tournaments` cron jobs reference tables (`visit_requests`, `tournaments`) that don't exist yet. These jobs will silently fail until those tables are created — no data corruption risk.

---

## Functional Testing

Functional tests (match completion → player_stats update, check-in → activity_feed) cannot be fully verified without the application running and user accounts. The triggers are in place and will activate when the relevant operations occur through the app.
