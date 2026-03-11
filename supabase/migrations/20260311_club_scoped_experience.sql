-- Club-Scoped Experience migration
-- Adds home_club_id to players and visiting_club_id to tournaments

-- Add home_club_id to players table
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS home_club_id uuid REFERENCES clubs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_players_home_club_id ON players(home_club_id);

-- Add visiting_club_id to tournaments for inter-club matches
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS visiting_club_id uuid REFERENCES clubs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tournaments_visiting_club_id ON tournaments(visiting_club_id);
