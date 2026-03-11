export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNoticeboardPosts } from "@/lib/db/noticeboard";
import type { NoticeboardPost } from "@/lib/types";
import NoticeboardFeed from "@/components/noticeboard/NoticeboardFeed";
import { BottomNav } from "@/components/board/BottomNav";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get current player info for the feed
  const { data: player } = await supabase
    .from("players")
    .select("id, venue_id, role")
    .eq("user_id", user.id)
    .single();

  const venueId = player?.venue_id ?? null;
  const currentPlayerId = player?.id ?? null;
  const isAdmin = player?.role === "admin";

  // Fetch initial posts server-side
  let initialPosts: NoticeboardPost[] = [];
  if (venueId) {
    try {
      initialPosts = await getNoticeboardPosts(venueId, { limit: 20 });
    } catch {
      // Feed will load empty and client-side will retry
    }
  }

  return (
    <div className="min-h-screen bg-animated-gradient pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 glass border-b border-zinc-200 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Link
              href="/board"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Noticeboard</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-10">
            Club announcements, results & updates
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {venueId ? (
          <NoticeboardFeed
            initialPosts={initialPosts}
            currentPlayerId={currentPlayerId}
            isAdmin={isAdmin}
            venueId={venueId}
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">
              Join a venue to see the noticeboard
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
              The noticeboard shows updates from your home venue.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
