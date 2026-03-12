// ── Notification Types ────────────────────────────────────────────────
export type PushNotificationType =
  | "partner_request"
  | "partner_accepted"
  | "court_available"
  | "game_reminder"
  | "noticeboard_announcement"
  | "event_reminder"
  | "new_event"
  | "tournament_result"
  | "chat_message"
  | "club_announcement";

export type NotificationType =
  | "partner_request_received"
  | "partner_request_accepted"
  | "partner_request_declined"
  | "partner_request_expired"
  | "match_assigned"
  | "court_assigned"
  | "game_reminder"
  | "event_reminder"
  | "new_event"
  | "tournament_result"
  | "chat_message"
  | "club_announcement"
  | "noticeboard_announcement";

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  actions?: Array<{ action: string; title: string }>;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

// ── Match / Player Types ─────────────────────────────────────────────
export type MatchStatus = "queued" | "playing" | "completed";

export interface Match {
  id: string;
  venue_id: string;
  sport: string;
  court_id: string | null;
  status: MatchStatus;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface PlayerStats {
  player_id: string;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  elo_rating: number;
  favorite_sport: string;
  last_played_at: string | null;
  updated_at: string;
}

// ── Stripe Webhook Types ─────────────────────────────────────────────
export interface StripeSubscriptionUpsert {
  player_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
}
