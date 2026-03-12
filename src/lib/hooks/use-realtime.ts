"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Match,
  BowlsCheckin,
  TournamentScore,
  ActivityItem,
} from "@/lib/types";
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Connection status tracking
// ---------------------------------------------------------------------------

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

function useConnectionStatus(channel: RealtimeChannel | null): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    if (!channel) {
      setStatus("disconnected");
      return;
    }

    const handleStatus = (state: string) => {
      switch (state) {
        case "SUBSCRIBED":
          setStatus("connected");
          break;
        case "CHANNEL_ERROR":
        case "TIMED_OUT":
          setStatus("reconnecting");
          break;
        case "CLOSED":
          setStatus("disconnected");
          break;
        default:
          // connecting / joining states
          setStatus("reconnecting");
      }
    };

    // The channel fires status callbacks via the subscribe return.
    // We track it through the channel's state directly on an interval
    // since @supabase/supabase-js v2 does not expose a generic
    // status event listener on the channel object itself.
    const interval = setInterval(() => {
      const state = (channel as unknown as { state?: string }).state;
      if (state === "joined") setStatus("connected");
      else if (state === "closed" || state === "errored") setStatus("disconnected");
      else setStatus("reconnecting");
    }, 2000);

    // Also call it once immediately
    handleStatus("connecting");

    return () => clearInterval(interval);
  }, [channel]);

  return status;
}

// ---------------------------------------------------------------------------
// useRealtimeMatches — subscribe to match status changes for a tournament
// ---------------------------------------------------------------------------

export function useRealtimeMatches(tournamentId: string | null) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!tournamentId) return;
    const supabase = supabaseRef.current;
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("venue_id", tournamentId)
      .in("status", ["queued", "playing", "completed"])
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMatches(data as Match[]);
    }
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId) return;
    fetchMatches();

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`matches-rt-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `venue_id=eq.${tournamentId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newRecord = payload.new as Match | undefined;
          const oldRecord = payload.old as { id?: string } | undefined;

          if (payload.eventType === "INSERT" && newRecord) {
            setMatches((prev) => [...prev, newRecord]);
          } else if (payload.eventType === "UPDATE" && newRecord) {
            setMatches((prev) =>
              prev.map((m) => (m.id === newRecord.id ? newRecord : m))
            );
          } else if (payload.eventType === "DELETE" && oldRecord?.id) {
            setMatches((prev) => prev.filter((m) => m.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [tournamentId, fetchMatches]);

  const connectionStatus = useConnectionStatus(channelRef.current);

  return { matches, loading, refetch: fetchMatches, connectionStatus };
}

// ---------------------------------------------------------------------------
// useRealtimeCheckins — subscribe to new bowls check-ins for a tournament
// ---------------------------------------------------------------------------

export function useRealtimeCheckins(tournamentId: string | null) {
  const [checkins, setCheckins] = useState<BowlsCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchCheckins = useCallback(async () => {
    if (!tournamentId) return;
    const supabase = supabaseRef.current;
    const { data, error } = await supabase
      .from("bowls_checkins")
      .select("*, player:players(id, display_name, avatar_url)")
      .eq("tournament_id", tournamentId)
      .order("checked_in_at", { ascending: false });

    if (!error && data) {
      setCheckins(data as BowlsCheckin[]);
    }
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId) return;
    fetchCheckins();

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`checkins-rt-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bowls_checkins",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newCheckin = payload.new as BowlsCheckin;
          // Fetch player info for the new check-in
          const { data: player } = await supabase
            .from("players")
            .select("id, display_name, avatar_url")
            .eq("id", newCheckin.player_id)
            .single();

          const enriched = player
            ? { ...newCheckin, player: player as BowlsCheckin["player"] }
            : newCheckin;

          setCheckins((prev) => [enriched, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bowls_checkins",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const old = payload.old as { id?: string } | undefined;
          if (old?.id) {
            setCheckins((prev) => prev.filter((c) => c.id !== old.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [tournamentId, fetchCheckins]);

  const connectionStatus = useConnectionStatus(channelRef.current);

  return { checkins, loading, refetch: fetchCheckins, connectionStatus };
}

// ---------------------------------------------------------------------------
// useRealtimeScores — subscribe to score updates for a specific match/rink
// ---------------------------------------------------------------------------

export function useRealtimeScores(matchId: string | null) {
  const [scores, setScores] = useState<TournamentScore[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchScores = useCallback(async () => {
    if (!matchId) return;
    const supabase = supabaseRef.current;
    const { data, error } = await supabase
      .from("tournament_scores")
      .select("*")
      .eq("tournament_id", matchId)
      .order("rink", { ascending: true });

    if (!error && data) {
      setScores(data as TournamentScore[]);
    }
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    fetchScores();

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`scores-rt-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_scores",
          filter: `tournament_id=eq.${matchId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newRecord = payload.new as TournamentScore | undefined;
          const oldRecord = payload.old as { id?: string } | undefined;

          if (payload.eventType === "INSERT" && newRecord) {
            setScores((prev) => [...prev, newRecord]);
          } else if (payload.eventType === "UPDATE" && newRecord) {
            setScores((prev) =>
              prev.map((s) => (s.id === newRecord.id ? newRecord : s))
            );
          } else if (payload.eventType === "DELETE" && oldRecord?.id) {
            setScores((prev) => prev.filter((s) => s.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [matchId, fetchScores]);

  const connectionStatus = useConnectionStatus(channelRef.current);

  return { scores, loading, refetch: fetchScores, connectionStatus };
}

// ---------------------------------------------------------------------------
// useRealtimeActivity — subscribe to activity feed for a venue
// ---------------------------------------------------------------------------

export function useRealtimeActivity(venueId: string | null) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!venueId) return;
    const supabase = supabaseRef.current;
    const { data, error } = await supabase
      .from("activity_feed")
      .select("*, player:players(*)")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setItems(data as ActivityItem[]);
    }
    setLoading(false);
  }, [venueId]);

  useEffect(() => {
    if (!venueId) return;
    fetchActivity();

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`activity-rt-${venueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_feed",
          filter: `venue_id=eq.${venueId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newItem = payload.new as ActivityItem;
          // Fetch player info
          if (newItem.player_id) {
            const { data: player } = await supabase
              .from("players")
              .select("*")
              .eq("id", newItem.player_id)
              .single();
            if (player) {
              newItem.player = player as ActivityItem["player"];
            }
          }
          setItems((prev) => [newItem, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [venueId, fetchActivity]);

  const connectionStatus = useConnectionStatus(channelRef.current);

  return { items, loading, refetch: fetchActivity, connectionStatus };
}
