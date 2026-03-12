-- M-014: Fix visit_requests RLS policies that compare auth.uid() directly to player_id.
-- player_id references players.id (player UUID), not the auth UUID.
-- Must use a subquery to resolve the player ID from auth.uid().

-- Fix SELECT policy
DROP POLICY IF EXISTS visit_requests_select_own ON visit_requests;
CREATE POLICY visit_requests_select_own ON visit_requests
  FOR SELECT USING (
    player_id = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
  );

-- Fix INSERT policy
DROP POLICY IF EXISTS visit_requests_insert_own ON visit_requests;
CREATE POLICY visit_requests_insert_own ON visit_requests
  FOR INSERT WITH CHECK (
    player_id = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
  );

-- Fix admin SELECT policy — same issue with p.id::text::uuid = auth.uid()
DROP POLICY IF EXISTS visit_requests_select_admin ON visit_requests;
CREATE POLICY visit_requests_select_admin ON visit_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_venues cv
      JOIN players p ON p.venue_id = cv.venue_id
      WHERE cv.club_id = visit_requests.club_id
        AND p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Fix admin UPDATE policy
DROP POLICY IF EXISTS visit_requests_update_admin ON visit_requests;
CREATE POLICY visit_requests_update_admin ON visit_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM club_venues cv
      JOIN players p ON p.venue_id = cv.venue_id
      WHERE cv.club_id = visit_requests.club_id
        AND p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );
