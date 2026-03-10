-- Staff invitations for venue onboarding
create table if not exists staff_invitations (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  invited_by uuid not null references players(id) on delete cascade,
  email text not null,
  role text check (role in ('admin', 'staff')) default 'staff',
  status text check (status in ('pending', 'accepted', 'expired')) default 'pending',
  token text unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

-- RLS
alter table staff_invitations enable row level security;

-- Venue admins can manage invitations for their venue
create policy "Admins can manage staff invitations" on staff_invitations for all using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);

-- Anyone can view their own invitation by token (for accept flow)
create policy "Anyone can view invitation by token" on staff_invitations for select using (true);

-- Indexes
create index idx_staff_invitations_venue on staff_invitations(venue_id);
create index idx_staff_invitations_email on staff_invitations(email);
create index idx_staff_invitations_token on staff_invitations(token);
