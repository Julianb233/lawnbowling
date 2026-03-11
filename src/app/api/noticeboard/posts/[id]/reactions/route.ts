import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleReaction } from "@/lib/db/noticeboard";
import { NOTICEBOARD_EMOJIS, type NoticeboardEmoji } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
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
    const { emoji } = body as { emoji: NoticeboardEmoji };

    if (!emoji || !NOTICEBOARD_EMOJIS.includes(emoji)) {
      return NextResponse.json(
        { error: "Invalid emoji. Must be one of: " + NOTICEBOARD_EMOJIS.join(", ") },
        { status: 400 }
      );
    }

    const result = await toggleReaction(postId, player.id, emoji);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Toggle reaction error:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}
