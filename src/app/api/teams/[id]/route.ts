import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTeamById, updateTeam, deleteTeam } from "@/lib/db/teams";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const team = await getTeamById(id);
    return NextResponse.json({ team });
  } catch (error) {
    console.error("Get team error:", error);
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const team = await updateTeam(id, body);
    return NextResponse.json({ team });
  } catch (error) {
    console.error("Update team error:", error);
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteTeam(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete team error:", error);
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
}
