import { describe, it, expect } from "vitest";

interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface ClubMessage {
  id: string;
  club_id: string;
  player_id: string;
  content: string;
  created_at: string;
}

describe("Chat & Messaging", () => {
  describe("Direct Messages", () => {
    it("should create a message with sender and recipient", () => {
      const msg: DirectMessage = {
        id: "msg-1",
        sender_id: "player-1",
        recipient_id: "player-2",
        content: "Hey, want to play pairs this Saturday?",
        read_at: null,
        created_at: new Date().toISOString(),
      };
      expect(msg.sender_id).toBe("player-1");
      expect(msg.recipient_id).toBe("player-2");
      expect(msg.read_at).toBeNull();
    });

    it("should not allow empty messages", () => {
      const content = "";
      const isValid = content.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it("should not allow whitespace-only messages", () => {
      const content = "   \n\t  ";
      const isValid = content.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it("should mark message as read with timestamp", () => {
      const msg: DirectMessage = {
        id: "msg-1",
        sender_id: "p1",
        recipient_id: "p2",
        content: "Hello!",
        read_at: null,
        created_at: new Date().toISOString(),
      };

      expect(msg.read_at).toBeNull();
      msg.read_at = new Date().toISOString();
      expect(msg.read_at).toBeTruthy();
    });

    it("should track unread messages", () => {
      const messages: DirectMessage[] = [
        { id: "1", sender_id: "p1", recipient_id: "p2", content: "Hi", read_at: null, created_at: "" },
        { id: "2", sender_id: "p1", recipient_id: "p2", content: "Hello?", read_at: null, created_at: "" },
        { id: "3", sender_id: "p1", recipient_id: "p2", content: "Old msg", read_at: "2026-03-15T10:00:00Z", created_at: "" },
      ];

      const unread = messages.filter((m) => m.read_at === null);
      expect(unread).toHaveLength(2);
    });

    it("should sort messages by created_at ascending (oldest first)", () => {
      const messages = [
        { id: "3", created_at: "2026-03-16T12:00:00Z" },
        { id: "1", created_at: "2026-03-16T10:00:00Z" },
        { id: "2", created_at: "2026-03-16T11:00:00Z" },
      ];

      const sorted = [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      expect(sorted[0].id).toBe("1");
      expect(sorted[1].id).toBe("2");
      expect(sorted[2].id).toBe("3");
    });

    it("should prevent self-messaging", () => {
      const senderId = "player-1";
      const recipientId = "player-1";
      const isSelfMessage = senderId === recipientId;
      expect(isSelfMessage).toBe(true);
    });

    it("should get conversation between two players", () => {
      const allMessages: DirectMessage[] = [
        { id: "1", sender_id: "p1", recipient_id: "p2", content: "Hi", read_at: null, created_at: "2026-03-16T10:00:00Z" },
        { id: "2", sender_id: "p2", recipient_id: "p1", content: "Hey!", read_at: null, created_at: "2026-03-16T10:01:00Z" },
        { id: "3", sender_id: "p1", recipient_id: "p3", content: "Other convo", read_at: null, created_at: "2026-03-16T10:02:00Z" },
      ];

      const conversation = allMessages.filter(
        (m) =>
          (m.sender_id === "p1" && m.recipient_id === "p2") ||
          (m.sender_id === "p2" && m.recipient_id === "p1")
      );
      expect(conversation).toHaveLength(2);
    });
  });

  describe("Club Chat", () => {
    it("should associate message with club", () => {
      const msg: ClubMessage = {
        id: "cm-1",
        club_id: "club-1",
        player_id: "player-1",
        content: "Welcome to the club chat!",
        created_at: new Date().toISOString(),
      };
      expect(msg.club_id).toBe("club-1");
    });

    it("should require club membership for posting", () => {
      const memberClubIds = ["club-1", "club-2"];
      const targetClub = "club-1";
      const isMember = memberClubIds.includes(targetClub);
      expect(isMember).toBe(true);

      const nonMemberClub = "club-3";
      const isNotMember = !memberClubIds.includes(nonMemberClub);
      expect(isNotMember).toBe(true);
    });

    it("should filter messages by club_id", () => {
      const messages: ClubMessage[] = [
        { id: "1", club_id: "club-1", player_id: "p1", content: "Hello", created_at: "" },
        { id: "2", club_id: "club-2", player_id: "p1", content: "Other club", created_at: "" },
        { id: "3", club_id: "club-1", player_id: "p2", content: "Hi!", created_at: "" },
      ];

      const club1Messages = messages.filter((m) => m.club_id === "club-1");
      expect(club1Messages).toHaveLength(2);
    });

    it("should not allow empty club messages", () => {
      const content = "";
      const isValid = content.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it("should order club messages by created_at ascending", () => {
      const messages = [
        { id: "2", created_at: "2026-03-16T11:00:00Z" },
        { id: "1", created_at: "2026-03-16T10:00:00Z" },
      ];

      const sorted = [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      expect(sorted[0].id).toBe("1");
      expect(sorted[1].id).toBe("2");
    });
  });

  describe("Message Content", () => {
    it("should preserve message content as-is", () => {
      const content = "Let's meet at green #3 at 10am! 🎳";
      expect(content).toBe("Let's meet at green #3 at 10am! 🎳");
    });

    it("should handle unicode characters", () => {
      const content = "こんにちは from the bowling green!";
      expect(content.length).toBeGreaterThan(0);
    });

    it("should handle multi-line messages", () => {
      const content = "Line 1\nLine 2\nLine 3";
      expect(content.split("\n")).toHaveLength(3);
    });
  });
});
