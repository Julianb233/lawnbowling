import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { getWaiverByPlayerId } from "@/lib/db/waivers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playerId } = await params;

    // Only allow the player's own waiver status, or admins
    const { data: player } = await supabase
      .from("players")
      .select("id, user_id")
      .eq("id", playerId)
      .single();

    const isOwner = player?.user_id === user.id;
    const userIsAdmin = await isAdmin(user.id);

    if (!isOwner && !userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const waiver = await getWaiverByPlayerId(playerId);

    return NextResponse.json({
      signed: !!waiver,
      waiver: waiver
        ? {
            signed_at: waiver.signed_at,
            ip_address: waiver.ip_address,
          }
        : null,
    });
  } catch (error) {
    console.error("Waiver status error:", error);
    return NextResponse.json({ error: "Failed to fetch waiver status" }, { status: 500 });
  }
}
