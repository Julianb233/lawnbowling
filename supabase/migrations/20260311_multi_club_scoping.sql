-- Multi-club scoping: add club_id to tournaments for club-level data isolation
-- This allows clubs to own and manage their own tournaments independently.

-- Add club_id column to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id) ON DELETE SET NULL;

-- Index for fast lookup of tournaments by club
CREATE INDEX IF NOT EXISTS idx_tournaments_club_id ON tournaments(club_id);

-- Add club_id column to club_members_roster table (already has tournament_id, but direct club link is useful)
ALTER TABLE club_members_roster ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id) ON DELETE SET NULL;

-- Index for fast lookup of roster members by club
CREATE INDEX IF NOT EXISTS idx_club_members_roster_club ON club_members_roster(club_id);

-- Add zip column to clubs table (was missing from original schema)
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS zip text;

-- Add is_active convenience column (derived from status, but useful for quick filtering)
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS is_active boolean GENERATED ALWAYS AS (status IN ('active', 'seasonal', 'claimed')) STORED;

-- RLS policy: club managers can create tournaments for their club
CREATE POLICY "Club managers can create club tournaments" ON tournaments
  FOR INSERT WITH CHECK (
    club_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = tournaments.club_id
      AND clubs.claimed_by IS NOT NULL
      AND clubs.claimed_by = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
    )
  );

-- RLS policy: club managers can update their club's tournaments
CREATE POLICY "Club managers can update club tournaments" ON tournaments
  FOR UPDATE USING (
    club_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = tournaments.club_id
      AND clubs.claimed_by IS NOT NULL
      AND clubs.claimed_by = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
    )
  );

-- RLS policy: club managers can manage their club's roster members
CREATE POLICY "Club managers can manage club roster" ON club_members_roster
  FOR ALL USING (
    club_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_members_roster.club_id
      AND clubs.claimed_by IS NOT NULL
      AND clubs.claimed_by = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
    )
  );

-- Add a view for club dashboard stats
CREATE OR REPLACE VIEW club_dashboard_stats AS
SELECT
  c.id AS club_id,
  c.name AS club_name,
  c.slug,
  (SELECT COUNT(*) FROM club_members cm WHERE cm.club_id = c.id AND cm.status = 'active') AS active_members,
  (SELECT COUNT(*) FROM club_members cm WHERE cm.club_id = c.id AND cm.status = 'pending') AS pending_members,
  (SELECT COUNT(*) FROM tournaments t WHERE t.club_id = c.id) AS total_tournaments,
  (SELECT COUNT(*) FROM tournaments t WHERE t.club_id = c.id AND t.status = 'in_progress') AS active_tournaments,
  (SELECT COUNT(*) FROM club_venues cv WHERE cv.club_id = c.id) AS linked_venues
FROM clubs c;
