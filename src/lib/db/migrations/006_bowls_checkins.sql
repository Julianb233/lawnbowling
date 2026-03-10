-- Bowls tournament check-in with position preferences
-- Supports fours, triples, pairs, and singles formats

create table if not exists bowls_checkins (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  tournament_id uuid not null references tournaments(id) on delete cascade,
  preferred_position text not null check (preferred_position in ('skip', 'vice', 'second', 'lead')),
  checked_in_at timestamptz not null default now(),
  unique(player_id, tournament_id)
);

-- Index for fast lookups by tournament
create index if not exists idx_bowls_checkins_tournament on bowls_checkins(tournament_id);
create index if not exists idx_bowls_checkins_player on bowls_checkins(player_id);

-- Enable RLS
alter table bowls_checkins enable row level security;

-- Everyone can view check-ins (needed for the board display)
create policy "bowls_checkins_select" on bowls_checkins
  for select using (true);

-- Players can check themselves in
create policy "bowls_checkins_insert" on bowls_checkins
  for insert with check (true);

-- Players can update their own check-in (change position)
create policy "bowls_checkins_update" on bowls_checkins
  for update using (true);

-- Players can remove their own check-in
create policy "bowls_checkins_delete" on bowls_checkins
  for delete using (true);

-- Enable realtime for live updates on the board
alter publication supabase_realtime add table bowls_checkins;
