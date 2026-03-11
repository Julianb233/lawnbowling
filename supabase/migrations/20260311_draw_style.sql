-- Add draw_style column to tournaments table
-- Stores which draw algorithm was used: random, seeded, mead, gavel
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS draw_style text DEFAULT 'random'
CHECK (draw_style IN ('random', 'seeded', 'mead', 'gavel'));

-- Create tournament_draws table to persist multi-round draw results
CREATE TABLE IF NOT EXISTS tournament_draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round integer NOT NULL,
  rink integer NOT NULL,
  team integer NOT NULL CHECK (team IN (1, 2)),
  player_id uuid NOT NULL,
  position text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, round, rink, team, position)
);

CREATE INDEX IF NOT EXISTS idx_tournament_draws_tournament ON tournament_draws(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_draws_round ON tournament_draws(tournament_id, round);
