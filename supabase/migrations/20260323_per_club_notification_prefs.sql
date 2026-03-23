-- AI-4039: Per-club notification preferences
-- Adds club_id to notification_preferences so users in multiple clubs
-- can set different notification levels per club.
-- NULL club_id = global default preferences (existing behavior preserved).

ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id) ON DELETE CASCADE;

-- Drop the old global unique constraint (player_id alone)
-- and replace with a per-scope unique constraint.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notification_preferences_player_id_key'
      AND conrelid = 'notification_preferences'::regclass
  ) THEN
    ALTER TABLE notification_preferences
      DROP CONSTRAINT notification_preferences_player_id_key;
  END IF;
END
$$;

-- One global (NULL club_id) row per player
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_prefs_player_global
  ON notification_preferences(player_id)
  WHERE club_id IS NULL;

-- One per-club row per player per club
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_prefs_player_club
  ON notification_preferences(player_id, club_id)
  WHERE club_id IS NOT NULL;

-- Index for fetching all prefs for a club
CREATE INDEX IF NOT EXISTS idx_notification_prefs_club
  ON notification_preferences(club_id)
  WHERE club_id IS NOT NULL;
