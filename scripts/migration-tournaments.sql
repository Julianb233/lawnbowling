-- Migration: Tournament tables for round-robin and bracket play
-- Run this if tournaments/tournament_participants/tournament_matches don't exist yet.
-- These tables are also defined in src/lib/db/schema.sql for fresh installs.

-- Tournaments
create table if not exists tournaments (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid references venues(id),
  name text not null,
  sport text not null,
  format text not null check (format in ('round_robin', 'single_elimination', 'double_elimination')),
  status text not null check (status in ('registration', 'in_progress', 'completed', 'cancelled')) default 'registration',
  max_players integer default 16,
  created_by uuid not null references players(id),
  starts_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- Tournament Participants
create table if not exists tournament_participants (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  seed integer,
  eliminated boolean default false,
  wins integer default 0,
  losses integer default 0,
  unique (tournament_id, player_id)
);

-- Tournament Matches
create table if not exists tournament_matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round integer not null,
  match_number integer not null,
  player1_id uuid references players(id),
  player2_id uuid references players(id),
  winner_id uuid references players(id),
  score text,
  court_id uuid references courts(id),
  status text not null check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  scheduled_at timestamptz,
  completed_at timestamptz
);

-- RLS
alter table tournaments enable row level security;
alter table tournament_participants enable row level security;
alter table tournament_matches enable row level security;

-- Policies: Tournaments
create policy "Tournaments viewable by all" on tournaments for select using (true);
create policy "Players can create tournaments" on tournaments for insert with check (public.is_own_player(created_by));
create policy "Creator can update tournament" on tournaments for update using (public.is_own_player(created_by));

-- Policies: Participants
create policy "Participants viewable by all" on tournament_participants for select using (true);
create policy "Players can join tournaments" on tournament_participants for insert with check (public.is_own_player(player_id));
create policy "Players can leave tournaments" on tournament_participants for delete using (public.is_own_player(player_id));

-- Policies: Matches
create policy "Tournament matches viewable by all" on tournament_matches for select using (true);
create policy "Tournament matches insertable by creator" on tournament_matches for insert with check (
  exists (select 1 from tournaments where id = tournament_id and public.is_own_player(created_by))
);
create policy "Tournament matches updatable by participants" on tournament_matches for update using (
  public.is_own_player(player1_id) or public.is_own_player(player2_id) or
  exists (select 1 from tournaments where id = tournament_id and public.is_own_player(created_by))
);

-- Indexes
create index if not exists idx_tournaments_venue on tournaments(venue_id);
create index if not exists idx_tournaments_status on tournaments(status) where status != 'completed';
create index if not exists idx_tournament_participants_tournament on tournament_participants(tournament_id);
create index if not exists idx_tournament_matches_tournament on tournament_matches(tournament_id);
create index if not exists idx_tournament_matches_round on tournament_matches(tournament_id, round);

-- Realtime subscriptions
alter publication supabase_realtime add table tournaments;
alter publication supabase_realtime add table tournament_participants;
alter publication supabase_realtime add table tournament_matches;

-- If upgrading from existing schema, add missing columns:
-- alter table tournaments add column if not exists started_at timestamptz;
-- alter table tournaments add column if not exists ended_at timestamptz;
