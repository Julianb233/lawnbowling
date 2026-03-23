import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const skill = searchParams.get("skill");
    const venueId = searchParams.get("venue_id");
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") ?? "20")),
      500
    );
    const pageParam = searchParams.get("page");
    const page = pageParam ? Math.max(1, parseInt(pageParam)) : null;
    const offset = page
      ? (page - 1) * limit
      : Math.max(0, parseInt(searchParams.get("offset") ?? "0"));

    let query = supabase
      .from("players")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("display_name", `%${search}%`);
    }
    if (skill) {
      query = query.eq("skill_level", skill);
    }
    if (venueId) {
      query = query.eq("venue_id", venueId);
    }

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return NextResponse.json({
      players: data,
      total,
      page: currentPage,
      limit,
      offset,
      totalPages,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("List players error:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, role } = await request.json();
    if (!id || !role) {
      return NextResponse.json(
        { error: "id and role are required" },
        { status: 400 }
      );
    }

    const VALID_ROLES = ["player", "admin"];
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `role must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("players")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ player: data });
  } catch (error) {
    console.error("Update player role error:", error);
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 }
    );
  }
}
