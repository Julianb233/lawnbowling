import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPlayer, updatePlayer, getPlayerByUserId } from "@/lib/db/players";
import type { SkillLevel } from "@/lib/db/players";
import { logger } from "@/lib/logger";
import { validateBody, isValidationError } from "@/lib/schemas/validate";
import { profileCreateSchema, profilePatchSchema } from "@/lib/schemas";

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
    logger.error("Get profile error", { route: "profile", error });
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

    const result = await validateBody(request, profileCreateSchema);
    if (isValidationError(result)) return result;

    const player = await createPlayer({
      user_id: user.id,
      display_name: result.display_name.trim(),
      skill_level: (result.skill_level as SkillLevel) || "beginner",
      sports: ["lawn_bowling"],
      avatar_url: result.avatar_url || null,
      insurance_status: "none",
      home_club_id: null,
      preferred_position: null,
      bio: null,
      preferred_hand: null,
      years_experience: null,
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    logger.error("Create profile error", { route: "profile", error });
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

    const result = await validateBody(request, profilePatchSchema);
    if (isValidationError(result)) return result;

    const updates: Record<string, unknown> = {};
    if (result.display_name !== undefined) {
      updates.display_name = result.display_name.trim();
    }
    if (result.skill_level !== undefined) updates.skill_level = result.skill_level;
    if (result.sports !== undefined) updates.sports = ["lawn_bowling"];
    if (result.avatar_url !== undefined) updates.avatar_url = result.avatar_url;
    if (result.bio !== undefined) updates.bio = result.bio ? String(result.bio).slice(0, 500) : null;
    if (result.preferred_position !== undefined) updates.preferred_position = result.preferred_position;
    if (result.preferred_hand !== undefined) updates.preferred_hand = result.preferred_hand;
    if (result.years_experience !== undefined) updates.years_experience = result.years_experience;
    if (result.home_club_id !== undefined) updates.home_club_id = result.home_club_id;
    if (result.onboarding_state !== undefined) updates.onboarding_state = result.onboarding_state;

    const player = await updatePlayer(user.id, updates);
    return NextResponse.json(player);
  } catch (error) {
    logger.error("Update profile error", { route: "profile", error });
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
