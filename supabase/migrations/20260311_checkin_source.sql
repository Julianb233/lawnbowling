-- UCI-03/UCI-10: Add checkin_source column to bowls_checkins to track how a player checked in
ALTER TABLE bowls_checkins
  ADD COLUMN IF NOT EXISTS checkin_source TEXT NOT NULL DEFAULT 'manual'
  CHECK (checkin_source IN ('kiosk', 'manual', 'app'));

-- UCI-13: Ensure unique constraint exists on (player_id, tournament_id)
-- This is idempotent -- will no-op if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bowls_checkins_player_tournament_unique'
  ) THEN
    ALTER TABLE bowls_checkins
      ADD CONSTRAINT bowls_checkins_player_tournament_unique
      UNIQUE (player_id, tournament_id);
  END IF;
END $$;
