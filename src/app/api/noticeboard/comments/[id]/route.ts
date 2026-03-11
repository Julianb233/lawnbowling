import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { softDeleteComment } from "@/lib/db/noticeboard";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
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
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Check that the player is either the comment author or an admin
    const { data: comment } = await supabase
      .from("noticeboard_comments")
      .select("author_id")
      .eq("id", commentId)
      .single();

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.author_id !== player.id && player.role !== "admin") {
      return NextResponse.json(
        { error: "Only the author or an admin can delete this comment" },
        { status: 403 }
      );
    }

    await softDeleteComment(commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
