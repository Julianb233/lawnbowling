-- Add bracket column for double elimination support
-- Values: 'winners', 'losers', 'grand_final'
-- NULL for single elimination and round robin formats

ALTER TABLE tournament_matches
  ADD COLUMN IF NOT EXISTS bracket text
  CHECK (bracket IN ('winners', 'losers', 'grand_final'));

-- Index for efficient bracket filtering
CREATE INDEX IF NOT EXISTS idx_tournament_matches_bracket
  ON tournament_matches(tournament_id, bracket, round);
