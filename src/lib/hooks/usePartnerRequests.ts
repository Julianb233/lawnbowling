"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PartnerRequest, SkillLevel } from "@/lib/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface PartnerRequestWithRequester extends PartnerRequest {
  requester?: {
    id: string;
    display_name?: string;
    name?: string;
    avatar_url: string | null;
    skill_level: SkillLevel;
    sports: string[];
  };
}

export function usePartnerRequests(playerId: string | null) {
  const [requests, setRequests] = useState<PartnerRequestWithRequester[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchRequests = useCallback(async () => {
    if (!playerId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("partner_requests")
      .select("*, requester:players!requester_id(id, display_name, name, avatar_url, skill_level, sports)")
      .eq("target_id", playerId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data as PartnerRequestWithRequester[]);
    }
    setLoading(false);
  }, [playerId, supabase]);

  useEffect(() => {
    fetchRequests();

    if (!playerId) return;

    const channel = supabase
      .channel(`partner-requests-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "partner_requests",
          filter: `target_id=eq.${playerId}`,
        },
        (payload: RealtimePostgresChangesPayload<PartnerRequest>) => {
          const newRequest = payload.new as PartnerRequest;
          if (newRequest.status === "pending") {
            // Refetch to get the joined requester data
            fetchRequests();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "partner_requests",
          filter: `target_id=eq.${playerId}`,
        },
        (payload: RealtimePostgresChangesPayload<PartnerRequest>) => {
          const updated = payload.new as PartnerRequest;
          if (updated.status !== "pending") {
            setRequests((prev) => prev.filter((r) => r.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests, playerId, supabase]);

  return { requests, loading, refetch: fetchRequests };
}
