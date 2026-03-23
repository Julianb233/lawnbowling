import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

/**
 * GET /api/clubs
 * List clubs with search, filtering, and pagination.
 *
 * Query params:
 *   q        - search term (matches name, city, state, description)
 *   country  - filter by country_code (e.g. "US", "GB", "CA")
 *   region   - filter by region (west, east, south, midwest)
 *   state    - filter by 2-letter state code
 *   activity - filter by activity (e.g. "Tournaments")
 *   surface  - filter by surface_type (natural_grass, synthetic, hybrid, unknown)
 *   division - filter by Bowls USA division
 *   status   - filter by club status (active, seasonal, inactive, unverified, claimed)
 *   tag      - filter by tag
 *   featured - if "true", return only featured clubs
 *   sort     - sort field (name, state, member_count, founded, created_at). Default: state
 *   order    - sort order (asc, desc). Default: asc
 *   page     - 1-based page number (takes precedence over offset)
 *   limit    - page size (default 20, max 500)
 *   offset   - pagination offset (default 0)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const region = searchParams.get("region");
  const stateCode = searchParams.get("state");
  const activity = searchParams.get("activity");
  const search = searchParams.get("q");
  const surface = searchParams.get("surface");
  const division = searchParams.get("division");
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");
  const featured = searchParams.get("featured");
  const sort = searchParams.get("sort") ?? "state";
  const order = searchParams.get("order") ?? "asc";
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? "20")), 500);
  const pageParam = searchParams.get("page");
  const page = pageParam ? Math.max(1, parseInt(pageParam)) : null;
  const offset = page
    ? (page - 1) * limit
    : Math.max(0, parseInt(searchParams.get("offset") ?? "0"));

  const supabase = await createClient();

  let query = supabase
    .from("clubs")
    .select("*", { count: "exact" })
    .order(sort, { ascending: order === "asc" })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (country) query = query.eq("country_code", country.toUpperCase());
  if (region) query = query.eq("region", region);
  if (stateCode) query = query.eq("state_code", stateCode.toUpperCase());
  if (activity) query = query.contains("activities", [activity]);
  if (surface) query = query.eq("surface_type", surface);
  if (division) query = query.eq("division", division);
  if (status) query = query.eq("status", status);
  if (tag) query = query.contains("tags", [tag]);
  if (featured === "true") query = query.eq("is_featured", true);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError(error, "GET /api/clubs", 500);
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return NextResponse.json({
    clubs: data ?? [],
    total,
    page: currentPage,
    limit,
    offset,
    totalPages,
    hasMore: offset + limit < total,
  });
}

/**
 * POST /api/clubs
 * Create a new club (admin only).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.slug) {
    body.slug = `${body.name}-${body.city}-${body.state_code}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const { data, error } = await supabase
    .from("clubs")
    .insert(body)
    .select()
    .single();

  if (error) {
    return apiError(error, "POST /api/clubs", 400);
  }

  return NextResponse.json({ club: data }, { status: 201 });
}

/**
 * PATCH /api/clubs
 * Update a club by id (admin or club manager).
 */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: "Club id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clubs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return apiError(error, "PATCH /api/clubs", 400);
  }

  return NextResponse.json({ club: data });
}

/**
 * DELETE /api/clubs
 * Delete a club by id (admin only).
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Club id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("clubs").delete().eq("id", id);
  if (error) {
    return apiError(error, "DELETE /api/clubs", 400);
  }

  return NextResponse.json({ success: true });
}
