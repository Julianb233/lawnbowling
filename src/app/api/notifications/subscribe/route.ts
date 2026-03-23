import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerIdFromAuth } from "@/lib/db/get-player-id";
import { apiError } from "@/lib/api-error-handler";

/** Save a push subscription for the authenticated user */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { subscription } = await request.json();
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      player_id: playerId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "player_id,endpoint" }
  );

  if (error) return apiError(error, "notifications/subscribe", 400);
  return NextResponse.json({ ok: true });
}

/** Remove a push subscription for the authenticated user */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { endpoint } = await request.json();
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("player_id", playerId)
    .eq("endpoint", endpoint);

  if (error) return apiError(error, "notifications/subscribe", 400);
  return NextResponse.json({ ok: true });
}
