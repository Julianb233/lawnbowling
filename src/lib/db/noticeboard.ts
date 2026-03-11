import { createClient } from "@/lib/supabase/server";
import type {
  NoticeboardPost,
  NoticeboardComment,
  NoticeboardEmoji,
} from "@/lib/types";

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function getNoticeboardPosts(
  venueId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<NoticeboardPost[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("noticeboard_posts")
    .select(
      `
      *,
      author:players!noticeboard_posts_author_id_fkey(id, display_name, avatar_url, role),
      reactions:noticeboard_reactions(id, player_id, emoji),
      comments:noticeboard_comments(count)
    `
    )
    .eq("venue_id", venueId)
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Transform the data to include reaction_counts and comment_count
  return (data ?? []).map((post) => {
    const reactions = (post.reactions ?? []) as Array<{
      id: string;
      player_id: string;
      emoji: NoticeboardEmoji;
    }>;
    const reaction_counts = {} as Record<NoticeboardEmoji, number>;
    for (const r of reactions) {
      reaction_counts[r.emoji] = (reaction_counts[r.emoji] ?? 0) + 1;
    }

    const commentAgg = post.comments as unknown as Array<{ count: number }>;
    const comment_count =
      commentAgg && commentAgg.length > 0 ? commentAgg[0].count : 0;

    return {
      ...post,
      reactions,
      reaction_counts,
      comment_count,
      comments: undefined,
    } as unknown as NoticeboardPost;
  });
}

export async function createNoticeboardPost(post: {
  venue_id: string;
  club_id?: string;
  author_id: string;
  type: "announcement" | "tournament_result" | "member_post";
  title?: string;
  body: string;
  tournament_id?: string;
  is_pinned?: boolean;
}): Promise<NoticeboardPost> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("noticeboard_posts")
    .insert({
      venue_id: post.venue_id,
      club_id: post.club_id ?? null,
      author_id: post.author_id,
      type: post.type,
      title: post.title ?? null,
      body: post.body,
      tournament_id: post.tournament_id ?? null,
      is_pinned: post.is_pinned ?? false,
    })
    .select(
      "*, author:players!noticeboard_posts_author_id_fkey(id, display_name, avatar_url, role)"
    )
    .single();

  if (error) throw error;
  return data as NoticeboardPost;
}

export async function updateNoticeboardPost(
  postId: string,
  updates: { is_pinned?: boolean; is_deleted?: boolean }
): Promise<NoticeboardPost> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("noticeboard_posts")
    .update(updates)
    .eq("id", postId)
    .select(
      "*, author:players!noticeboard_posts_author_id_fkey(id, display_name, avatar_url, role)"
    )
    .single();

  if (error) throw error;
  return data as NoticeboardPost;
}

// ─── Reactions ───────────────────────────────────────────────────────────────

export async function toggleReaction(
  postId: string,
  playerId: string,
  emoji: NoticeboardEmoji
): Promise<{ action: "added" | "removed" }> {
  const supabase = await createClient();

  // Check if reaction exists
  const { data: existing } = await supabase
    .from("noticeboard_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("player_id", playerId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("noticeboard_reactions")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { action: "removed" };
  } else {
    const { error } = await supabase
      .from("noticeboard_reactions")
      .insert({ post_id: postId, player_id: playerId, emoji });
    if (error) throw error;
    return { action: "added" };
  }
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(
  postId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<NoticeboardComment[]> {
  const { limit = 10, offset = 0 } = options;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("noticeboard_comments")
    .select(
      "*, author:players!noticeboard_comments_author_id_fkey(id, display_name, avatar_url, role)"
    )
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as NoticeboardComment[];
}

export async function createComment(comment: {
  post_id: string;
  author_id: string;
  body: string;
}): Promise<NoticeboardComment> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("noticeboard_comments")
    .insert(comment)
    .select(
      "*, author:players!noticeboard_comments_author_id_fkey(id, display_name, avatar_url, role)"
    )
    .single();

  if (error) throw error;
  return data as NoticeboardComment;
}

export async function softDeleteComment(commentId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("noticeboard_comments")
    .update({ is_deleted: true })
    .eq("id", commentId);

  if (error) throw error;
}

// ─── Auto-post tournament results ────────────────────────────────────────────

export async function createTournamentResultPost(
  tournamentId: string
): Promise<NoticeboardPost | null> {
  const supabase = await createClient();

  // Prevent duplicate auto-posts for the same tournament
  const { data: existingPost } = await supabase
    .from("noticeboard_posts")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("type", "tournament_result")
    .maybeSingle();

  if (existingPost) return null;

  // Get tournament details
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, name, venue_id, created_by, starts_at")
    .eq("id", tournamentId)
    .single();

  if (tError || !tournament || !tournament.venue_id) return null;

  // Get top scores for the tournament
  const { data: scores } = await supabase
    .from("tournament_scores")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("is_finalized", true)
    .order("round", { ascending: false })
    .limit(10);

  // Build result summary body
  const date = tournament.starts_at
    ? new Date(tournament.starts_at).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  let body = `Tournament completed on ${date}.\n\n`;

  if (scores && scores.length > 0) {
    // Summarize top rink scores
    const latestRound = Math.max(...scores.map((s) => s.round));
    const finalScores = scores.filter((s) => s.round === latestRound);

    for (const score of finalScores.slice(0, 3)) {
      const teamANames = (
        score.team_a_players as Array<{ display_name: string }>
      )
        .map((p) => p.display_name)
        .join(", ");
      const teamBNames = (
        score.team_b_players as Array<{ display_name: string }>
      )
        .map((p) => p.display_name)
        .join(", ");
      body += `**Rink ${score.rink}:** ${teamANames} (${score.total_a}) vs ${teamBNames} (${score.total_b})\n`;
    }
  } else {
    body += "Check the tournament page for full results.";
  }

  const title = `${tournament.name} -- Results`;

  return createNoticeboardPost({
    venue_id: tournament.venue_id,
    author_id: tournament.created_by,
    type: "tournament_result",
    title,
    body,
    tournament_id: tournamentId,
  });
}

// ─── Push notifications for announcements ────────────────────────────────────

export async function getVenuePlayerIds(
  venueId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("id")
    .eq("venue_id", venueId);

  if (error) return [];
  return (data ?? []).map((p) => p.id);
}
