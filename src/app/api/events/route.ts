import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category"); // event_type filter
    const month = url.searchParams.get("month"); // YYYY-MM format
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);

    const supabase = await createClient();
    let query = supabase
      .from("club_events")
      .select("*")
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(limit);

    if (category && category !== "all") {
      query = query.eq("event_type", category);
    }

    if (month) {
      const startDate = `${month}-01`;
      const [y, m] = month.split("-").map(Number);
      const endDate = new Date(y, m, 0).toISOString().split("T")[0];
      query = query.gte("event_date", startDate).lte("event_date", endDate);
    } else {
      query = query.gte("event_date", new Date().toISOString().split("T")[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ events: data ?? [] });
  } catch (error) {
    console.error("Get global events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
