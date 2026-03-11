-- Add club_id foreign key to tournaments table
-- Allows tournaments to be scoped to a specific club

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS club_id uuid REFERENCES clubs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tournaments_club_id ON tournaments(club_id);
