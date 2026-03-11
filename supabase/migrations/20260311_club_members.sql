-- Club Members table
-- Tracks players who belong to clubs (multi-club support)
-- A player can belong to multiple clubs with different roles

create table if not exists club_members (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  role text check (role in ('member', 'officer', 'captain', 'coach', 'social_coordinator')) default 'member',
  joined_at timestamptz default now(),
  status text check (status in ('active', 'inactive', 'pending')) default 'pending',
  is_primary_club boolean default false, -- the player's "home" club
  notes text, -- optional notes from the club manager
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(club_id, player_id) -- a player can only be a member once per club
);

-- Indexes
create index if not exists idx_club_members_club on club_members(club_id);
create index if not exists idx_club_members_player on club_members(player_id);
create index if not exists idx_club_members_status on club_members(status);
create index if not exists idx_club_members_primary on club_members(is_primary_club) where is_primary_club = true;

-- RLS
alter table club_members enable row level security;

-- Anyone can view club members (public directory)
create policy "Club members viewable by all" on club_members
  for select using (true);

-- Players can add themselves to a club (as pending)
create policy "Players can join clubs" on club_members
  for insert with check (public.is_own_player(player_id));

-- Players can update their own membership (e.g. set primary club)
create policy "Players can update own membership" on club_members
  for update using (public.is_own_player(player_id));

-- Players can leave clubs
create policy "Players can leave clubs" on club_members
  for delete using (public.is_own_player(player_id));

-- Club managers can manage their club's members
create policy "Club managers can manage members" on club_members
  for all using (
    exists (
      select 1 from clubs
      where clubs.id = club_members.club_id
      and clubs.claimed_by is not null
      and clubs.claimed_by = (select id from players where user_id = auth.uid() limit 1)
    )
  );

-- Admins can manage all memberships
create policy "Admins can manage all memberships" on club_members
  for all using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

-- Updated_at trigger
create or replace function update_club_members_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger club_members_updated_at
  before update on club_members
  for each row
  execute function update_club_members_updated_at();
