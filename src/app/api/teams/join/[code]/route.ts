import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTeamByInviteCode, joinTeam } from "@/lib/db/teams";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const team = await getTeamByInviteCode(code);
    return NextResponse.json({ team });
  } catch (error) {
    console.error("Get team by code error:", error);
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await getTeamByInviteCode(code);
    if (!team) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    const member = await joinTeam(team.id, user.id);
    return NextResponse.json({ member, team }, { status: 201 });
  } catch (error) {
    console.error("Join via code error:", error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}
