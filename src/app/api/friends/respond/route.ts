import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getPlayerIdFromAuth } from "@/lib/db/get-player-id";
import { apiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Resolve auth UID to player UUID — friend_id references players.id, not auth UID
  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { request_id, accept } = await request.json();

  // Get the friendship to know both player IDs
  const { data: friendship } = await supabase
    .from("friendships")
    .select("player_id, friend_id")
    .eq("id", request_id)
    .single();

  const { error } = await supabase
    .from("friendships")
    .update({ status: accept ? "accepted" : "blocked" })
    .eq("id", request_id)
    .eq("friend_id", playerId);
  if (error) return apiError(error, "POST /api/friends/respond", 400);

  // Log social activity when a friend request is accepted
  if (accept && friendship) {
    const player = await getPlayerByUserId(user.id);
    if (player) {
      try {
        await supabase.from("activity_feed").insert({
          player_id: player.id,
          venue_id: null,
          type: "friend_accepted",
          metadata: {
            friend_id: friendship.player_id,
          },
        });
      } catch {
        // activity_feed table may not exist in all environments
      }
    }
  }

  return NextResponse.json({ ok: true });
}
