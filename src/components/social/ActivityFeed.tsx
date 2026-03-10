"use client";

import type { ActivityItem } from "@/lib/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_CONFIG: Record<string, { icon: string; verb: string }> = {
  check_in: { icon: "\uD83D\uDCCD", verb: "checked in" },
  match_complete: { icon: "\uD83C\uDFC6", verb: "finished a match" },
  new_player: { icon: "\uD83C\uDF1F", verb: "joined" },
  scheduled_game: { icon: "\uD83D\uDCC5", verb: "scheduled a game" },
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl glass p-8 text-center">
        <p className="text-3xl mb-2">{"\uD83D\uDCE1"}</p>
        <p className="text-zinc-400">No activity yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const config = TYPE_CONFIG[item.type] || {
          icon: "\uD83D\uDD14",
          verb: "did something",
        };
        const meta = item.metadata as Record<string, string>;

        return (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-xl glass p-3"
          >
            <span className="text-xl mt-0.5">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200">
                <span className="font-medium text-zinc-100">
                  {item.player?.name || "Someone"}
                </span>{" "}
                {config.verb}
                {meta?.sport && (
                  <span className="text-zinc-400"> for {meta.sport}</span>
                )}
                {meta?.title && (
                  <span className="text-zinc-400">: {meta.title}</span>
                )}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {timeAgo(item.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
