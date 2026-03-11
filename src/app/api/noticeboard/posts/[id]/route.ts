import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateNoticeboardPost } from "@/lib/db/noticeboard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id, venue_id, role")
      .eq("user_id", user.id)
      .single();

    if (!player || player.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can modify posts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates: { is_pinned?: boolean; is_deleted?: boolean } = {};

    if (typeof body.is_pinned === "boolean") {
      updates.is_pinned = body.is_pinned;
    }
    if (typeof body.is_deleted === "boolean") {
      updates.is_deleted = body.is_deleted;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const post = await updateNoticeboardPost(id, updates);
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Update noticeboard post error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}
