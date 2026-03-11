import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getNoticeboardPosts,
  createNoticeboardPost,
  getVenuePlayerIds,
} from "@/lib/db/noticeboard";
import { sendPushToPlayer } from "@/lib/push";
import type { NoticeboardPostType } from "@/lib/types";

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

    const { data: player } = await supabase
      .from("players")
      .select("id, venue_id")
      .eq("user_id", user.id)
      .single();

    if (!player?.venue_id) {
      return NextResponse.json({ error: "No venue assigned" }, { status: 400 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

    const posts = await getNoticeboardPosts(player.venue_id, { limit, offset });

    return NextResponse.json({ posts, hasMore: posts.length === limit });
  } catch (error) {
    console.error("Get noticeboard posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!player?.venue_id) {
      return NextResponse.json({ error: "No venue assigned" }, { status: 400 });
    }

    const body = await request.json();
    const { type, title, content, is_pinned } = body as {
      type: NoticeboardPostType;
      title?: string;
      content: string;
      is_pinned?: boolean;
    };

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    // Only admins can create announcements
    if (type === "announcement" && player.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create announcements" },
        { status: 403 }
      );
    }

    const postType = type === "announcement" ? "announcement" : "member_post";

    const post = await createNoticeboardPost({
      venue_id: player.venue_id,
      author_id: player.id,
      type: postType,
      title: title?.trim() || undefined,
      body: content.trim(),
      is_pinned: postType === "announcement" && is_pinned ? true : false,
    });

    // Send push notifications for pinned announcements
    if (post.is_pinned && postType === "announcement") {
      const playerIds = await getVenuePlayerIds(player.venue_id);
      const notificationPromises = playerIds
        .filter((pid) => pid !== player.id) // Don't notify the author
        .map((pid) =>
          sendPushToPlayer(pid, "noticeboard_announcement", {
            title: "New Announcement",
            body: title?.trim() || content.trim().slice(0, 100),
            tag: `noticeboard-${post.id}`,
            url: "/activity",
          }).catch(() => {
            /* swallow push errors */
          })
        );
      // Fire and forget - don't block response on push delivery
      Promise.allSettled(notificationPromises);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create noticeboard post error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
