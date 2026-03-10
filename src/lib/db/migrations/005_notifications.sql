-- Notifications table for persistent notification history
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  type text not null check (type in (
    'partner_request_received',
    'partner_request_accepted',
    'partner_request_declined',
    'partner_request_expired',
    'match_assigned',
    'court_assigned',
    'friend_checked_in',
    'game_reminder',
    'match_completed'
  )),
  title text not null,
  body text not null,
  metadata jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table notifications enable row level security;

create policy "Players can view own notifications"
  on notifications for select
  using (public.is_own_player(player_id));

create policy "Players can update own notifications"
  on notifications for update
  using (public.is_own_player(player_id));

create policy "System can insert notifications"
  on notifications for insert
  with check (true);

-- Realtime
alter publication supabase_realtime add table notifications;

-- Indexes
create index idx_notifications_player on notifications(player_id);
create index idx_notifications_unread on notifications(player_id, is_read) where is_read = false;
create index idx_notifications_created on notifications(created_at desc);
