-- Create the is_own_player() helper function used by RLS policies
-- in club_claim_requests, club_members, and other tables.
--
-- Returns TRUE if the given player_id belongs to the currently authenticated user.
CREATE OR REPLACE FUNCTION public.is_own_player(p_player_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM players
    WHERE id = p_player_id AND user_id = auth.uid()
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_own_player(UUID) TO authenticated;
