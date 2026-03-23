import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

/**
 * GET /api/bowls/members?tournament_id=xxx&search=xxx&skill=novice|expert
 * List all roster members for a tournament/club.
 */
export async function GET(req: NextRequest) {
  const tournamentId = req.nextUrl.searchParams.get("tournament_id");
  const search = req.nextUrl.searchParams.get("search");
  const skill = req.nextUrl.searchParams.get("skill");

  if (!tournamentId) {
    return NextResponse.json({ error: "tournament_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("club_members_roster")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("display_name");

  if (search) {
    query = query.ilike("display_name", `%${search}%`);
  }

  if (skill && (skill === "novice" || skill === "expert")) {
    query = query.eq("skill_level", skill);
  }

  const { data, error } = await query;

  if (error) {
    return apiError(error, "bowls/members", 500);
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/bowls/members
 * Add a new member to the roster.
 * Body: { tournament_id, display_name, first_name?, last_name?, skill_level?, member_since?, phone?, email?, notes? }
 *
 * Also supports bulk import:
 * Body: { tournament_id, bulk: ["Name 1", "Name 2", ...] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournament_id, bulk } = body;

    if (!tournament_id) {
      return NextResponse.json({ error: "tournament_id required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Bulk import mode
    if (bulk && Array.isArray(bulk)) {
      const members = bulk
        .map((name: string) => name.trim())
        .filter((name: string) => name.length > 0)
        .map((name: string) => {
          const parts = name.split(" ");
          const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];
          const lastName = parts.length > 1 ? parts[parts.length - 1] : null;
          return {
            tournament_id,
            display_name: name,
            first_name: firstName,
            last_name: lastName,
            skill_level: "novice" as const,
          };
        });

      if (members.length === 0) {
        return NextResponse.json({ error: "No valid names provided" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("club_members_roster")
        .insert(members)
        .select();

      if (error) {
        return apiError(error, "bowls/members", 500);
      }

      return NextResponse.json({ members: data, count: data?.length ?? 0 }, { status: 201 });
    }

    // Single member insert
    const { display_name, first_name, last_name, skill_level, member_since, phone, email, notes } = body;

    if (!display_name) {
      return NextResponse.json({ error: "display_name required" }, { status: 400 });
    }

    if (skill_level && !["novice", "expert"].includes(skill_level)) {
      return NextResponse.json({ error: "skill_level must be 'novice' or 'expert'" }, { status: 400 });
    }

    const insertData: Record<string, unknown> = {
      tournament_id,
      display_name,
      skill_level: skill_level || "novice",
    };

    if (first_name) insertData.first_name = first_name;
    if (last_name) insertData.last_name = last_name;
    if (member_since) insertData.member_since = member_since;
    if (phone) insertData.phone = phone;
    if (email) insertData.email = email;
    if (notes) insertData.notes = notes;

    const { data, error } = await supabase
      .from("club_members_roster")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return apiError(error, "bowls/members", 500);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add member" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bowls/members
 * Update a member.
 * Body: { id, ...fields_to_update }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    if (updates.skill_level && !["novice", "expert"].includes(updates.skill_level)) {
      return NextResponse.json({ error: "skill_level must be 'novice' or 'expert'" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("club_members_roster")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return apiError(error, "bowls/members", 500);
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update member" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bowls/members
 * Remove a member from the roster.
 * Body: { id }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("club_members_roster")
      .delete()
      .eq("id", id);

    if (error) {
      return apiError(error, "bowls/members", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete member" },
      { status: 500 }
    );
  }
}
