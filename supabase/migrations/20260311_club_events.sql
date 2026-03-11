-- Club Events Calendar
CREATE TABLE IF NOT EXISTS club_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type TEXT NOT NULL DEFAULT 'other' CHECK (event_type IN ('social', 'tournament', 'meeting', 'practice', 'other')),
  location TEXT,
  created_by UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_club_events_club_date ON club_events(club_id, event_date);
CREATE INDEX idx_club_events_upcoming ON club_events(club_id, event_date) WHERE event_date >= CURRENT_DATE;

-- RLS
ALTER TABLE club_events ENABLE ROW LEVEL SECURITY;

-- Anyone can read events (club pages are public)
CREATE POLICY "Anyone can read club events"
  ON club_events FOR SELECT
  USING (true);

-- Only admins can insert/update/delete events
CREATE POLICY "Admins can manage club events"
  ON club_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = auth.uid()
      AND players.role = 'admin'
    )
  );
