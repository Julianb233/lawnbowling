import { createClient } from "@/lib/supabase/server";
import type { ClubRole } from "@/lib/types";
import { CLUB_ROLE_HIERARCHY } from "@/lib/types";

/**
 * Check if the current user has at least the required role at a club.
 * Returns the membership if authorized, null otherwise.
 */
export async function getClubMembership(clubId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!player) return null;

  const { data: membership } = await supabase
    .from("club_memberships")
    .select("*")
    .eq("club_id", clubId)
    .eq("player_id", player.id)
    .eq("status", "active")
    .single();

  return membership as { id: string; role: ClubRole; player_id: string } | null;
}

/**
 * Require the current user to have at least one of the specified roles at a club.
 * Returns { authorized: true, membership } or { authorized: false, error }.
 */
export async function requireClubRole(
  clubId: string,
  allowedRoles: ClubRole[]
): Promise<
  | { authorized: true; membership: { id: string; role: ClubRole; player_id: string } }
  | { authorized: false; error: string; status: number }
> {
  const membership = await getClubMembership(clubId);

  if (!membership) {
    return { authorized: false, error: "Not a member of this club", status: 403 };
  }

  if (!allowedRoles.includes(membership.role)) {
    return {
      authorized: false,
      error: `Requires role: ${allowedRoles.join(" or ")}. Your role: ${membership.role}`,
      status: 403,
    };
  }

  return { authorized: true, membership };
}

/**
 * Check if role A has higher or equal privilege than role B.
 */
export function hasHigherOrEqualRole(roleA: ClubRole, roleB: ClubRole): boolean {
  return CLUB_ROLE_HIERARCHY[roleA] >= CLUB_ROLE_HIERARCHY[roleB];
}
