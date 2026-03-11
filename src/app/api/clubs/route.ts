import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const stateCode = searchParams.get("state");
  const activity = searchParams.get("activity");
  const search = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const supabase = await createClient();

  let query = supabase
    .from("clubs")
    .select("*", { count: "exact" })
    .order("state", { ascending: true })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (region) query = query.eq("region", region);
  if (stateCode) query = query.eq("state_code", stateCode.toUpperCase());
  if (activity) query = query.contains("activities", [activity]);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    clubs: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}
