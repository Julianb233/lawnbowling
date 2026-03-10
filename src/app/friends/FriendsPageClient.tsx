"use client";

import { useRouter } from "next/navigation";
import type { Friendship } from "@/lib/types";
import { FriendsList } from "@/components/social/FriendsList";
import { FriendRequests } from "@/components/social/FriendRequests";

interface FriendsPageClientProps {
  friends: Friendship[];
  pendingRequests: Friendship[];
  currentPlayerId: string;
}

export function FriendsPageClient({
  friends,
  pendingRequests,
  currentPlayerId,
}: FriendsPageClientProps) {
  const router = useRouter();

  return (
    <>
      <FriendRequests
        requests={pendingRequests}
        onRespond={() => router.refresh()}
      />
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Friends ({friends.length})
        </h3>
        <FriendsList friends={friends} currentPlayerId={currentPlayerId} />
      </div>
    </>
  );
}
