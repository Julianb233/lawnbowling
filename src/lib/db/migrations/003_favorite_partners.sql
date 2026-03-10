-- Migration 003: Favorite Partners Tracking
-- Adds a table to track how often players partner together, enabling "favorite partners" list

-- Partner stats (tracks games played together per partner pair)
create table partner_stats (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  partner_id uuid not null references players(id) on delete cascade,
  games_together integer default 0,
  wins_together integer default 0,
  last_played_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(player_id, partner_id)
);

-- RLS
alter table partner_stats enable row level security;
create policy "Partner stats viewable by all" on partner_stats for select using (true);
create policy "System can manage partner stats" on partner_stats for all using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);

-- Indexes
create index idx_partner_stats_player on partner_stats(player_id);
create index idx_partner_stats_games on partner_stats(player_id, games_together desc);

-- Enable realtime
alter publication supabase_realtime add table partner_stats;
