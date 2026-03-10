import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTeamMembers, joinTeam, leaveTeam, removeMember } from "@/lib/db/teams";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const members = await getTeamMembers(id);
    return NextResponse.json({ members });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await joinTeam(id, user.id);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Join team error:", error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const playerId = url.searchParams.get("playerId");

    if (playerId && playerId !== user.id) {
      // Captain removing another member — verify caller is captain
      const { data: team } = await supabase
        .from("teams")
        .select("captain_id")
        .eq("id", id)
        .single();

      if (!team || team.captain_id !== user.id) {
        return NextResponse.json({ error: "Only the team captain can remove members" }, { status: 403 });
      }

      await removeMember(id, playerId);
    } else {
      // Player leaving their own team
      await leaveTeam(id, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave/remove error:", error);
    return NextResponse.json({ error: "Failed to leave/remove" }, { status: 500 });
  }
}
