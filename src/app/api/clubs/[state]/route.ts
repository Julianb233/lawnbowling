import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Valid US state codes
const VALID_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
]);

/**
 * GET /api/clubs/[state]
 * List all clubs for a given US state (2-letter code).
 *
 * Query params:
 *   activity - filter by activity
 *   surface  - filter by surface_type
 *   status   - filter by club status
 *   sort     - sort field (name, city, member_count, founded). Default: name
 *   order    - sort order (asc, desc). Default: asc
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ state: string }> }
) {
  const { state } = await params;
  const stateCode = state.toUpperCase();

  if (!VALID_STATES.has(stateCode)) {
    return NextResponse.json(
      { error: `Invalid state code: ${state}. Use a 2-letter US state code.` },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const activity = searchParams.get("activity");
  const surface = searchParams.get("surface");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") ?? "name";
  const order = searchParams.get("order") ?? "asc";

  const supabase = await createClient();

  let query = supabase
    .from("clubs")
    .select("*", { count: "exact" })
    .eq("state_code", stateCode)
    .order(sort, { ascending: order === "asc" });

  if (activity) query = query.contains("activities", [activity]);
  if (surface) query = query.eq("surface_type", surface);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get state name from first result, or use the code
  const stateName = data && data.length > 0 ? data[0].state : stateCode;

  return NextResponse.json({
    state: stateCode,
    stateName,
    clubs: data ?? [],
    total: count ?? 0,
  });
}
