import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/tv/announcements?tournament_id=xxx
 * List active announcements, optionally filtered by tournament.
 */
export async function GET(req: NextRequest) {
  const tournamentId = req.nextUrl.searchParams.get("tournament_id");
  const supabase = await createClient();

  let query = supabase
    .from("tv_announcements")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (tournamentId) {
    query = query.eq("tournament_id", tournamentId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/tv/announcements
 * Create a new announcement.
 * Body: { message, tournament_id? }
 */
export async function POST(req: NextRequest) {
  const { message, tournament_id } = (await req.json()) as {
    message: string;
    tournament_id?: string;
  };

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tv_announcements")
    .insert({ message, tournament_id: tournament_id ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/tv/announcements
 * Deactivate an announcement.
 * Body: { id }
 */
export async function DELETE(req: NextRequest) {
  const { id } = (await req.json()) as { id: string };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tv_announcements")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
