import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPlayer, updatePlayer, getPlayerByUserId } from "@/lib/db/players";
import type { SkillLevel, Sport } from "@/lib/db/players";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = await getPlayerByUserId(user.id);
    if (!player) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
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
      home_club_id: null,
      preferred_position: null,
      bio: null,
      preferred_hand: null,
      years_experience: null,
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, skill_level, sports, avatar_url, bio, preferred_position, preferred_hand, years_experience, home_club_id } = body;

    const updates: Record<string, unknown> = {};
    if (display_name !== undefined) {
      const trimmed = display_name.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Display name cannot be empty" }, { status: 400 });
      }
      updates.display_name = trimmed;
    }
    if (skill_level !== undefined) updates.skill_level = skill_level;
    if (sports !== undefined) updates.sports = sports;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (bio !== undefined) updates.bio = bio ? String(bio).slice(0, 500) : null;
    if (preferred_position !== undefined) updates.preferred_position = preferred_position;
    if (preferred_hand !== undefined) updates.preferred_hand = preferred_hand;
    if (years_experience !== undefined) updates.years_experience = years_experience;
    if (home_club_id !== undefined) updates.home_club_id = home_club_id;

    const player = await updatePlayer(user.id, updates);
    return NextResponse.json(player);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
