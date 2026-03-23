import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { apiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get("player_id");

  try {
    const supabase = await createClient();

    if (playerId) {
      // Public: fetch any player's availability
      const { data, error } = await supabase
        .from("player_availability")
        .select("*")
        .eq("player_id", playerId)
        .eq("is_active", true)
        .order("day_of_week")
        .order("start_time");

      if (error) return apiError(error, "GET /api/profile/availability", 500);
      return NextResponse.json(data);
    }

    // Private: fetch own availability
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = await getPlayerByUserId(user.id);
    if (!player) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("player_availability")
      .select("*")
      .eq("player_id", player.id)
      .order("day_of_week")
      .order("start_time");

    if (error) return apiError(error, "GET /api/profile/availability", 500);
    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "GET /api/profile/availability", 500);
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { slots } = body as {
      slots: { day_of_week: number; start_time: string; end_time: string }[];
    };

    if (!slots || !Array.isArray(slots)) {
      return NextResponse.json({ error: "slots array required" }, { status: 400 });
    }

    // Delete existing availability and replace with new slots
    const { error: deleteError } = await supabase
      .from("player_availability")
      .delete()
      .eq("player_id", player.id);

    if (deleteError) {
      return apiError(deleteError, "POST /api/profile/availability", 500);
    }

    if (slots.length > 0) {
      const rows = slots.map((s) => ({
        player_id: player.id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from("player_availability")
        .insert(rows);

      if (insertError) {
        return apiError(insertError, "POST /api/profile/availability", 500);
      }
    }

    // Return updated availability
    const { data } = await supabase
      .from("player_availability")
      .select("*")
      .eq("player_id", player.id)
      .order("day_of_week")
      .order("start_time");

    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "POST /api/profile/availability", 500);
  }
}

export async function DELETE(req: NextRequest) {
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

    const slotId = req.nextUrl.searchParams.get("id");

    if (slotId) {
      const { error } = await supabase
        .from("player_availability")
        .delete()
        .eq("id", slotId)
        .eq("player_id", player.id);

      if (error) return apiError(error, "DELETE /api/profile/availability", 500);
    } else {
      const { error } = await supabase
        .from("player_availability")
        .delete()
        .eq("player_id", player.id);

      if (error) return apiError(error, "DELETE /api/profile/availability", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "DELETE /api/profile/availability", 500);
  }
}
