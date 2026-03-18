export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getFriends, getPendingRequests } from "@/lib/db/friends";
import { BottomNav } from "@/components/board/BottomNav";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FriendsPageClient } from "./FriendsPageClient";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);
  if (!player) redirect("/profile/setup");

  const [friends, pendingRequests] = await Promise.all([
    getFriends(player.id),
    getPendingRequests(player.id),
  ]);

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 glass border-b border-[#0A2E12]/10">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Link
              href="/board"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#3D5A3E] hover:text-[#0A2E12] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Friends</h1>
          </div>
          <p className="text-sm text-[#3D5A3E] ml-10">
            {friends.length} friend{friends.length !== 1 ? "s" : ""}
            {pendingRequests.length > 0 &&
              ` \u00b7 ${pendingRequests.length} pending`}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <FriendsPageClient
          friends={friends}
          pendingRequests={pendingRequests}
          currentPlayerId={player.id}
        />
      </div>

      <BottomNav />
    </div>
  );
}
