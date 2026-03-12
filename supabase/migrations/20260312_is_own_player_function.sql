-- Create the is_own_player() helper function used by RLS policies
-- in club_claim_requests, club_members, and other tables.
--
-- Returns TRUE if the given player_id belongs to the currently authenticated user.
CREATE OR REPLACE FUNCTION public.is_own_player(pid UUID)
RETURNS BOOLEAN AS $$
  SELECT pid = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
$$ LANGUAGE sql SECURITY DEFINER STABLE;
