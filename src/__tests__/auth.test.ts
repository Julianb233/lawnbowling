import { describe, it, expect } from "vitest";

describe("Auth Validation", () => {
  it("should validate email format", () => {
    const validEmails = ["test@example.com", "user.name@domain.org", "user+tag@email.com"];
    const invalidEmails = ["", "notanemail", "@nodomain", "no@", "spaces in@email.com"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it("should validate password strength", () => {
    function isStrongPassword(password: string): boolean {
      return password.length >= 6;
    }

    expect(isStrongPassword("short")).toBe(false);
    expect(isStrongPassword("")).toBe(false);
    expect(isStrongPassword("validpassword")).toBe(true);
    expect(isStrongPassword("123456")).toBe(true);
  });

  it("should validate display name", () => {
    function isValidDisplayName(name: string): boolean {
      const trimmed = name.trim();
      return trimmed.length >= 2 && trimmed.length <= 50;
    }

    expect(isValidDisplayName("")).toBe(false);
    expect(isValidDisplayName("A")).toBe(false);
    expect(isValidDisplayName("Al")).toBe(true);
    expect(isValidDisplayName("Valid Name")).toBe(true);
    expect(isValidDisplayName("A".repeat(51))).toBe(false);
  });
});
