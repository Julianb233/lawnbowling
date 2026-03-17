-- Club group chat messages
CREATE TABLE IF NOT EXISTS club_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_club_messages_club_created
  ON club_messages(club_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_club_messages_sender
  ON club_messages(sender_id);

-- RLS
ALTER TABLE club_messages ENABLE ROW LEVEL SECURITY;

-- Members can read messages in their clubs
CREATE POLICY "Club members can read messages"
  ON club_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM club_memberships
      WHERE club_memberships.club_id = club_messages.club_id
        AND club_memberships.player_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = club_messages.sender_id
        AND players.user_id = auth.uid()
    )
  );

-- Members can send messages to their clubs
CREATE POLICY "Club members can send messages"
  ON club_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_memberships
      WHERE club_memberships.club_id = club_messages.club_id
        AND club_memberships.player_id = club_messages.sender_id
    )
    AND
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = club_messages.sender_id
        AND players.user_id = auth.uid()
    )
  );

-- Enable realtime for club messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'club_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE club_messages;
  END IF;
END $$;

-- Gallery user submissions table
CREATE TABLE IF NOT EXISTS gallery_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 1000),
  category TEXT NOT NULL CHECK (category IN (
    'Action Shots', 'Greens & Venues', 'Equipment',
    'Vintage & Heritage', 'Social & Community', 'Art & Illustrations'
  )),
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_submissions_status
  ON gallery_submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_submissions_player
  ON gallery_submissions(player_id);

ALTER TABLE gallery_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved submissions
CREATE POLICY "Anyone can read approved gallery submissions"
  ON gallery_submissions FOR SELECT
  USING (status = 'approved' OR EXISTS (
    SELECT 1 FROM players
    WHERE players.id = gallery_submissions.player_id
      AND players.user_id = auth.uid()
  ));

-- Authenticated users can submit
CREATE POLICY "Authenticated users can submit gallery photos"
  ON gallery_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = gallery_submissions.player_id
        AND players.user_id = auth.uid()
    )
  );

-- Activity feed auto-population trigger for friend acceptances
CREATE OR REPLACE FUNCTION log_friend_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    INSERT INTO activity_feed (player_id, type, metadata)
    VALUES (
      NEW.player_id,
      'friend_accepted',
      jsonb_build_object('friend_id', NEW.friend_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_friend_accepted ON friendships;
CREATE TRIGGER trg_friend_accepted
  AFTER UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION log_friend_accepted();

-- Activity feed trigger for match completions
CREATE OR REPLACE FUNCTION log_match_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mp RECORD;
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    FOR mp IN SELECT player_id FROM match_players WHERE match_id = NEW.id
    LOOP
      INSERT INTO activity_feed (player_id, venue_id, type, metadata)
      VALUES (
        mp.player_id,
        NEW.venue_id,
        'match_complete',
        jsonb_build_object('match_id', NEW.id, 'sport', NEW.sport)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_match_completed ON matches;
CREATE TRIGGER trg_match_completed
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION log_match_completed();

-- Webhook trigger for activity_feed inserts
DROP TRIGGER IF EXISTS trg_webhook_activity ON activity_feed;
CREATE TRIGGER trg_webhook_activity
  AFTER INSERT ON activity_feed
  FOR EACH ROW EXECUTE FUNCTION notify_app_webhook();
