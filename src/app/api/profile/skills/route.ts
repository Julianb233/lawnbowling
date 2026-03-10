import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerSportSkills, upsertSportSkill } from "@/lib/db/sport-skills";

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get("player_id");
  if (!playerId) return NextResponse.json({ error: "Missing player_id" }, { status: 400 });

  try {
    const skills = await getPlayerSportSkills(playerId);
    return NextResponse.json(skills);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { sport, skill_level } = await req.json();
  if (!sport || !skill_level) {
    return NextResponse.json({ error: "Missing sport or skill_level" }, { status: 400 });
  }

  try {
    const result = await upsertSportSkill(player.id, sport, skill_level);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
