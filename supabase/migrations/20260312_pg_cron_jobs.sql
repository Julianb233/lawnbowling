-- Enable pg_cron and pg_net extensions (Supabase supports these natively)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- SCHEDULED JOBS (pg_cron)
-- ============================================================

-- 1. Expire stale partner requests (every 2 minutes)
-- Replaces: Vercel cron /api/partner/expire
SELECT cron.schedule(
  'expire-partner-requests',
  '*/2 * * * *',
  $$
    UPDATE partner_requests
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at < now();
  $$
);

-- 2. Expire stale visit requests (every hour)
SELECT cron.schedule(
  'expire-visit-requests',
  '0 * * * *',
  $$
    UPDATE visit_requests
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at < now();
  $$
);

-- 3. Cancel stale tournaments (daily at 3am UTC)
-- Tournaments stuck in 'registration' more than 24 hours past start time
SELECT cron.schedule(
  'cancel-stale-tournaments',
  '0 3 * * *',
  $$
    UPDATE tournaments
    SET status = 'cancelled'
    WHERE status = 'registration'
      AND starts_at < now() - interval '24 hours';
  $$
);

-- 4. Prune old activity feed entries (weekly, Sunday 4am UTC)
-- Keep last 90 days of activity
SELECT cron.schedule(
  'prune-activity-feed',
  '0 4 * * 0',
  $$
    DELETE FROM activity_feed
    WHERE created_at < now() - interval '90 days';
  $$
);

-- 5. Expire stale staff invitations (daily at 5am UTC)
SELECT cron.schedule(
  'expire-staff-invitations',
  '0 5 * * *',
  $$
    UPDATE staff_invitations
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at < now();
  $$
);
