-- DEPRECATED: Admin seeding is now automated via the ADMIN_EMAILS env var.
--
-- How it works:
--   1. Set ADMIN_EMAILS=user@example.com in your .env.local
--   2. When that user signs up, they are auto-promoted to admin
--   3. For existing users, call: POST /api/admin/seed
--
-- Manual fallback (run in Supabase SQL Editor):
UPDATE players
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
