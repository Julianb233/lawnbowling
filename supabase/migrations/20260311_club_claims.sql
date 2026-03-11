-- Club Claim Requests table
-- Allows verified officials to request ownership of a club listing

create table if not exists club_claim_requests (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  role_at_club text, -- e.g. 'President', 'Secretary', 'Board Member'
  message text, -- why they should be approved
  rejection_reason text, -- admin feedback if rejected
  reviewed_by uuid references players(id),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(club_id, player_id, status) -- prevent duplicate pending claims
);

-- Indexes
create index if not exists idx_club_claims_status on club_claim_requests(status);
create index if not exists idx_club_claims_club on club_claim_requests(club_id);
create index if not exists idx_club_claims_player on club_claim_requests(player_id);

-- RLS
alter table club_claim_requests enable row level security;

-- Players can view their own claims
create policy "Players can view own claims" on club_claim_requests
  for select using (public.is_own_player(player_id));

-- Players can create claims
create policy "Players can create claims" on club_claim_requests
  for insert with check (public.is_own_player(player_id));

-- Admins can view all claims
create policy "Admins can view all claims" on club_claim_requests
  for select using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

-- Admins can update claims (approve/reject)
create policy "Admins can update claims" on club_claim_requests
  for update using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

-- Club-venue linking table (many-to-many, a club can use multiple venues)
create table if not exists club_venues (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  is_primary boolean default false,
  created_at timestamptz default now(),
  unique(club_id, venue_id)
);

create index if not exists idx_club_venues_club on club_venues(club_id);
create index if not exists idx_club_venues_venue on club_venues(venue_id);

alter table club_venues enable row level security;

-- Anyone can view club-venue links
create policy "Club venues viewable by all" on club_venues
  for select using (true);

-- Club managers can manage their club's venue links
create policy "Club managers can manage venue links" on club_venues
  for all using (
    exists (
      select 1 from clubs
      where clubs.id = club_venues.club_id
      and clubs.claimed_by is not null
      and clubs.claimed_by = (select id from players where user_id = auth.uid() limit 1)
    )
  );

-- Admins can manage all venue links
create policy "Admins can manage all venue links" on club_venues
  for all using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

-- Updated_at trigger for claims
create or replace function update_club_claims_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger club_claims_updated_at
  before update on club_claim_requests
  for each row
  execute function update_club_claims_updated_at();
