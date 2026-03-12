export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNoticeboardPosts } from "@/lib/db/noticeboard";
import type { NoticeboardPost } from "@/lib/types";
import NoticeboardFeed from "@/components/noticeboard/NoticeboardFeed";
import { BottomNav } from "@/components/board/BottomNav";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Users, Trophy, UserPlus } from "lucide-react";

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

  // Fetch recent social activity (graceful — table may not exist in all envs)
  let activityItems: Array<{ id: string; type: string; metadata: Record<string, unknown> | null; created_at: string; player: unknown }> = [];
  try {
    const { data: recentActivity } = await supabase
      .from("activity_feed")
      .select("id, type, metadata, created_at, player:players(id, display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(10);
    activityItems = (recentActivity ?? []) as typeof activityItems;
  } catch {
    // table may not exist
  }

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Hero banner */}
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src="/images/community-bonding.png"
          alt="Community bonding on the green"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E12]/70 to-[#0A2E12]/40" />
        <div className="absolute inset-0 flex items-end px-4 pb-4">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/board"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#A8D5BA] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white tracking-tight">
                Activity
              </h1>
            </div>
            <p className="text-sm text-[#A8D5BA] ml-10">
              Club announcements, results & social updates
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-4 space-y-6">
        {/* Quick social links */}
        <div className="flex gap-2">
          <Link
            href="/friends"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-[#0A2E12]/10 px-3 py-2.5 text-xs font-medium text-[#1B5E20] hover:bg-[#F0FFF4] transition-colors shadow-sm"
          >
            <Users className="h-3.5 w-3.5" /> Friends
          </Link>
          <Link
            href="/chat"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-[#0A2E12]/10 px-3 py-2.5 text-xs font-medium text-[#1B5E20] hover:bg-[#F0FFF4] transition-colors shadow-sm"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Messages
          </Link>
          <Link
            href="/tournament"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-[#0A2E12]/10 px-3 py-2.5 text-xs font-medium text-[#1B5E20] hover:bg-[#F0FFF4] transition-colors shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5" /> Tourneys
          </Link>
        </div>

        {/* Social activity summary */}
        {activityItems.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">
              Recent Activity
            </h2>
            <div className="space-y-2">
              {activityItems.map((item) => {
                const meta = (item.metadata ?? {}) as Record<string, string>;
                const playerRaw = item.player as unknown;
                const playerData = (Array.isArray(playerRaw) ? playerRaw[0] : playerRaw) as { id: string; display_name: string; avatar_url: string | null } | null;
                const iconMap: Record<string, typeof Trophy> = {
                  match_complete: Trophy,
                  new_player: UserPlus,
                  scheduled_game: Users,
                };
                const verbMap: Record<string, string> = {
                  check_in: "checked in",
                  match_complete: "finished a match",
                  new_player: "joined the club",
                  scheduled_game: "scheduled a game",
                };
                const Icon = iconMap[item.type] ?? Users;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl bg-white border border-[#0A2E12]/10 p-3 shadow-sm"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10">
                      <Icon className="h-4 w-4 text-[#1B5E20]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#3D5A3E]">
                        <span className="font-semibold text-[#0A2E12]">
                          {playerData?.display_name ?? "Someone"}
                        </span>{" "}
                        {verbMap[item.type] ?? "did something"}
                        {meta?.sport && (
                          <span className="text-[#3D5A3E]/70"> for {meta.sport}</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Noticeboard section */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">
            Noticeboard
          </h2>
          {venueId ? (
            <NoticeboardFeed
              initialPosts={initialPosts}
              currentPlayerId={currentPlayerId}
              isAdmin={isAdmin}
              venueId={venueId}
            />
          ) : (
            <div className="text-center py-12 rounded-xl bg-white border border-[#0A2E12]/10">
              <p className="text-sm font-medium text-[#3D5A3E]">
                Join a venue to see the noticeboard
              </p>
              <p className="text-xs text-[#3D5A3E]/60 mt-1">
                The noticeboard shows updates from your home venue.
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
