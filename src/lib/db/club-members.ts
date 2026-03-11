import { createClient } from "@/lib/supabase/server";

export interface ClubMember {
  id: string;
  club_id: string;
  player_id: string;
  role: "member" | "officer" | "captain" | "coach" | "social_coordinator";
  joined_at: string;
  status: "active" | "inactive" | "pending";
  is_primary_club: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClubMemberWithPlayer extends ClubMember {
  player: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    skill_level: string;
  };
}

export interface ClubMemberWithClub extends ClubMember {
  club: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state_code: string;
  };
}

export async function getClubMembers(clubId: string, status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("club_members")
    .select(
      "*, player:players(id, display_name, avatar_url, skill_level)"
    )
    .eq("club_id", clubId)
    .order("role", { ascending: true })
    .order("joined_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ClubMemberWithPlayer[];
}

export async function getPlayerClubs(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_members")
    .select(
      "*, club:clubs(id, name, slug, city, state_code)"
    )
    .eq("player_id", playerId)
    .eq("status", "active")
    .order("is_primary_club", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClubMemberWithClub[];
}

export async function joinClub(playerId: string, clubId: string) {
  const supabase = await createClient();

  // Check if already a member
  const { data: existing } = await supabase
    .from("club_members")
    .select("id, status")
    .eq("club_id", clubId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "active") {
      throw new Error("Already a member of this club");
    }
    // Reactivate inactive membership
    const { data, error } = await supabase
      .from("club_members")
      .update({ status: "pending" })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as ClubMember;
  }

  // Check if this is the player's first club
  const { count } = await supabase
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("player_id", playerId)
    .eq("status", "active");

  const { data, error } = await supabase
    .from("club_members")
    .insert({
      club_id: clubId,
      player_id: playerId,
      status: "pending",
      is_primary_club: (count ?? 0) === 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ClubMember;
}

export async function leaveClub(playerId: string, clubId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("player_id", playerId);

  if (error) throw error;
}

export async function updateMemberStatus(
  memberId: string,
  status: "active" | "inactive" | "pending"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_members")
    .update({ status })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data as ClubMember;
}

export async function updateMemberRole(
  memberId: string,
  role: ClubMember["role"]
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_members")
    .update({ role })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data as ClubMember;
}

export async function setPrimaryClub(playerId: string, clubId: string) {
  const supabase = await createClient();

  // Unset all other primary clubs
  await supabase
    .from("club_members")
    .update({ is_primary_club: false })
    .eq("player_id", playerId);

  // Set the new primary
  const { data, error } = await supabase
    .from("club_members")
    .update({ is_primary_club: true })
    .eq("player_id", playerId)
    .eq("club_id", clubId)
    .select()
    .single();

  if (error) throw error;
  return data as ClubMember;
}

export async function getClubMemberCount(clubId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("club_id", clubId)
    .eq("status", "active");

  if (error) throw error;
  return count ?? 0;
}
