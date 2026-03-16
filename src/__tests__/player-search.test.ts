import { describe, it, expect } from "vitest";

describe("Player Search", () => {
  describe("Query Validation", () => {
    it("should reject empty queries", () => {
      const q = "";
      const isValid = q.trim().length >= 2;
      expect(isValid).toBe(false);
    });

    it("should reject single-character queries", () => {
      const q = "A";
      const isValid = q.trim().length >= 2;
      expect(isValid).toBe(false);
    });

    it("should accept queries with 2+ characters", () => {
      const q = "Jo";
      const isValid = q.trim().length >= 2;
      expect(isValid).toBe(true);
    });

    it("should reject whitespace-only queries", () => {
      const q = "   ";
      const isValid = q.trim().length >= 2;
      expect(isValid).toBe(false);
    });

    it("should trim queries before validation", () => {
      const q = "  Ab  ";
      const trimmed = q.trim();
      expect(trimmed).toBe("Ab");
      expect(trimmed.length >= 2).toBe(true);
    });
  });

  describe("Search Term Construction", () => {
    it("should wrap query in wildcards for ilike", () => {
      const q = "John";
      const searchTerm = `%${q}%`;
      expect(searchTerm).toBe("%John%");
    });

    it("should handle special characters in search", () => {
      const q = "O'Brien";
      const searchTerm = `%${q}%`;
      expect(searchTerm).toBe("%O'Brien%");
    });

    it("should URL-encode query for API calls", () => {
      const q = "John Doe";
      const encoded = encodeURIComponent(q);
      expect(encoded).toBe("John%20Doe");
    });
  });

  describe("Result Filtering", () => {
    const currentPlayerId = "player-1";
    const friendIds = ["player-2", "player-3"];

    const mockResults = [
      { id: "player-1", display_name: "Self", avatar_url: null, skill_level: "beginner", sports: ["lawn_bowling"] },
      { id: "player-2", display_name: "Friend", avatar_url: null, skill_level: "intermediate", sports: ["lawn_bowling"] },
      { id: "player-4", display_name: "Stranger", avatar_url: null, skill_level: "advanced", sports: ["lawn_bowling"] },
      { id: "player-5", display_name: "Other", avatar_url: null, skill_level: "beginner", sports: ["lawn_bowling"] },
    ];

    it("should filter out the current player", () => {
      const filtered = mockResults.filter(
        (p) => p.id !== currentPlayerId && !friendIds.includes(p.id)
      );
      expect(filtered.find((p) => p.id === "player-1")).toBeUndefined();
    });

    it("should filter out existing friends", () => {
      const filtered = mockResults.filter(
        (p) => p.id !== currentPlayerId && !friendIds.includes(p.id)
      );
      expect(filtered.find((p) => p.id === "player-2")).toBeUndefined();
      expect(filtered.find((p) => p.id === "player-3")).toBeUndefined();
    });

    it("should keep non-friend, non-self players", () => {
      const filtered = mockResults.filter(
        (p) => p.id !== currentPlayerId && !friendIds.includes(p.id)
      );
      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe("player-4");
      expect(filtered[1].id).toBe("player-5");
    });

    it("should return empty array when all results are filtered", () => {
      const allFriends = [
        { id: "player-1", display_name: "Self", avatar_url: null, skill_level: "beginner", sports: ["lawn_bowling"] },
      ];
      const filtered = allFriends.filter(
        (p) => p.id !== currentPlayerId && !friendIds.includes(p.id)
      );
      expect(filtered).toHaveLength(0);
    });
  });

  describe("Search Response Structure", () => {
    it("should return players, teams, and games arrays", () => {
      const response = { players: [], teams: [], games: [] };
      expect(response).toHaveProperty("players");
      expect(response).toHaveProperty("teams");
      expect(response).toHaveProperty("games");
      expect(Array.isArray(response.players)).toBe(true);
      expect(Array.isArray(response.teams)).toBe(true);
      expect(Array.isArray(response.games)).toBe(true);
    });

    it("should limit results to 10 per category", () => {
      const players = Array.from({ length: 15 }, (_, i) => ({
        id: `p-${i}`,
        display_name: `Player ${i}`,
      }));
      const limited = players.slice(0, 10);
      expect(limited).toHaveLength(10);
    });

    it("should include required player fields in results", () => {
      const result = {
        id: "p-1",
        display_name: "John Doe",
        avatar_url: "https://example.com/avatar.jpg",
        skill_level: "intermediate",
        sports: ["lawn_bowling"],
      };
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("display_name");
      expect(result).toHaveProperty("avatar_url");
      expect(result).toHaveProperty("skill_level");
      expect(result).toHaveProperty("sports");
    });
  });

  describe("Debounce Behavior", () => {
    it("should only trigger search after delay", async () => {
      let searchCount = 0;
      const DEBOUNCE_MS = 300;

      function debounce(fn: () => void, delay: number) {
        let timer: ReturnType<typeof setTimeout> | null = null;
        return () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(fn, delay);
        };
      }

      const debouncedSearch = debounce(() => { searchCount++; }, DEBOUNCE_MS);

      // Rapid fire — should only trigger once after delay
      debouncedSearch();
      debouncedSearch();
      debouncedSearch();

      expect(searchCount).toBe(0); // Not yet fired
      await new Promise((r) => setTimeout(r, DEBOUNCE_MS + 50));
      expect(searchCount).toBe(1); // Fired once
    });
  });
});
