"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ClubRole } from "@/lib/types";
import { CLUB_ROLE_HIERARCHY } from "@/lib/types";

/**
 * Client-side hook to get the current user's role at a specific club.
 * Returns null if not a member, the role otherwise.
 */
export function useClubRole(clubId: string | null) {
  const [role, setRole] = useState<ClubRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      setRole(null);
      setLoading(false);
      return;
    }

    async function fetchRole() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!player) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: membership } = await supabase
        .from("club_memberships")
        .select("role")
        .eq("club_id", clubId)
        .eq("player_id", player.id)
        .eq("status", "active")
        .single();

      setRole(membership?.role as ClubRole ?? null);
      setLoading(false);
    }

    fetchRole();
  }, [clubId]);

  const hasRole = (requiredRoles: ClubRole[]) => {
    if (!role) return false;
    return requiredRoles.includes(role);
  };

  const hasMinRole = (minRole: ClubRole) => {
    if (!role) return false;
    return CLUB_ROLE_HIERARCHY[role] >= CLUB_ROLE_HIERARCHY[minRole];
  };

  return { role, loading, hasRole, hasMinRole };
}
