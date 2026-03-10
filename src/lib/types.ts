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
  created_at: string;
}

export interface Player {
  id: string;
  name: string;
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

// Board constants
export type Sport = "pickleball" | "lawn_bowling" | "tennis";

export const SPORT_LABELS: Record<Sport, { emoji: string; label: string; short: string }> = {
  pickleball: { emoji: "\u{1F3D3}", label: "Pickleball", short: "Pickle" },
  lawn_bowling: { emoji: "\u{1F3B3}", label: "Lawn Bowling", short: "Bowl" },
  tennis: { emoji: "\u{1F3BE}", label: "Tennis", short: "Tennis" },
};

export const SKILL_LABELS: Record<SkillLevel, { stars: number; label: string }> = {
  beginner: { stars: 1, label: "Beginner" },
  intermediate: { stars: 2, label: "Intermediate" },
  advanced: { stars: 3, label: "Advanced" },
};

export const ALL_SPORTS: Sport[] = ["pickleball", "lawn_bowling", "tennis"];
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
