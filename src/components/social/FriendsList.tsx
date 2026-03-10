"use client";

import Link from "next/link";
import type { Friendship, Player } from "@/lib/types";

interface FriendsListProps {
  friends: Friendship[];
  currentPlayerId: string;
}

export function FriendsList({ friends, currentPlayerId }: FriendsListProps) {
  if (friends.length === 0) {
    return (
      <div className="rounded-2xl glass p-8 text-center">
        <p className="text-3xl mb-2">{"\\uD83D\\uDC65"}</p>
        <p className="text-zinc-500">No friends yet. Start connecting!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map((f) => {
        const friendPlayer: Player | undefined =
          f.player_id === currentPlayerId ? f.friend : f.player;
        if (!friendPlayer) return null;

        return (
          <Link
            key={f.id}
            href={`/profile/${friendPlayer.id}`}
            className="flex items-center gap-3 rounded-xl glass p-3 hover:bg-zinc-50 transition-colors"
          >
            <div className="relative">
              {friendPlayer.avatar_url ? (
                <img
                  src={friendPlayer.avatar_url}
                  alt={friendPlayer.display_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-bold text-white">
                  {friendPlayer.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              {friendPlayer.is_available && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {friendPlayer.display_name}
              </p>
              <p className="text-xs text-zinc-500 capitalize">
                {friendPlayer.skill_level} &middot;{" "}
                {friendPlayer.is_available ? "Online" : "Offline"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
