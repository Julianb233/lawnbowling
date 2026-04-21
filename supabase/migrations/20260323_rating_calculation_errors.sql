-- Rating Calculation Errors: surfaces ELO rating failures to admins
-- Instead of silently catching errors in the progression API, we log them here

CREATE TABLE IF NOT EXISTS rating_calculation_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  round INTEGER,
  player_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rating_calc_errors_tournament ON rating_calculation_errors(tournament_id);
CREATE INDEX IF NOT EXISTS idx_rating_calc_errors_created ON rating_calculation_errors(created_at DESC);

-- RLS
ALTER TABLE rating_calculation_errors ENABLE ROW LEVEL SECURITY;

-- Admins can read all errors (read via service role in admin pages)
CREATE POLICY "Service role can read rating errors"
  ON rating_calculation_errors FOR SELECT
  USING (true);

-- API can insert errors
CREATE POLICY "Service role can insert rating errors"
  ON rating_calculation_errors FOR INSERT
  WITH CHECK (true);
