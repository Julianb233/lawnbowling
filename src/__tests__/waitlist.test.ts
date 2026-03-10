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

    // Notify first
    const next = waitlist.find((w) => w.status === "waiting");
    expect(next?.player_id).toBe("p1");

    if (next) next.status = "notified";

    // Next should be p2
    const nextNext = waitlist.find((w) => w.status === "waiting");
    expect(nextNext?.player_id).toBe("p2");
  });

  it("should handle player leaving waitlist", () => {
    const waitlist = [
      { player_id: "p1", position: 1, status: "waiting" as string },
      { player_id: "p2", position: 2, status: "waiting" as string },
    ];

    // p1 leaves
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
});
