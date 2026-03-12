/**
 * Membership gate utilities for the Lawnbowling paywall system.
 *
 * Free users:  browse club directory, see 1 month of events, basic profile.
 * Paid members ($15/year or $5/month): full calendar, chat, push notifications,
 *   stats tracking, social features, priority support.
 */

export type MembershipTier = "free" | "monthly" | "annual";

export interface MembershipPlayer {
  membership_tier?: MembershipTier | null;
  membership_expires_at?: string | null;
}

/** Returns true if the player has an active paid membership (monthly or annual). */
export function isPaidMember(player: MembershipPlayer | null | undefined): boolean {
  if (!player) return false;
  const tier = player.membership_tier;
  if (tier !== "monthly" && tier !== "annual") return false;
  if (!player.membership_expires_at) return false;
  return new Date(player.membership_expires_at) > new Date();
}

/** Only paid members can view the full multi-month calendar. */
export function canAccessFullCalendar(player: MembershipPlayer | null | undefined): boolean {
  return isPaidMember(player);
}

/** Only paid members can access the chat feature. */
export function canAccessChat(player: MembershipPlayer | null | undefined): boolean {
  return isPaidMember(player);
}

/**
 * Filter events based on membership.  Free users only see events within the
 * current calendar month.  Paid members see everything.
 */
export function getVisibleEvents<T extends { date?: string; event_date?: string }>(
  player: MembershipPlayer | null | undefined,
  events: T[],
): T[] {
  if (isPaidMember(player)) return events;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return events.filter((event) => {
    const dateStr = event.date ?? event.event_date;
    if (!dateStr) return true;
    const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
}

/** Compute the membership expiration date from now for a given tier. */
export function computeExpiration(tier: "monthly" | "annual"): Date {
  const now = new Date();
  if (tier === "annual") {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now;
}
