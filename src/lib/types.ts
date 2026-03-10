export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type PlayerRole = "player" | "admin";
export type InsuranceStatus = "none" | "active" | "expired";
export type RequestStatus = "pending" | "accepted" | "declined" | "expired";
export type MatchStatus = "queued" | "playing" | "completed";

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  tagline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  sports: string[];
  operating_hours: Record<string, unknown>;
  created_at: string;
}

export interface Player {
  id: string;
  display_name: string;
  avatar_url: string | null;
  skill_level: SkillLevel;
  sports: string[];
  is_available: boolean;
  checked_in_at: string | null;
  venue_id: string | null;
  role: PlayerRole;
  insurance_status: InsuranceStatus;
  created_at: string;
  updated_at: string;
}

export interface Waiver {
  id: string;
  player_id: string;
  venue_id: string | null;
  waiver_text: string;
  accepted: boolean;
  accepted_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface WaiverTemplate {
  id: string;
  venue_id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerRequest {
  id: string;
  requester_id: string;
  target_id: string;
  sport: string;
  status: RequestStatus;
  expires_at: string;
  created_at: string;
  responded_at: string | null;
}

export interface Court {
  id: string;
  venue_id: string;
  name: string;
  sport: string;
  is_available: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  sport: string;
  court_id: string | null;
  venue_id: string | null;
  status: MatchStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  team: 1 | 2 | null;
}

// Per-sport ELO skill ratings
export interface PlayerSportSkill {
  id: string;
  player_id: string;
  sport: string;
  skill_level: SportSkillLevel;
  rating: number;
  elo_rating: number;
  games_played: number;
  wins: number;
  losses: number;
  updated_at: string;
}

// Waitlist
export interface WaitlistEntry {
  id: string;
  player_id: string;
  sport: string;
  position: number;
  created_at: string;
  player?: { display_name: string; avatar_url?: string | null };
}

// Board constants
export type Sport = "pickleball" | "lawn_bowling" | "tennis" | "badminton" | "racquetball" | "flag_football";

export const SPORT_LABELS: Record<Sport, { emoji: string; label: string; short: string }> = {
  pickleball: { emoji: "\u{1F3D3}", label: "Pickleball", short: "Pickle" },
  lawn_bowling: { emoji: "\u{1F3B3}", label: "Lawn Bowling", short: "Bowl" },
  tennis: { emoji: "\u{1F3BE}", label: "Tennis", short: "Tennis" },
  badminton: { emoji: "\u{1F3F8}", label: "Badminton", short: "Badminton" },
  racquetball: { emoji: "\u{1F3BE}", label: "Racquetball", short: "Racquet" },
  flag_football: { emoji: "\u{1F3C8}", label: "Flag Football", short: "Flag" },
};

export const SKILL_LABELS: Record<SkillLevel, { stars: number; label: string }> = {
  beginner: { stars: 1, label: "Beginner" },
  intermediate: { stars: 2, label: "Intermediate" },
  advanced: { stars: 3, label: "Advanced" },
};

export const ALL_SPORTS: Sport[] = ["pickleball", "lawn_bowling", "tennis", "badminton", "racquetball", "flag_football"];
export const ALL_SKILLS: SkillLevel[] = ["beginner", "intermediate", "advanced"];

// Teams
export type TeamRole = "captain" | "member";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  sport: string;
  avatar_url: string | null;
  captain_id: string;
  venue_id: string | null;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  player_id: string;
  role: TeamRole;
  joined_at: string;
  player?: Player; // joined
}

export interface TeamMessage {
  id: string;
  team_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Player; // joined
}

export interface MatchResult {
  id: string;
  match_id: string;
  winner_team: 1 | 2 | null;
  team1_score: number | null;
  team2_score: number | null;
  reported_by: string | null;
  created_at: string;
}

export interface PlayerStats {
  player_id: string;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  favorite_sport: string | null;
  favorite_partner_id: string | null;
  last_played_at: string | null;
  updated_at: string;
  player?: Player; // joined
}

// Favorite Partners (computed from match history)
export interface FavoritePartner {
  partner_id: string;
  games_together: number;
  wins_together: number;
  win_rate_together: number;
  last_played_at: string | null;
  partner?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    skill_level: string;
  };
}

// ===== Social & Scheduling =====

export interface Favorite {
  id: string;
  player_id: string;
  favorite_id: string;
  created_at: string;
  favorite?: Player; // joined
}

export interface PlayerReview {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  match_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Player; // joined
}

export interface ScheduledGame {
  id: string;
  organizer_id: string;
  venue_id: string | null;
  sport: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  max_players: number;
  is_recurring: boolean;
  recurrence_rule: string | null;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  organizer?: Player; // joined
  rsvps?: GameRSVP[]; // joined
}

export interface GameRSVP {
  id: string;
  game_id: string;
  player_id: string;
  status: "going" | "maybe" | "not_going";
  created_at: string;
  player?: Player; // joined
}

export interface Friendship {
  id: string;
  player_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
  friend?: Player; // joined
  player?: Player; // joined (for incoming)
}

export interface ActivityItem {
  id: string;
  venue_id: string | null;
  player_id: string | null;
  type: "check_in" | "match_complete" | "new_player" | "scheduled_game";
  metadata: Record<string, unknown>;
  created_at: string;
  player?: Player; // joined
}

export interface PlayerReport {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  admin_notes: string | null;
  created_at: string;
  reporter?: Player; // joined
  reported?: Player; // joined
}

export interface NotificationPreferences {
  player_id: string;
  push_partner_requests: boolean;
  push_match_ready: boolean;
  push_friend_checkin: boolean;
  push_scheduled_reminder: boolean;
  email_weekly_summary: boolean;
  email_upcoming_games: boolean;
  profile_public: boolean;
  stats_public: boolean;
  updated_at: string;
}

export type ReportReason =
  | "unsportsmanlike"
  | "harassment"
  | "no_show"
  | "cheating"
  | "other";

// Staff Invitations (venue onboarding)
export type StaffInvitationStatus = "pending" | "accepted" | "expired";
export type StaffRole = "admin" | "staff";

export interface StaffInvitation {
  id: string;
  venue_id: string;
  invited_by: string;
  email: string;
  role: StaffRole;
  status: StaffInvitationStatus;
  token: string;
  created_at: string;
  expires_at: string;
}

// ===== Tournaments =====

export type TournamentFormat = "round_robin" | "single_elimination" | "double_elimination";
export type TournamentStatus = "registration" | "in_progress" | "completed" | "cancelled";
export type TournamentMatchStatus = "pending" | "in_progress" | "completed";

export const TOURNAMENT_FORMAT_LABELS: Record<TournamentFormat, string> = {
  round_robin: "Round Robin",
  single_elimination: "Single Elimination",
  double_elimination: "Double Elimination",
};

export interface Tournament {
  id: string;
  venue_id: string | null;
  name: string;
  sport: string;
  format: TournamentFormat;
  status: TournamentStatus;
  max_players: number;
  created_by: string;
  starts_at: string | null;
  created_at: string;
  creator?: Player; // joined
  participants_count?: number;
}

export interface TournamentParticipant {
  tournament_id: string;
  player_id: string;
  seed: number | null;
  eliminated: boolean;
  wins: number;
  losses: number;
  player?: Player; // joined
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  score: string | null;
  court_id: string | null;
  status: TournamentMatchStatus;
  scheduled_at: string | null;
  completed_at: string | null;
  player1?: Player; // joined
  player2?: Player; // joined
  winner?: Player; // joined
}

// Subscription / Pricing
export type SubscriptionPlan = "free" | "basic" | "premium" | "venue_owner";
export type SportSkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export const PRICING_TIERS = [
  {
    plan: "free" as SubscriptionPlan,
    name: "Free",
    price: 0,
    interval: "forever",
    cta: "Get Started",
    features: [
      "Check in & find partners",
      "Join matches & courts",
      "Basic player profile",
      "View leaderboard",
    ],
  },
  {
    plan: "premium" as SubscriptionPlan,
    name: "Premium",
    price: 9.99,
    interval: "month",
    popular: true,
    cta: "Go Premium",
    features: [
      "Everything in Free",
      "Smart skill-based matching",
      "Detailed stats & analytics",
      "Priority court assignment",
      "Schedule recurring games",
      "Ad-free experience",
    ],
  },
  {
    plan: "venue_owner" as SubscriptionPlan,
    name: "Venue Owner",
    price: 49.99,
    interval: "month",
    cta: "Contact Sales",
    features: [
      "Everything in Premium",
      "Full admin dashboard",
      "Custom branding & theming",
      "Kiosk mode for iPads",
      "Export data & reports",
      "Multi-court management",
      "Priority support",
    ],
  },
];
