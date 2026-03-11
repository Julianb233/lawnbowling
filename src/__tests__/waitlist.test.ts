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

  it("should recompact positions after player leaves", () => {
    const waitlist = [
      { player_id: "p1", position: 1, status: "waiting" as string },
      { player_id: "p2", position: 2, status: "waiting" as string },
      { player_id: "p3", position: 3, status: "waiting" as string },
    ];

    waitlist[0].status = "expired";

    const active = waitlist
      .filter((w) => w.status === "waiting")
      .map((w, i) => ({ ...w, position: i + 1 }));

    expect(active[0].player_id).toBe("p2");
    expect(active[0].position).toBe(1);
    expect(active[1].player_id).toBe("p3");
    expect(active[1].position).toBe(2);
  });

  it("should promote first waiting entry when court frees", () => {
    const waitlist = [
      { player_id: "p1", partner_id: "p4", position: 1, status: "waiting" as string, assigned_match_id: null as string | null },
      { player_id: "p2", partner_id: null, position: 2, status: "waiting" as string, assigned_match_id: null as string | null },
      { player_id: "p3", partner_id: null, position: 3, status: "waiting" as string, assigned_match_id: null as string | null },
    ];

    function promoteNext(): { player_id: string; partner_id: string | null } | null {
      const next = waitlist.find((w) => w.status === "waiting");
      if (!next) return null;
      next.status = "assigned";
      next.assigned_match_id = "match-123";
      return { player_id: next.player_id, partner_id: next.partner_id };
    }

    const promoted = promoteNext();
    expect(promoted?.player_id).toBe("p1");
    expect(promoted?.partner_id).toBe("p4");

    const promoted2 = promoteNext();
    expect(promoted2?.player_id).toBe("p2");
    expect(promoted2?.partner_id).toBeNull();

    const remaining = waitlist.filter((w) => w.status === "waiting");
    expect(remaining).toHaveLength(1);
    expect(remaining[0].player_id).toBe("p3");
  });

  it("should calculate estimated wait time based on position and courts", () => {
    const avgDuration = 20;
    const totalCourts = 3;

    function estimateWait(position: number): number {
      const groupsAhead = position - 1;
      const roundsAhead = Math.floor(groupsAhead / totalCourts);
      return roundsAhead * avgDuration;
    }

    expect(estimateWait(1)).toBe(0);
    expect(estimateWait(2)).toBe(0);
    expect(estimateWait(3)).toBe(0);
    expect(estimateWait(4)).toBe(20);
    expect(estimateWait(7)).toBe(40);
  });

  it("should format wait time display correctly", () => {
    function formatWaitTime(minutes: number): string {
      if (minutes <= 0) return "Next up";
      if (minutes < 2) return "~1 min";
      if (minutes < 60) return "~" + minutes + " min";
      const hours = Math.floor(minutes / 60);
      const remaining = minutes % 60;
      if (remaining === 0) return "~" + hours + "h";
      return "~" + hours + "h " + remaining + "m";
    }

    expect(formatWaitTime(0)).toBe("Next up");
    expect(formatWaitTime(1)).toBe("~1 min");
    expect(formatWaitTime(15)).toBe("~15 min");
    expect(formatWaitTime(60)).toBe("~1h");
    expect(formatWaitTime(90)).toBe("~1h 30m");
  });
});
