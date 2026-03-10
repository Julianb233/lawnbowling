"use client";

import { useTransition } from "react";
import type { Friendship } from "@/lib/types";

interface FriendRequestsProps {
  requests: Friendship[];
  onRespond?: () => void;
}

export function FriendRequests({ requests, onRespond }: FriendRequestsProps) {
  const [isPending, startTransition] = useTransition();

  function respond(requestId: string, accept: boolean) {
    startTransition(async () => {
      await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, accept }),
      });
      onRespond?.();
    });
  }

  if (requests.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Pending Requests ({requests.length})
      </h3>
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex items-center gap-3 rounded-xl glass p-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
            {req.player?.display_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">
              {req.player?.display_name || "Unknown"}
            </p>
            <p className="text-xs text-zinc-500">Wants to be friends</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => respond(req.id, true)}
              disabled={isPending}
              className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => respond(req.id, false)}
              disabled={isPending}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
