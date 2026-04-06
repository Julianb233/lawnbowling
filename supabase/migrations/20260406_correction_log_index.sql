-- Add GIN index on correction_log for efficient JSONB querying
-- Supports queries like: WHERE correction_log IS NOT NULL (audit trail lookups)
CREATE INDEX IF NOT EXISTS idx_tournament_scores_correction_log
  ON tournament_scores USING gin (correction_log)
  WHERE correction_log IS NOT NULL;
