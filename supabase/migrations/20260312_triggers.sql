-- ============================================================
-- TRIGGER: Auto-update player_stats after match completion
-- ============================================================

CREATE OR REPLACE FUNCTION update_player_stats_on_match_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player RECORD;
  v_total INT;
  v_wins INT;
  v_losses INT;
BEGIN
  -- Only fire when match transitions to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update stats for each player in this match
    FOR v_player IN
      SELECT mp.player_id, mp.team
      FROM match_players mp
      WHERE mp.match_id = NEW.id
    LOOP
      -- Count totals from match_results
      SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE
          (mr.winner_team = v_player.team)
        ),
        COUNT(*) FILTER (WHERE
          (mr.winner_team IS NOT NULL AND mr.winner_team != v_player.team)
        )
      INTO v_total, v_wins, v_losses
      FROM match_players mp2
      JOIN matches m ON m.id = mp2.match_id
      LEFT JOIN match_results mr ON mr.match_id = m.id
      WHERE mp2.player_id = v_player.player_id
        AND m.status = 'completed';

      INSERT INTO player_stats (player_id, games_played, wins, losses, win_rate, last_played_at)
      VALUES (
        v_player.player_id,
        v_total,
        v_wins,
        v_losses,
        CASE WHEN v_total > 0 THEN ROUND((v_wins::NUMERIC / v_total) * 100, 2) ELSE 0 END,
        now()
      )
      ON CONFLICT (player_id)
      DO UPDATE SET
        games_played = EXCLUDED.games_played,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        win_rate = EXCLUDED.win_rate,
        last_played_at = EXCLUDED.last_played_at,
        updated_at = now();
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Only create trigger if matches table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN
    DROP TRIGGER IF EXISTS trg_update_player_stats ON matches;
    CREATE TRIGGER trg_update_player_stats
      AFTER UPDATE ON matches
      FOR EACH ROW
      EXECUTE FUNCTION update_player_stats_on_match_complete();
  END IF;
END $$;

-- ============================================================
-- TRIGGER: Auto-create activity feed entry on match completion
-- ============================================================

CREATE OR REPLACE FUNCTION create_activity_on_match_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO activity_feed (venue_id, player_id, type, metadata, created_at)
    SELECT
      NEW.venue_id,
      mp.player_id,
      'match_complete',
      jsonb_build_object('match_id', NEW.id, 'sport', NEW.sport),
      now()
    FROM match_players mp
    WHERE mp.match_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN
    DROP TRIGGER IF EXISTS trg_activity_on_match_complete ON matches;
    CREATE TRIGGER trg_activity_on_match_complete
      AFTER UPDATE ON matches
      FOR EACH ROW
      EXECUTE FUNCTION create_activity_on_match_complete();
  END IF;
END $$;

-- ============================================================
-- TRIGGER: Auto-create activity feed entry on player check-in
-- ============================================================

CREATE OR REPLACE FUNCTION create_activity_on_checkin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO activity_feed (player_id, type, metadata, created_at)
  VALUES (
    NEW.player_id,
    'check_in',
    jsonb_build_object(
      'tournament_id', NEW.tournament_id,
      'position', NEW.preferred_position,
      'source', NEW.checkin_source
    ),
    now()
  );
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bowls_checkins') THEN
    DROP TRIGGER IF EXISTS trg_activity_on_checkin ON bowls_checkins;
    CREATE TRIGGER trg_activity_on_checkin
      AFTER INSERT ON bowls_checkins
      FOR EACH ROW
      EXECUTE FUNCTION create_activity_on_checkin();
  END IF;
END $$;

-- ============================================================
-- TRIGGER: updated_at auto-timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to tables with updated_at columns
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_updated_at ON %I; CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- AUDIT LOG TABLE + TRIGGER (for admin actions)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  performed_by UUID, -- auth.uid()
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and service role can read audit log
CREATE POLICY "Service role full access" ON audit_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view audit log" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, performed_by)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit triggers to critical tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN VALUES
    ('players'),
    ('club_memberships'),
    ('clubs'),
    ('tournaments'),
    ('pennant_seasons'),
    ('staff_invitations'),
    ('subscriptions')
  LOOP
    BEGIN
      EXECUTE format(
        'DROP TRIGGER IF EXISTS trg_audit ON %I; CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();',
        tbl, tbl
      );
    EXCEPTION WHEN undefined_table THEN
      -- Table doesn't exist yet, skip
      NULL;
    END;
  END LOOP;
END $$;

-- Index for querying audit log by table and time
CREATE INDEX IF NOT EXISTS idx_audit_log_table_time ON audit_log (table_name, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log (record_id, table_name);
