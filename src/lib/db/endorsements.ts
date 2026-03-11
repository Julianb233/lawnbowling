import { createClient } from "@/lib/supabase/server";

export type EndorsementSkill =
  | "great_skip"
  | "reliable_lead"
  | "strong_second"
  | "accurate_draw"
  | "powerful_drive"
  | "good_sportsmanship"
  | "team_player"
  | "tactical_mind";

export const ENDORSEMENT_SKILLS: { id: EndorsementSkill; label: string }[] = [
  { id: "great_skip", label: "Great Skip" },
  { id: "reliable_lead", label: "Reliable Lead" },
  { id: "strong_second", label: "Strong Second" },
  { id: "accurate_draw", label: "Accurate Draw" },
  { id: "powerful_drive", label: "Powerful Drive" },
  { id: "good_sportsmanship", label: "Good Sportsmanship" },
  { id: "team_player", label: "Team Player" },
  { id: "tactical_mind", label: "Tactical Mind" },
];

export interface EndorsementCount {
  skill: EndorsementSkill;
  count: number;
}

export interface PlayerEndorsement {
  id: string;
  endorser_id: string;
  endorsed_id: string;
  skill: EndorsementSkill;
  created_at: string;
}

export async function getEndorsementCounts(playerId: string): Promise<EndorsementCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_endorsements")
    .select("skill")
    .eq("endorsed_id", playerId);

  if (error) throw error;

  const counts = new Map<EndorsementSkill, number>();
  for (const row of data ?? []) {
    const skill = row.skill as EndorsementSkill;
    counts.set(skill, (counts.get(skill) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getMyEndorsementsFor(endorserId: string, endorsedId: string): Promise<EndorsementSkill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_endorsements")
    .select("skill")
    .eq("endorser_id", endorserId)
    .eq("endorsed_id", endorsedId);

  if (error) throw error;
  return (data ?? []).map((r) => r.skill as EndorsementSkill);
}

export async function addEndorsement(endorserId: string, endorsedId: string, skill: EndorsementSkill) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("player_endorsements")
    .insert({ endorser_id: endorserId, endorsed_id: endorsedId, skill });

  if (error) throw error;
}

export async function removeEndorsement(endorserId: string, endorsedId: string, skill: EndorsementSkill) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("player_endorsements")
    .delete()
    .eq("endorser_id", endorserId)
    .eq("endorsed_id", endorsedId)
    .eq("skill", skill);

  if (error) throw error;
}
