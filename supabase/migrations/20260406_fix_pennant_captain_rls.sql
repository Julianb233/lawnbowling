-- Fix pennant team member captain policies: captain_id is a player UUID,
-- not an auth UUID, so comparing to auth.uid() never matches.
-- Must resolve through the players table.

DROP POLICY IF EXISTS "pennant_team_members_captain_insert" ON pennant_team_members;
CREATE POLICY "pennant_team_members_captain_insert" ON pennant_team_members
  FOR INSERT TO authenticated WITH CHECK (
    is_pennant_admin() OR EXISTS (
      SELECT 1 FROM pennant_teams pt
      JOIN players p ON p.id = pt.captain_id
      WHERE pt.id = team_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pennant_team_members_captain_update" ON pennant_team_members;
CREATE POLICY "pennant_team_members_captain_update" ON pennant_team_members
  FOR UPDATE TO authenticated USING (
    is_pennant_admin() OR EXISTS (
      SELECT 1 FROM pennant_teams pt
      JOIN players p ON p.id = pt.captain_id
      WHERE pt.id = team_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pennant_team_members_captain_delete" ON pennant_team_members;
CREATE POLICY "pennant_team_members_captain_delete" ON pennant_team_members
  FOR DELETE TO authenticated USING (
    is_pennant_admin() OR EXISTS (
      SELECT 1 FROM pennant_teams pt
      JOIN players p ON p.id = pt.captain_id
      WHERE pt.id = team_id
        AND p.user_id = auth.uid()
    )
  );
