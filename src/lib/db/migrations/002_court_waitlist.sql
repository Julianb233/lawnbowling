-- Court Waitlist — queue players when all courts for a sport are full
create table if not exists court_waitlist (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  sport text not null,
  player_id uuid not null references players(id) on delete cascade,
  partner_id uuid references players(id) on delete set null,
  position integer not null,
  status text not null default 'waiting'
    check (status in ('waiting', 'notified', 'assigned', 'expired')),
  estimated_wait_minutes integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table court_waitlist enable row level security;

create policy "Waitlist viewable by all authenticated"
  on court_waitlist for select using (auth.uid() is not null);

create policy "Players can join waitlist"
  on court_waitlist for insert with check (
    exists (select 1 from players where id = player_id and user_id = auth.uid())
  );

create policy "Players can leave own waitlist entry"
  on court_waitlist for update using (
    exists (select 1 from players where id = player_id and user_id = auth.uid())
    or exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage waitlist"
  on court_waitlist for all using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

-- Indexes
create index if not exists idx_court_waitlist_venue_sport
  on court_waitlist(venue_id, sport);
create index if not exists idx_court_waitlist_status
  on court_waitlist(status);
create index if not exists idx_court_waitlist_player
  on court_waitlist(player_id);
create index if not exists idx_court_waitlist_position
  on court_waitlist(venue_id, sport, status, position);

-- Realtime
alter publication supabase_realtime add table court_waitlist;
