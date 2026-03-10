"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PartnerRequest } from "@/lib/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type SentRequestUpdate = {
  id: string;
  status: "accepted" | "declined" | "expired";
  targetName?: string;
  sport?: string;
};

/**
 * Watches outgoing partner requests for status changes.
 * Fires onStatusChange when a sent request is accepted, declined, or expired.
 */
export function useSentRequests(
  playerId: string | null,
  onStatusChange?: (update: SentRequestUpdate) => void
) {
  const [pendingSent, setPendingSent] = useState<PartnerRequest[]>([]);
  const supabase = createClient();

  const fetchSent = useCallback(async () => {
    if (!playerId) {
      setPendingSent([]);
      return;
    }

    const { data, error } = await supabase
      .from("partner_requests")
      .select("*")
      .eq("requester_id", playerId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPendingSent(data as PartnerRequest[]);
    }
  }, [playerId, supabase]);

  useEffect(() => {
    fetchSent();

    if (!playerId) return;

    const channel = supabase
      .channel(`sent-requests-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "partner_requests",
          filter: `requester_id=eq.${playerId}`,
        },
        async (payload: RealtimePostgresChangesPayload<PartnerRequest>) => {
          const updated = payload.new as PartnerRequest;
          if (updated.status !== "pending") {
            // Remove from pending list
            setPendingSent((prev) => prev.filter((r) => r.id !== updated.id));

            // Look up target player name for the notification
            let targetName: string | undefined;
            try {
              const { data } = await supabase
                .from("players")
                .select("display_name, name")
                .eq("id", updated.target_id)
                .single();
              if (data) {
                targetName = (data as { display_name?: string; name?: string }).display_name ||
                  (data as { display_name?: string; name?: string }).name ||
                  undefined;
              }
            } catch {
              // Ignore lookup errors
            }

            onStatusChange?.({
              id: updated.id,
              status: updated.status as "accepted" | "declined" | "expired",
              targetName,
              sport: updated.sport,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSent, playerId, supabase, onStatusChange]);

  return { pendingSent, refetch: fetchSent };
}
