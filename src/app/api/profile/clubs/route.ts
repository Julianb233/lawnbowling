import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { apiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get("player_id");

  try {
    const supabase = await createClient();

    if (playerId) {
      const { data, error } = await supabase
        .from("player_clubs")
        .select("*")
        .eq("player_id", playerId)
        .order("joined_at", { ascending: false });

      if (error) return apiError(error, "profile/clubs", 500);
      return NextResponse.json(data);
    }

    // Own clubs
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = await getPlayerByUserId(user.id);
    if (!player) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("player_clubs")
      .select("*")
      .eq("player_id", player.id)
      .order("joined_at", { ascending: false });

    if (error) return apiError(error, "profile/clubs", 500);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch clubs" },
      { status: 500 }
    );
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
    const { club_slug, role } = body as { club_slug: string; role?: string };

    if (!club_slug) {
      return NextResponse.json({ error: "club_slug required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("player_clubs")
      .upsert(
        {
          player_id: player.id,
          club_slug,
          role: role || "member",
        },
        { onConflict: "player_id,club_slug" }
      )
      .select()
      .single();

    if (error) return apiError(error, "profile/clubs", 500);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to join club" },
      { status: 500 }
    );
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

    const clubSlug = req.nextUrl.searchParams.get("club_slug");
    if (!clubSlug) {
      return NextResponse.json({ error: "club_slug required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("player_clubs")
      .delete()
      .eq("player_id", player.id)
      .eq("club_slug", clubSlug);

    if (error) return apiError(error, "profile/clubs", 500);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to leave club" },
      { status: 500 }
    );
  }
}
