import { describe, it, expect } from "vitest";

describe("Waitlist Logic", () => {
  it("should assign incrementing positions", () => {
    const waitlist: Array<{ player_id: string; position: number }> = [];

    function addToWaitlist(playerId: string) {
      const position = waitlist.length + 1;
      waitlist.push({ player_id: playerId, position });
      return position;
    }

    expect(addToWaitlist("p1")).toBe(1);
    expect(addToWaitlist("p2")).toBe(2);
    expect(addToWaitlist("p3")).toBe(3);
    expect(waitlist).toHaveLength(3);
  });

  it("should notify first in line when court opens", () => {
    const waitlist = [
      { player_id: "p1", position: 1, status: "waiting" as string },
      { player_id: "p2", position: 2, status: "waiting" as string },
      { player_id: "p3", position: 3, status: "waiting" as string },
    ];

    const next = waitlist.find((w) => w.status === "waiting");
    expect(next?.player_id).toBe("p1");

    if (next) next.status = "notified";

    const nextNext = waitlist.find((w) => w.status === "waiting");
    expect(nextNext?.player_id).toBe("p2");
  });

  it("should handle player leaving waitlist", () => {
    const waitlist = [
      { player_id: "p1", position: 1, status: "waiting" as string },
      { player_id: "p2", position: 2, status: "waiting" as string },
    ];

    waitlist[0].status = "expired";

    const active = waitlist.filter((w) => w.status === "waiting");
    expect(active).toHaveLength(1);
    expect(active[0].player_id).toBe("p2");
  });

  it("should prevent duplicate entries", () => {
    const waitlist: Array<{ player_id: string }> = [{ player_id: "p1" }];

    function canJoin(playerId: string): boolean {
      return !waitlist.some((w) => w.player_id === playerId);
    }

    expect(canJoin("p1")).toBe(false);
    expect(canJoin("p2")).toBe(true);
  });

  it("should recompact positions after removal", () => {
    const waitlist = [
      { player_id: "p1", position: 1, status: "waiting" as string },
      { player_id: "p2", position: 2, status: "waiting" as string },
      { player_id: "p3", position: 3, status: "waiting" as string },
      { player_id: "p4", position: 4, status: "waiting" as string },
    ];

    waitlist[1].status = "expired";

    const active = waitlist
      .filter((w) => w.status === "waiting")
      .sort((a, b) => a.position - b.position);

    active.forEach((entry, i) => {
      entry.position = i + 1;
    });

    expect(active[0]).toMatchObject({ player_id: "p1", position: 1 });
    expect(active[1]).toMatchObject({ player_id: "p3", position: 2 });
    expect(active[2]).toMatchObject({ player_id: "p4", position: 3 });
  });

  it("should promote next entry from waitlist when court frees up", () => {
    const waitlist = [
      { player_id: "p1", position: 1, status: "waiting" as string },
      { player_id: "p2", position: 2, status: "waiting" as string },
    ];

    const promoted = waitlist.find((w) => w.status === "waiting");
    expect(promoted?.player_id).toBe("p1");
    if (promoted) promoted.status = "assigned";

    const remaining = waitlist.filter((w) => w.status === "waiting");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].player_id).toBe("p2");
    remaining[0].position = 1;
    expect(remaining[0].position).toBe(1);
  });

  it("should estimate wait time based on position and court count", () => {
    const avgMatchDuration = 20;

    function estimateWait(position: number, courtCount: number): number {
      return Math.ceil((position / courtCount) * avgMatchDuration);
    }

    expect(estimateWait(1, 1)).toBe(20);
    expect(estimateWait(1, 2)).toBe(10);
    expect(estimateWait(3, 2)).toBe(30);
    expect(estimateWait(4, 4)).toBe(20);
  });

  it("should format estimated wait time for display", () => {
    function formatWait(minutes: number | null): string {
      if (minutes == null || minutes <= 0) return "Next up";
      if (minutes < 60) return `~${minutes} min`;
      const hours = Math.floor(minutes / 60);
      const remaining = minutes % 60;
      return remaining > 0 ? `~${hours}h ${remaining}m` : `~${hours}h`;
    }

    expect(formatWait(null)).toBe("Next up");
    expect(formatWait(0)).toBe("Next up");
    expect(formatWait(15)).toBe("~15 min");
    expect(formatWait(45)).toBe("~45 min");
    expect(formatWait(60)).toBe("~1h");
    expect(formatWait(75)).toBe("~1h 15m");
  });
});
