-- Add unique constraint on player_id for subscriptions table.
-- Each player should have at most one subscription record.
-- The checkout route queries subscriptions by player_id and expects .single().

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_player_unique
  ON subscriptions (player_id);
