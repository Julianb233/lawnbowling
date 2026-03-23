import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { joinTournament, leaveTournament } from "@/lib/db/tournaments";
import { apiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const body = await request.json();

    if (body.action === "leave") {
      await leaveTournament(id, player.id);
      return NextResponse.json({ success: true });
    }

    const participant = await joinTournament(id, player.id);
    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error("Join tournament error:", error);
    return apiError(error, "tournament/[id]/join", 500);
  }
}
