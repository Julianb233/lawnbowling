import { createClient } from "@/lib/supabase/server";
import type { Team, TeamMember } from "@/lib/types";

export async function getMyTeams(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("team_id, role, teams(*, captain:players!teams_captain_id_fkey(id, name, avatar_url))")
    .eq("player_id", playerId)
    .order("joined_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTeamById(teamId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*, captain:players!teams_captain_id_fkey(id, name, avatar_url)")
    .eq("id", teamId)
    .single();

  if (error) throw error;
  return data;
}

export async function createTeam(team: {
  name: string;
  description?: string;
  sport: string;
  avatar_url?: string;
  captain_id: string;
  venue_id?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .insert(team)
    .select()
    .single();

  if (error) throw error;
  const newTeam = data as Team;

  // Add captain as member
  const { error: memberError } = await supabase
    .from("team_members")
    .insert({
      team_id: newTeam.id,
      player_id: team.captain_id,
      role: "captain",
    });

  if (memberError) throw memberError;
  return newTeam;
}

export async function updateTeam(teamId: string, updates: Partial<Pick<Team, "name" | "description" | "sport" | "avatar_url">>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", teamId)
    .select()
    .single();

  if (error) throw error;
  return data as Team;
}

export async function deleteTeam(teamId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) throw error;
}

export async function getTeamMembers(teamId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*, player:players(*)")
    .eq("team_id", teamId)
    .order("role", { ascending: true })
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data as (TeamMember & { player: NonNullable<TeamMember["player"]> })[];
}

export async function joinTeam(teamId: string, playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .insert({ team_id: teamId, player_id: playerId, role: "member" })
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function leaveTeam(teamId: string, playerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("player_id", playerId);

  if (error) throw error;
}

export async function removeMember(teamId: string, playerId: string) {
  return leaveTeam(teamId, playerId);
}

export async function getTeamByInviteCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*, captain:players!teams_captain_id_fkey(id, name, avatar_url), team_members(count)")
    .eq("invite_code", code)
    .single();

  if (error) throw error;
  return data;
}

export async function getMemberCount(teamId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (error) throw error;
  return count ?? 0;
}
