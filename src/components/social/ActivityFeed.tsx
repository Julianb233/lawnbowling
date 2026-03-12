"use client";

import type { ActivityItem } from "@/lib/types";
import { ClipboardCheck, Trophy, UserPlus, CalendarClock, Radio, Bell, type LucideIcon } from "lucide-react";

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

const TYPE_CONFIG: Record<string, { icon: LucideIcon; verb: string }> = {
  check_in: { icon: ClipboardCheck, verb: "checked in" },
  match_complete: { icon: Trophy, verb: "finished a match" },
  new_player: { icon: UserPlus, verb: "joined" },
  scheduled_game: { icon: CalendarClock, verb: "scheduled a game" },
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl glass p-8 text-center">
        <Radio className="w-8 h-8 mx-auto mb-2 text-[#3D5A3E]" strokeWidth={1.5} />
        <p className="text-[#3D5A3E]">No activity yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const config = TYPE_CONFIG[item.type] || {
          icon: Bell,
          verb: "did something",
        };
        const meta = item.metadata as Record<string, string>;

        return (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-xl glass p-3"
          >
            <config.icon className="w-5 h-5 mt-0.5 text-[#3D5A3E] shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#2D4A30]">
                <span className="font-medium text-[#0A2E12]">
                  {item.player?.display_name || "Someone"}
                </span>{" "}
                {config.verb}
                {meta?.sport && (
                  <span className="text-[#3D5A3E]"> for {meta.sport}</span>
                )}
                {meta?.title && (
                  <span className="text-[#3D5A3E]">: {meta.title}</span>
                )}
              </p>
              <p className="text-xs text-[#3D5A3E] mt-0.5">
                {timeAgo(item.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
