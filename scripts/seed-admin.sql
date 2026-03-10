-- Promote a user to admin by email
-- Usage: Replace 'admin@example.com' with the actual admin email
-- Run in Supabase SQL Editor after the user has signed up

UPDATE players
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
