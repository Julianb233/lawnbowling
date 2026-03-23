-- Migration: wrap court assignment in an atomic database transaction
-- Fixes: AI-4029
-- Problem: assignCourtToMatch previously updated matches and courts in separate
-- statements. If one succeeded and the other failed, the DB was left in an
-- inconsistent state (court marked occupied but match still "queued", or vice-versa).
-- Solution: a single plpgsql function executed inside one implicit transaction.

CREATE OR REPLACE FUNCTION assign_court_to_match(
  p_match_id UUID,
  p_court_id UUID
)
RETURNS SETOF matches
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match matches;
BEGIN
  -- Atomically update match → playing on this court
  UPDATE matches
  SET
    court_id   = p_court_id,
    status     = 'playing',
    started_at = NOW()
  WHERE id     = p_match_id
    AND status = 'queued'
  RETURNING * INTO v_match;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'assign_court_to_match: match % not found or not in queued state',
      p_match_id;
  END IF;

  -- Atomically mark court as unavailable in the same transaction
  UPDATE courts
  SET is_available = FALSE
  WHERE id = p_court_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'assign_court_to_match: court % not found',
      p_court_id;
  END IF;

  RETURN NEXT v_match;
END;
$$;

-- Grant execute to authenticated users (RLS on the underlying tables still applies)
GRANT EXECUTE ON FUNCTION assign_court_to_match(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_court_to_match(UUID, UUID) TO service_role;
