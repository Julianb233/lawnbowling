-- Court waitlist queue for when all courts are full
-- Players join the wait list and get auto-matched when a court opens

CREATE TABLE IF NOT EXISTS court_waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  sport text NOT NULL,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES players(id) ON DELETE SET NULL,
  position integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'notified', 'expired')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for fast queue lookups
CREATE INDEX IF NOT EXISTS idx_court_waitlist_queue ON court_waitlist(venue_id, sport, status, position ASC);
CREATE INDEX IF NOT EXISTS idx_court_waitlist_player ON court_waitlist(player_id, status);

-- RLS policies
ALTER TABLE court_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view waitlist" ON court_waitlist
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join waitlist" ON court_waitlist
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Players can update their own waitlist entry" ON court_waitlist
  FOR UPDATE USING (
    player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    OR auth.uid() IN (SELECT user_id FROM players WHERE id IN (
      SELECT player_id FROM match_players WHERE match_id IN (
        SELECT id FROM matches WHERE venue_id = court_waitlist.venue_id
      )
    ))
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE court_waitlist;
