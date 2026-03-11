/**
 * Multi-club database types
 * Extends the base Club type with related entities for club scoping.
 */

import type { Club } from "./clubs";

// Club member roles within a club
export type ClubMemberRole = "member" | "officer" | "captain" | "coach" | "social_coordinator";
export type ClubMemberStatus = "active" | "inactive" | "pending";

// Club claim statuses
export type ClubClaimStatus = "pending" | "approved" | "rejected";

// Dashboard stats from the club_dashboard_stats view
export interface ClubDashboardStats {
  club_id: string;
  club_name: string;
  slug: string;
  active_members: number;
  pending_members: number;
  total_tournaments: number;
  active_tournaments: number;
  linked_venues: number;
}

// Club with additional dashboard context
export interface ClubWithStats extends Club {
  stats?: ClubDashboardStats;
}

// Club member with player details
export interface ClubMemberDetail {
  id: string;
  club_id: string;
  player_id: string;
  role: ClubMemberRole;
  joined_at: string;
  status: ClubMemberStatus;
  is_primary_club: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  player: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    skill_level: string;
    email?: string;
  };
}

// Club tournament (tournament scoped to a club)
export interface ClubTournament {
  id: string;
  club_id: string;
  name: string;
  sport: string;
  format: string;
  status: string;
  max_players: number;
  starts_at: string | null;
  created_at: string;
  participants_count?: number;
}

// Club venue link
export interface ClubVenueLink {
  id: string;
  club_id: string;
  venue_id: string;
  is_primary: boolean;
  created_at: string;
  venue?: {
    id: string;
    name: string;
    address: string | null;
  };
}

// Club claim request with player details
export interface ClubClaimDetail {
  id: string;
  club_id: string;
  player_id: string;
  status: ClubClaimStatus;
  role_at_club: string | null;
  message: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  player?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// Admin dashboard tab type
export type ClubAdminTab = "overview" | "members" | "tournaments" | "settings";
