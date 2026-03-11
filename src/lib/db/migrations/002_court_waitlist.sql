-- Court Waitlist: queue players/pairs when all courts are full
create table if not exists court_waitlist (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  sport text not null,
  player_id uuid not null references players(id) on delete cascade,
  partner_id uuid references players(id),
  position integer not null,
  status text not null check (status in ('waiting', 'notified', 'assigned', 'expired')) default 'waiting',
  notified_at timestamptz,
  assigned_match_id uuid references matches(id),
  estimated_wait_minutes integer,
  created_at timestamptz default now()
);

-- RLS
alter table court_waitlist enable row level security;

create policy "Waitlist viewable by all" on court_waitlist for select using (true);
create policy "Players can join waitlist" on court_waitlist for insert
  with check (public.is_own_player(player_id));
create policy "Players can leave own waitlist" on court_waitlist for update
  using (public.is_own_player(player_id));
create policy "Admins can manage waitlist" on court_waitlist for all
  using (exists (select 1 from players where user_id = auth.uid() and role = 'admin'));

-- Realtime
alter publication supabase_realtime add table court_waitlist;

-- Indexes
create index if not exists idx_waitlist_venue_sport on court_waitlist(venue_id, sport) where status = 'waiting';
create index if not exists idx_waitlist_player on court_waitlist(player_id) where status = 'waiting';
create index if not exists idx_waitlist_position on court_waitlist(venue_id, sport, position) where status = 'waiting';
