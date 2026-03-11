import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ClubEventType } from "@/lib/types";

const VALID_EVENT_TYPES: ClubEventType[] = ["social", "tournament", "meeting", "practice", "other"];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const clubId = url.searchParams.get("club_id");
    const month = url.searchParams.get("month"); // YYYY-MM format
    const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);

    if (!clubId) {
      return NextResponse.json({ error: "club_id is required" }, { status: 400 });
    }

    const supabase = await createClient();
    let query = supabase
      .from("club_events")
      .select("*")
      .eq("club_id", clubId)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(limit);

    if (month) {
      const startDate = `${month}-01`;
      const [y, m] = month.split("-").map(Number);
      const endDate = new Date(y, m, 0).toISOString().split("T")[0]; // last day of month
      query = query.gte("event_date", startDate).lte("event_date", endDate);
    } else {
      // Default: upcoming events from today
      query = query.gte("event_date", new Date().toISOString().split("T")[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ events: data ?? [] });
  } catch (error) {
    console.error("Get club events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!player || player.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create events" }, { status: 403 });
    }

    const body = await request.json();
    const { club_id, title, description, event_date, start_time, end_time, event_type, location } = body;

    if (!club_id || !title?.trim() || !event_date) {
      return NextResponse.json({ error: "club_id, title, and event_date are required" }, { status: 400 });
    }

    if (event_type && !VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("club_events")
      .insert({
        club_id,
        title: title.trim(),
        description: description?.trim() || null,
        event_date,
        start_time: start_time || null,
        end_time: end_time || null,
        event_type: event_type || "other",
        location: location?.trim() || null,
        created_by: player.id,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error) {
    console.error("Create club event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
