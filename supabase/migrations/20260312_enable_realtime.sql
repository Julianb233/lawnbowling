-- Enable Supabase Realtime replication on key tables for live match updates.
-- Using DO blocks to make this idempotent (safe to re-run).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE matches;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'bowls_checkins'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bowls_checkins;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tournament_scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tournament_scores;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'activity_feed'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tournaments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'noticeboard_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE noticeboard_posts;
  END IF;
END $$;
