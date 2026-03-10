-- Player Sport Skills (per-sport ELO ratings)
create table if not exists player_sport_skills (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  sport text not null,
  elo_rating integer not null default 1200,
  games_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  updated_at timestamptz default now(),
  unique(player_id, sport)
);

-- RLS
alter table player_sport_skills enable row level security;
create policy "Sport skills viewable by all" on player_sport_skills for select using (true);
create policy "Players can insert own skills" on player_sport_skills for insert with check (public.is_own_player(player_id));
create policy "System can manage skills" on player_sport_skills for all using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);

-- Indexes
create index if not exists idx_player_sport_skills_player on player_sport_skills(player_id);
create index if not exists idx_player_sport_skills_sport on player_sport_skills(sport);
create index if not exists idx_player_sport_skills_elo on player_sport_skills(sport, elo_rating);

-- Realtime
alter publication supabase_realtime add table player_sport_skills;
