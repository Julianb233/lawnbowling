import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getClubMessages, sendClubMessage } from "@/lib/db/club-messages";

export const dynamic = "force-dynamic";

/** GET /api/clubs/chat?clubId=xxx&before=timestamp */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clubId = req.nextUrl.searchParams.get("clubId");
  if (!clubId) {
    return NextResponse.json({ error: "clubId required" }, { status: 400 });
  }

  const before = req.nextUrl.searchParams.get("before") ?? undefined;

  try {
    const messages = await getClubMessages(clubId, { before });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch club messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/** POST /api/clubs/chat { clubId, content } */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clubId, content } = body;

  if (!clubId || !content?.trim()) {
    return NextResponse.json(
      { error: "clubId and content required" },
      { status: 400 }
    );
  }

  const player = await getPlayerByUserId(user.id);
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  // Verify membership
  const { data: membership } = await supabase
    .from("club_memberships")
    .select("id")
    .eq("club_id", clubId)
    .eq("player_id", player.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "Not a member of this club" },
      { status: 403 }
    );
  }

  try {
    const message = await sendClubMessage(clubId, player.id, content.trim());
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Failed to send club message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
