-- TV Announcements table for clubhouse display
-- Admin can create/deactivate announcements shown on the /tv dashboard
CREATE TABLE IF NOT EXISTS tv_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient querying of active announcements
CREATE INDEX IF NOT EXISTS idx_tv_announcements_active ON tv_announcements(active, created_at DESC);

-- Enable realtime for live updates to TV display
ALTER PUBLICATION supabase_realtime ADD TABLE tv_announcements;
