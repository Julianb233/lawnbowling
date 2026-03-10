import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPlayer, updatePlayer, getPlayerByUserId } from "@/lib/db/players";
import type { SkillLevel, Sport } from "@/lib/db/players";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getPlayerByUserId(user.id);
  if (existing) {
    return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
  }

  const body = await request.json();
  const { display_name, skill_level, sports, avatar_url } = body as {
    display_name: string;
    skill_level: SkillLevel;
    sports: Sport[];
    avatar_url: string | null;
  };

  if (!display_name?.trim()) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  const player = await createPlayer({
    user_id: user.id,
    display_name: display_name.trim(),
    skill_level: skill_level || "beginner",
    sports: sports || [],
    avatar_url: avatar_url || null,
    insurance_status: "none",
  });

  return NextResponse.json(player, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { display_name, skill_level, sports, avatar_url } = body;

  const updates: Record<string, unknown> = {};
  if (display_name !== undefined) updates.display_name = display_name.trim();
  if (skill_level !== undefined) updates.skill_level = skill_level;
  if (sports !== undefined) updates.sports = sports;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const player = await updatePlayer(user.id, updates);
  return NextResponse.json(player);
}
