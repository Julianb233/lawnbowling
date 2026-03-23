import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courtId = req.nextUrl.searchParams.get("court_id");
  const playerId = req.nextUrl.searchParams.get("player_id");

  let query = supabase
    .from("court_bookings")
    .select("*, court:courts(*)")
    .order("scheduled_at", { ascending: true });

  if (courtId) query = query.eq("court_id", courtId);
  if (playerId) query = query.eq("player_id", playerId);

  const { data, error } = await query;
  if (error) return apiError(error, "bookings", 500);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const body = await req.json();
  const { court_id, scheduled_at, duration_minutes } = body;

  if (!court_id || !scheduled_at) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("court_bookings")
    .insert({
      court_id,
      player_id: player.id,
      scheduled_at,
      duration_minutes: duration_minutes || 60,
      status: "pending",
    })
    .select()
    .single();

  if (error) return apiError(error, "bookings", 500);
  return NextResponse.json(data, { status: 201 });
}
