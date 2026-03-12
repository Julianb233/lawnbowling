-- H-001: Expand noticeboard_posts type CHECK constraint to match TypeScript types.
-- The original constraint only allowed 3 types, but the frontend defines 6.
ALTER TABLE noticeboard_posts DROP CONSTRAINT IF EXISTS noticeboard_posts_type_check;
ALTER TABLE noticeboard_posts ADD CONSTRAINT noticeboard_posts_type_check
  CHECK (type IN ('announcement', 'event', 'general', 'question', 'tournament_result', 'member_post'));
