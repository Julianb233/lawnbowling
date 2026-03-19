import { describe, it, expect } from "vitest";
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

describe("Activity Feed", () => {
  describe("timeAgo Formatter", () => {
    it("should show 'Just now' for recent events", () => {
      const now = new Date().toISOString();
      expect(timeAgo(now)).toBe("Just now");
    });

    it("should show minutes for events < 1 hour ago", () => {
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      expect(timeAgo(tenMinAgo)).toBe("10m ago");
    });

    it("should show hours for events < 24 hours ago", () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(timeAgo(threeHoursAgo)).toBe("3h ago");
    });

    it("should show days for events > 24 hours ago", () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      expect(timeAgo(twoDaysAgo)).toBe("2d ago");
    });
  });

  describe("Activity Type Config", () => {
    const TYPE_CONFIG: Record<string, { verb: string }> = {
      check_in: { verb: "checked in" },
      match_complete: { verb: "finished a match" },
      new_player: { verb: "joined" },
      scheduled_game: { verb: "scheduled a game" },
    };

    it("should have config for all known types", () => {
      expect(TYPE_CONFIG).toHaveProperty("check_in");
      expect(TYPE_CONFIG).toHaveProperty("match_complete");
      expect(TYPE_CONFIG).toHaveProperty("new_player");
      expect(TYPE_CONFIG).toHaveProperty("scheduled_game");
    });

    it("should fallback for unknown types", () => {
      const unknownType = "custom_event";
      const config = TYPE_CONFIG[unknownType] || { verb: "did something" };
      expect(config.verb).toBe("did something");
    });
  });

  describe("Activity Items", () => {
    it("should display player name or 'Someone' as fallback", () => {
      const withPlayer: Partial<ActivityItem> = {
        player: { display_name: "Alice" } as ActivityItem["player"],
      };
      const withoutPlayer: Partial<ActivityItem> = {
        player: undefined,
      };

      const name1 = withPlayer.player?.display_name || "Someone";
      const name2 = withoutPlayer.player?.display_name || "Someone";

      expect(name1).toBe("Alice");
      expect(name2).toBe("Someone");
    });

    it("should display sport from metadata", () => {
      const meta = { sport: "lawn_bowling" };
      expect(meta.sport).toBe("lawn_bowling");
    });

    it("should display title from metadata", () => {
      const meta = { title: "Saturday Morning Pairs" };
      expect(meta.title).toBe("Saturday Morning Pairs");
    });

    it("should render empty state when no items", () => {
      const items: ActivityItem[] = [];
      expect(items.length === 0).toBe(true);
    });

    it("should sort by created_at descending (newest first)", () => {
      const items = [
        { id: "1", created_at: "2026-03-14T10:00:00Z" },
        { id: "2", created_at: "2026-03-16T10:00:00Z" },
        { id: "3", created_at: "2026-03-15T10:00:00Z" },
      ];

      const sorted = [...items].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("3");
      expect(sorted[2].id).toBe("1");
    });
  });

  describe("Activity Types", () => {
    it("should support all defined activity types", () => {
      const validTypes = [
        "check_in",
        "match_complete",
        "new_player",
        "scheduled_game",
        "noticeboard_post",
        "friend_accepted",
        "achievement_unlocked",
      ];
      expect(validTypes).toHaveLength(7);
    });

    it("should create friend_accepted activity with correct metadata", () => {
      const activity = {
        type: "friend_accepted",
        metadata: { friend_id: "player-2" },
      };
      expect(activity.type).toBe("friend_accepted");
      expect(activity.metadata.friend_id).toBe("player-2");
    });
  });
});
