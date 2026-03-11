-- Tournament Scores table for lawn bowling score entry
-- Stores per-rink, per-round scores with end-by-end breakdowns

create table if not exists tournament_scores (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round integer not null default 1,
  rink integer not null,
  team_a_players jsonb not null default '[]'::jsonb,
  team_b_players jsonb not null default '[]'::jsonb,
  team_a_scores jsonb not null default '[]'::jsonb,  -- array of end scores, e.g. [3, 0, 2, 1]
  team_b_scores jsonb not null default '[]'::jsonb,  -- array of end scores, e.g. [0, 4, 0, 2]
  total_a integer not null default 0,
  total_b integer not null default 0,
  ends_won_a integer not null default 0,
  ends_won_b integer not null default 0,
  winner text check (winner in ('team_a', 'team_b', 'draw', null)),
  is_finalized boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tournament_id, round, rink)
);

-- Index for fast lookups
create index if not exists idx_tournament_scores_tournament_round
  on tournament_scores(tournament_id, round);

-- Enable Realtime for live score updates
alter publication supabase_realtime add table tournament_scores;

-- Updated_at trigger
create or replace function update_tournament_scores_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tournament_scores_updated_at
  before update on tournament_scores
  for each row
  execute function update_tournament_scores_updated_at();
