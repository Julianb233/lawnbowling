"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Player, Sport, SkillLevel } from "@/lib/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface UseRealtimePlayersOptions {
  sportFilter?: Sport | null;
  skillFilter?: SkillLevel | null;
}

export function useRealtimePlayers(options: UseRealtimePlayersOptions = {}) {
  const { sportFilter, skillFilter } = options;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchPlayers = useCallback(async () => {
    const supabase = supabaseRef.current;
    let query = supabase
      .from("players")
      .select("*")
      .eq("is_available", true)
      .order("checked_in_at", { ascending: false });

    if (sportFilter) {
      query = query.contains("sports", [sportFilter]);
    }

    if (skillFilter) {
      query = query.eq("skill_level", skillFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPlayers(data as Player[]);
    }
    setLoading(false);
  }, [sportFilter, skillFilter]);

  useEffect(() => {
    fetchPlayers();

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel("players-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newRecord = payload.new as Player | undefined;
          const oldRecord = payload.old as { id?: string } | undefined;

          if (payload.eventType === "INSERT" && newRecord?.is_available) {
            if (sportFilter && !newRecord.sports?.includes(sportFilter)) return;
            if (skillFilter && newRecord.skill_level !== skillFilter) return;
            setPlayers((prev) => [newRecord, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            if (newRecord && !newRecord.is_available) {
              setPlayers((prev) => prev.filter((p) => p.id !== newRecord.id));
            } else if (newRecord?.is_available) {
              if (sportFilter && !newRecord.sports?.includes(sportFilter)) {
                setPlayers((prev) => prev.filter((p) => p.id !== newRecord.id));
                return;
              }
              if (skillFilter && newRecord.skill_level !== skillFilter) {
                setPlayers((prev) => prev.filter((p) => p.id !== newRecord.id));
                return;
              }
              setPlayers((prev) => {
                const exists = prev.find((p) => p.id === newRecord.id);
                if (exists) {
                  return prev.map((p) => (p.id === newRecord.id ? newRecord : p));
                }
                return [newRecord, ...prev];
              });
            }
          } else if (payload.eventType === "DELETE" && oldRecord?.id) {
            setPlayers((prev) => prev.filter((p) => p.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPlayers, sportFilter, skillFilter]);

  return { players, loading, refetch: fetchPlayers };
}
