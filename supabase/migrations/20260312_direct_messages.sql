-- Direct messages table for 1-to-1 chat between friends
-- Supports the chat/messaging feature with persistence + realtime

CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT dm_no_self_message CHECK (sender_id != receiver_id)
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages they sent or received
CREATE POLICY "Users can view own messages" ON direct_messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    OR receiver_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Users can insert messages where they are the sender
CREATE POLICY "Users can send messages" ON direct_messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Users can mark messages as read (only receiver)
CREATE POLICY "Users can mark messages read" ON direct_messages
  FOR UPDATE USING (
    receiver_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  ) WITH CHECK (
    receiver_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

CREATE INDEX idx_dm_sender ON direct_messages(sender_id, created_at DESC);
CREATE INDEX idx_dm_receiver ON direct_messages(receiver_id, created_at DESC);
CREATE INDEX idx_dm_conversation ON direct_messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);
CREATE INDEX idx_dm_unread ON direct_messages(receiver_id, is_read) WHERE is_read = false;

-- Enable realtime for direct_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'direct_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
  END IF;
END $$;

-- Add social activity types to activity_feed
-- (The type column is TEXT so no alter needed, just documenting new types:
--  'friend_accepted', 'message_sent' are now valid activity types)
