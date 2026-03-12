-- H-007: Fix club_events admin RLS policy — was comparing players.id to auth.uid()
-- which never matches since players.id is a player UUID and auth.uid() is the auth UUID.
-- Must use players.user_id = auth.uid() instead.
DROP POLICY IF EXISTS "Admins can manage club events" ON club_events;
CREATE POLICY "Admins can manage club events"
  ON club_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.user_id = auth.uid()
      AND players.role = 'admin'
    )
  );
