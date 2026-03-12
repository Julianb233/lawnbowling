-- Add new notification preference columns for events, tournaments, chat, and club announcements.
-- The table may already exist with legacy columns; this migration adds the new ones.

-- Ensure the table exists (idempotent)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  event_reminders BOOLEAN DEFAULT true,
  new_events BOOLEAN DEFAULT true,
  tournament_results BOOLEAN DEFAULT true,
  chat_messages BOOLEAN DEFAULT true,
  club_announcements BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id)
);

-- If the table already exists, add the new columns (safe with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'event_reminders') THEN
    ALTER TABLE notification_preferences ADD COLUMN event_reminders BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'new_events') THEN
    ALTER TABLE notification_preferences ADD COLUMN new_events BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'tournament_results') THEN
    ALTER TABLE notification_preferences ADD COLUMN tournament_results BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'chat_messages') THEN
    ALTER TABLE notification_preferences ADD COLUMN chat_messages BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_preferences' AND column_name = 'club_announcements') THEN
    ALTER TABLE notification_preferences ADD COLUMN club_announcements BOOLEAN DEFAULT true;
  END IF;
END
$$;

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Players can read/write their own preferences
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notification_preferences_select_own') THEN
    CREATE POLICY notification_preferences_select_own ON notification_preferences
      FOR SELECT USING (player_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notification_preferences_upsert_own') THEN
    CREATE POLICY notification_preferences_upsert_own ON notification_preferences
      FOR ALL USING (player_id = auth.uid());
  END IF;
END
$$;
