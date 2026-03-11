-- Bowls Position Ratings: per-position ELO ratings for lawn bowling
-- Each player has a separate rating for each position (skip/vice/second/lead/singles) per season

CREATE TABLE IF NOT EXISTS bowls_position_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  position TEXT NOT NULL CHECK (position IN ('skip', 'vice', 'second', 'lead', 'singles')),
  season TEXT NOT NULL DEFAULT to_char(now(), 'YYYY'),
  elo_rating NUMERIC NOT NULL DEFAULT 1200,
  games_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  shot_differential INTEGER NOT NULL DEFAULT 0,
  ends_won INTEGER NOT NULL DEFAULT 0,
  ends_played INTEGER NOT NULL DEFAULT 0,
  ends_won_pct NUMERIC GENERATED ALWAYS AS (
    CASE WHEN ends_played > 0 THEN ROUND((ends_won::NUMERIC / ends_played) * 100, 1) ELSE 0 END
  ) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, position, season)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bowls_position_ratings_player ON bowls_position_ratings(player_id);
CREATE INDEX IF NOT EXISTS idx_bowls_position_ratings_season ON bowls_position_ratings(season);
CREATE INDEX IF NOT EXISTS idx_bowls_position_ratings_position_elo ON bowls_position_ratings(position, elo_rating DESC);

-- Rating history for sparklines (last N rating changes)
CREATE TABLE IF NOT EXISTS bowls_rating_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  position TEXT NOT NULL CHECK (position IN ('skip', 'vice', 'second', 'lead', 'singles')),
  season TEXT NOT NULL,
  elo_rating NUMERIC NOT NULL,
  tournament_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bowls_rating_history_player_pos ON bowls_rating_history(player_id, position, season);

-- RLS Policies
ALTER TABLE bowls_position_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowls_rating_history ENABLE ROW LEVEL SECURITY;

-- Players can read all ratings
CREATE POLICY "Anyone can read bowls ratings"
  ON bowls_position_ratings FOR SELECT
  USING (true);

-- Players can only update their own ratings (via app logic)
CREATE POLICY "Players can update own ratings"
  ON bowls_position_ratings FOR UPDATE
  USING (player_id = auth.uid());

-- Service role can upsert (used by recalculate API)
CREATE POLICY "Service role can insert ratings"
  ON bowls_position_ratings FOR INSERT
  WITH CHECK (true);

-- Rating history: read all, insert via service
CREATE POLICY "Anyone can read rating history"
  ON bowls_rating_history FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert rating history"
  ON bowls_rating_history FOR INSERT
  WITH CHECK (true);
