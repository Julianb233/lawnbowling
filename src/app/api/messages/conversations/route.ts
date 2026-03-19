import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getConversations } from "@/lib/db/messages";

/** GET /api/messages/conversations — list all conversations for current user */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const player = await getPlayerByUserId(user.id);
  if (!player) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const conversations = await getConversations(player.id);
  return NextResponse.json(conversations);
}
